const jwt = require('jsonwebtoken')

const JWT_SECRET = process.env.JWT_SECRET || 'rks-3d-marketplace-secret-key'

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Требуется авторизация' })
  }

  const token = authHeader.split(' ')[1]
  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    req.user = decoded
    next()
  } catch {
    return res.status(401).json({ error: 'Недействительный или просроченный токен' })
  }
}

const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: 'Требуется авторизация' })
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ error: 'Недостаточно прав' })
  }
  next()
}

const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1]
    try {
      req.user = jwt.verify(token, JWT_SECRET)
    } catch {
      // ignore invalid token
    }
  }
  next()
}

module.exports = { authenticate, requireRole, optionalAuth }
