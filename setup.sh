#!/bin/bash

echo "🚀 Начинаем установку RKS Marketplace..."

# Фикс DNS (убираем симлинк, пишем напрямую)
rm -f /etc/resolv.conf
echo "nameserver 8.8.8.8" > /etc/resolv.conf

# Полностью заменяем sources.list на официальные репозитории Ubuntu
cat > /etc/apt/sources.list << 'SOURCES'
deb http://archive.ubuntu.com/ubuntu jammy main restricted universe multiverse
deb http://archive.ubuntu.com/ubuntu jammy-updates main restricted universe multiverse
deb http://archive.ubuntu.com/ubuntu jammy-backports main restricted universe multiverse
deb http://security.ubuntu.com/ubuntu jammy-security main restricted universe multiverse
SOURCES

# Обновление системы
apt update && apt upgrade -y

# Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# PostgreSQL, Nginx, Git, Certbot
apt install -y postgresql postgresql-contrib nginx git certbot python3-certbot-nginx

# PM2
npm install -g pm2

# Получаем IP и формируем домен sslip.io
SERVER_IP=$(curl -s ifconfig.me)
SSLIP_DOMAIN=$(echo $SERVER_IP | tr '.' '-').sslip.io

echo "📡 IP сервера: $SERVER_IP"
echo "🌐 Домен: $SSLIP_DOMAIN"

# База данных
sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'admin';"
sudo -u postgres psql -c "CREATE DATABASE rks_3d_marketplace;"

# Клонирование проекта
git clone https://github.com/hesoyamaezakmovich/my-sneaker-store.git /home/user1/marketplace
chown -R user1:user1 /home/user1/marketplace

# Схема БД
sudo -u postgres psql -d rks_3d_marketplace < /home/user1/marketplace/database/schema.sql
sudo -u postgres psql -d rks_3d_marketplace -c "ALTER TABLE orders ADD COLUMN IF NOT EXISTS yookassa_payment_id TEXT;"
sudo -u postgres psql -d rks_3d_marketplace -c "GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;"
sudo -u postgres psql -d rks_3d_marketplace -c "GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;"

# Зависимости бэкенда
cd /home/user1/marketplace/server && npm install

# .env файл сервера
cat > /home/user1/marketplace/server/.env << EOF
PORT=3001
DB_HOST=localhost
DB_PORT=5432
DB_NAME=rks_3d_marketplace
DB_USER=postgres
DB_PASSWORD=admin
JWT_SECRET=rks-3d-marketplace-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_DAYS=30
FRONTEND_URL=https://$SSLIP_DOMAIN
DOWNLOAD_LINK_TTL_HOURS=72
YOOKASSA_SHOP_ID=1357810
YOOKASSA_SECRET_KEY=test_d0jpXDsrgZyelapNlk7EVX_vTA-YHQpTIsc5aL7a1IM
S3_ENDPOINT=https://s3.cloud.ru
S3_REGION=ru-central-1
S3_BUCKET=bucket-24661a
S3_PUBLIC_URL=https://s3.cloud.ru
S3_ACCESS_KEY_ID=ЗАМЕНИ_НА_СВОЙ_KEY_ID
S3_SECRET_ACCESS_KEY=ЗАМЕНИ_НА_СВОЙ_SECRET_KEY
EOF

# Зависимости фронтенда и сборка
cd /home/user1/marketplace && npm install
VITE_API_URL=https://$SSLIP_DOMAIN npm run build

# Права на dist
chmod 755 /home/user1
chmod -R 755 /home/user1/marketplace/dist

# PM2
cd /home/user1/marketplace/server
sudo -u user1 pm2 start index.js --name rks-api
sudo -u user1 pm2 save
env PATH=$PATH:/usr/bin pm2 startup systemd -u user1 --hp /home/user1

# Nginx — сначала HTTP для получения сертификата
cat > /etc/nginx/sites-available/marketplace << EOF
server {
    listen 80;
    server_name $SSLIP_DOMAIN;

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

# SSL сертификат
certbot --nginx -d $SSLIP_DOMAIN --non-interactive --agree-tos -m ruslanabramov606@gmail.com --redirect

# Nginx — финальный конфиг с HTTPS
cat > /etc/nginx/sites-available/marketplace << EOF
server {
    listen 80;
    server_name $SERVER_IP $SSLIP_DOMAIN;
    return 301 https://$SSLIP_DOMAIN\$request_uri;
}

server {
    listen 443 ssl;
    server_name $SSLIP_DOMAIN;

    ssl_certificate /etc/letsencrypt/live/$SSLIP_DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$SSLIP_DOMAIN/privkey.pem;

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

nginx -t && systemctl reload nginx

# Seed
cd /home/user1/marketplace && node database/seed.cjs

echo "✅ Установка завершена!"
echo "🌐 Сайт доступен по адресу: https://$SSLIP_DOMAIN"
echo ""
echo "🔔 Webhook для ЮKassa — добавь в личном кабинете:"
echo "   https://$SSLIP_DOMAIN/api/payments/webhook"
echo ""
echo "👥 Тестовые пользователи:"
echo "   admin@rks.ru / Admin1234"
echo "   buyer1@rks.ru / Buyer1234"
