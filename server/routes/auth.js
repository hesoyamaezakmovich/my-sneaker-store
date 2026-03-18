const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { v4: uuidv4 } = require('uuid')
const db = require('../db')
const { authenticate } = require('../middleware/auth')

const router = express.Router()
const JWT_SECRET = process.env.JWT_SECRET || 'rks-3d-marketplace-secret-key'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m'
const REFRESH_TOKEN_EXPIRES_DAYS = 30

const generateTokens = (user) => {
  const payload = { id: user.id, email: user.email, role: user.role }
  const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
  const refreshToken = uuidv4()
  return { accessToken, refreshToken }
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { email, password, firstName, lastName, role = 'buyer' } = req.body

  if (!email || !password) {
    return res.status(400).json({ error: 'Email и пароль обязательны' })
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Пароль должен содержать минимум 6 символов' })
  }
  const allowedRoles = ['buyer', 'author']
  if (!allowedRoles.includes(role)) {
    return res.status(400).json({ error: 'Недопустимая роль' })
  }

  try {
    const existing = await db.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()])
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Пользователь с таким email уже существует' })
    }

    const passwordHash = await bcrypt.hash(password, 12)
    const userResult = await db.query(
      'INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3) RETURNING id, email, role, created_at',
      [email.toLowerCase(), passwordHash, role]
    )
    const user = userResult.rows[0]

    // Обновляем профиль с именем
    if (firstName || lastName) {
      await db.query(
        'UPDATE profiles SET first_name = $1, last_name = $2, display_name = $3 WHERE id = $4',
        [firstName || null, lastName || null, [firstName, lastName].filter(Boolean).join(' ') || null, user.id]
      )
    }

    const { accessToken, refreshToken } = generateTokens(user)
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRES_DAYS * 24 * 60 * 60 * 1000)
    await db.query(
      'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
      [user.id, refreshToken, expiresAt]
    )

    const profileResult = await db.query('SELECT * FROM profiles WHERE id = $1', [user.id])
    const profile = profileResult.rows[0] || {}

    res.status(201).json({
      user: { ...user, profile },
      accessToken,
      refreshToken,
    })
  } catch (err) {
    console.error('Register error:', err)
    res.status(500).json({ error: 'Ошибка сервера при регистрации' })
  }
})

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) {
    return res.status(400).json({ error: 'Email и пароль обязательны' })
  }

  try {
    const userResult = await db.query(
      'SELECT id, email, password_hash, role, is_active FROM users WHERE email = $1',
      [email.toLowerCase()]
    )
    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'Неверный email или пароль' })
    }

    const user = userResult.rows[0]
    if (!user.is_active) {
      return res.status(403).json({ error: 'Аккаунт заблокирован' })
    }

    const passwordValid = await bcrypt.compare(password, user.password_hash)
    if (!passwordValid) {
      return res.status(401).json({ error: 'Неверный email или пароль' })
    }

    const { accessToken, refreshToken } = generateTokens(user)
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRES_DAYS * 24 * 60 * 60 * 1000)
    await db.query(
      'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
      [user.id, refreshToken, expiresAt]
    )

    const profileResult = await db.query('SELECT * FROM profiles WHERE id = $1', [user.id])
    const profile = profileResult.rows[0] || {}

    const { password_hash, ...userWithoutPassword } = user
    res.json({
      user: { ...userWithoutPassword, profile },
      accessToken,
      refreshToken,
    })
  } catch (err) {
    console.error('Login error:', err)
    res.status(500).json({ error: 'Ошибка сервера при входе' })
  }
})

// POST /api/auth/refresh
router.post('/refresh', async (req, res) => {
  const { refreshToken } = req.body
  if (!refreshToken) {
    return res.status(400).json({ error: 'Refresh token обязателен' })
  }

  try {
    const tokenResult = await db.query(
      'SELECT rt.*, u.id as user_id, u.email, u.role, u.is_active FROM refresh_tokens rt JOIN users u ON u.id = rt.user_id WHERE rt.token = $1 AND rt.expires_at > NOW()',
      [refreshToken]
    )
    if (tokenResult.rows.length === 0) {
      return res.status(401).json({ error: 'Недействительный refresh token' })
    }

    const row = tokenResult.rows[0]
    if (!row.is_active) {
      return res.status(403).json({ error: 'Аккаунт заблокирован' })
    }

    await db.query('DELETE FROM refresh_tokens WHERE token = $1', [refreshToken])

    const user = { id: row.user_id, email: row.email, role: row.role }
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user)
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRES_DAYS * 24 * 60 * 60 * 1000)
    await db.query(
      'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
      [user.id, newRefreshToken, expiresAt]
    )

    res.json({ accessToken, refreshToken: newRefreshToken })
  } catch (err) {
    console.error('Refresh error:', err)
    res.status(500).json({ error: 'Ошибка сервера' })
  }
})

// POST /api/auth/logout
router.post('/logout', authenticate, async (req, res) => {
  const { refreshToken } = req.body
  try {
    if (refreshToken) {
      await db.query('DELETE FROM refresh_tokens WHERE token = $1', [refreshToken])
    }
    res.json({ message: 'Вы успешно вышли из системы' })
  } catch (err) {
    console.error('Logout error:', err)
    res.status(500).json({ error: 'Ошибка сервера' })
  }
})

// GET /api/auth/me
router.get('/me', authenticate, async (req, res) => {
  try {
    const userResult = await db.query(
      'SELECT u.id, u.email, u.role, u.is_active, u.created_at, p.* FROM users u LEFT JOIN profiles p ON p.id = u.id WHERE u.id = $1',
      [req.user.id]
    )
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'Пользователь не найден' })
    }
    const { password_hash, ...user } = userResult.rows[0]
    res.json({ user })
  } catch (err) {
    console.error('Me error:', err)
    res.status(500).json({ error: 'Ошибка сервера' })
  }
})

// PATCH /api/auth/profile
router.patch('/profile', authenticate, async (req, res) => {
  const { firstName, lastName, displayName, bio, phone, websiteUrl } = req.body
  try {
    const result = await db.query(
      `UPDATE profiles SET
        first_name = COALESCE($1, first_name),
        last_name = COALESCE($2, last_name),
        display_name = COALESCE($3, display_name),
        bio = COALESCE($4, bio),
        phone = COALESCE($5, phone),
        website_url = COALESCE($6, website_url),
        updated_at = NOW()
       WHERE id = $7 RETURNING *`,
      [firstName, lastName, displayName, bio, phone, websiteUrl, req.user.id]
    )
    res.json({ profile: result.rows[0] })
  } catch (err) {
    console.error('Update profile error:', err)
    res.status(500).json({ error: 'Ошибка обновления профиля' })
  }
})

module.exports = router
