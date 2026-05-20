#!/usr/bin/env bash
# ============================================================
#  hnChat — سكربت النشر الشامل على السيرفار الخاص
#  الاستخدام: bash deploy.sh
# ============================================================
set -e

APP_DIR="/var/www/hnchat"
APP_NAME="hnchat"
NODE_PORT="3000"

echo "🚀 بدء نشر hnChat..."

# 1. التحقق من المتطلبات
command -v node >/dev/null 2>&1 || { echo "❌ Node.js غير مثبت. ثبّته أولاً: curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - && sudo apt install nodejs"; exit 1; }
command -v nginx >/dev/null 2>&1 || { echo "❌ Nginx غير مثبت. ثبّته: sudo apt install nginx"; exit 1; }
command -v pm2  >/dev/null 2>&1 || { echo "📦 تثبيت pm2..."; sudo npm install -g pm2; }

# 2. تثبيت الاعتمادات والبناء
echo "📦 تثبيت الاعتمادات..."
cd "$(dirname "$0")"
npm install

echo "🔨 بناء المشروع..."
npm run build

# 3. نسخ الملفات لمجلد النشر
echo "📁 نسخ الملفات إلى $APP_DIR ..."
sudo mkdir -p "$APP_DIR"
sudo cp -r .output "$APP_DIR/"
sudo cp package.json "$APP_DIR/"
[ -f .env ] && sudo cp .env "$APP_DIR/"

# 4. تشغيل السيرفر مع pm2
echo "▶️  تشغيل السيرفر..."
cd "$APP_DIR"
pm2 delete "$APP_NAME" 2>/dev/null || true
PORT=$NODE_PORT pm2 start .output/server/index.mjs --name "$APP_NAME"
pm2 save
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u "$USER" --hp "$HOME"

echo ""
echo "✅ تم النشر بنجاح!"
echo "   - السيرفار يعمل على: http://localhost:$NODE_PORT"
echo "   - الخطوة التالية: انسخ nginx-hnchat.conf إلى /etc/nginx/sites-available/"
echo "   - ثم: sudo ln -s /etc/nginx/sites-available/nginx-hnchat.conf /etc/nginx/sites-enabled/"
echo "   - ثم: sudo nginx -t && sudo systemctl reload nginx"
echo "   - SSL: sudo certbot --nginx -d hn-chat.com -d www.hn-chat.com -d hnchat.net -d www.hnchat.net"
