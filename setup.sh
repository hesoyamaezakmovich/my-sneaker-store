#!/bin/bash

echo "🚀 Начинаем установку RKS Marketplace..."

# Обновление системы
apt update && apt upgrade -y

# Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# PostgreSQL, Nginx, Git
apt install -y postgresql postgresql-contrib nginx git

# PM2
npm install -g pm2

# База данных
sudo -u postgres psql -c "CREATE USER rks_user WITH PASSWORD 'RksPassword123!';"
sudo -u postgres psql -c "CREATE DATABASE rks_3d_marketplace OWNER rks_user;"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE rks_3d_marketplace TO rks_user;"

# Клонирование проекта
git clone https://github.com/hesoyamaezakmovich/my-sneaker-store.git /home/user1/marketplace
chown -R user1:user1 /home/user1/marketplace

# Схема БД
sudo -u postgres psql -d rks_3d_marketplace < /home/user1/marketplace/database/schema.sql
sudo -u postgres psql -d rks_3d_marketplace -c "GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO rks_user;"
sudo -u postgres psql -d rks_3d_marketplace -c "GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO rks_user;"

# Зависимости бэкенда
cd /home/user1/marketplace/server && npm install

# .env файл
cat > /home/user1/marketplace/server/.env << EOF
PORT=3001
DB_HOST=localhost
DB_PORT=5432
DB_NAME=rks_3d_marketplace
DB_USER=rks_user
DB_PASSWORD=RksPassword123!
JWT_SECRET=RksJwtSuperSecretKey123456789012
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_DAYS=30
FRONTEND_URL=http://$(curl -s ifconfig.me)
DOWNLOAD_LINK_TTL_HOURS=72
EOF

# Зависимости фронтенда и сборка
cd /home/user1/marketplace && npm install
VITE_API_URL=http://$(curl -s ifconfig.me) npm run build

# Права на dist
chmod 755 /home/user1
chmod -R 755 /home/user1/marketplace/dist

# PM2
cd /home/user1/marketplace/server
sudo -u user1 pm2 start index.js --name rks-api
sudo -u user1 pm2 save
env PATH=$PATH:/usr/bin pm2 startup systemd -u user1 --hp /home/user1

# Nginx
cat > /etc/nginx/sites-available/marketplace << EOF
server {
    listen 80;
    server_name $(curl -s ifconfig.me);

    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
    }

    location / {
        root /home/user1/marketplace/dist;
        try_files \$uri \$uri/ /index.html;
    }
}
EOF

ln -sf /etc/nginx/sites-available/marketplace /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl restart nginx

# Seed
cd /home/user1/marketplace && node database/seed.cjs

echo "✅ Установка завершена!"
echo "🌐 Сайт доступен по адресу: http://$(curl -s ifconfig.me)"
echo ""
echo "👥 Тестовые пользователи:"
echo "   admin@rks.ru / Admin1234"
echo "   buyer1@rks.ru / Buyer1234"