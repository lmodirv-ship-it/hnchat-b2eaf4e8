#!/usr/bin/env bash
# ============================================================
#  بناء APK لتطبيق الأندرويد عبر Capacitor
#  المتطلبات: Android Studio + JDK 17 (لا JDK 26!)
# ============================================================
set -e

echo "📱 بناء تطبيق Android APK..."

# 1. التحقق من Java 17
JAVA_VER=$(java -version 2>&1 | head -1 | awk -F '"' '{print $2}' | cut -d. -f1)
if [ "$JAVA_VER" != "17" ]; then
  echo "⚠️  تحذير: Java $JAVA_VER مكتشف. الموصى به Java 17."
  echo "   على Windows: \$env:JAVA_HOME='C:\\Program Files\\Android\\Android Studio\\jbr'"
  echo "   على Linux: sudo apt install openjdk-17-jdk && sudo update-alternatives --config java"
fi

# 2. بناء الويب
echo "🔨 بناء ملفات الويب..."
npm install
npm run build

# 3. إنشاء dist/index.html بسيط للـ Capacitor
mkdir -p dist
cat > dist/index.html << 'EOF'
<!DOCTYPE html>
<html lang="ar" dir="rtl"><head>
<meta charset="utf-8"><title>hnChat</title>
<meta http-equiv="refresh" content="0;url=https://www.hn-chat.com">
<style>body{background:#0a0a1f;color:#fff;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0}</style>
</head><body>جاري تحميل hnChat...</body></html>
EOF

# 4. مزامنة Capacitor
echo "🔄 مزامنة Capacitor..."
rm -rf android
npx cap add android
npx cap sync android

# 5. بناء APK
echo "📦 بناء APK..."
cd android
chmod +x ./gradlew
./gradlew assembleDebug --no-daemon

APK_PATH="app/build/outputs/apk/debug/app-debug.apk"
if [ -f "$APK_PATH" ]; then
  cp "$APK_PATH" ../hnchat.apk
  echo "✅ APK جاهز: ./hnchat.apk"
  echo "   ارفعه إلى السيرفار في: /var/www/hnchat/.output/public/downloads/hnchat.apk"
else
  echo "❌ فشل البناء"
  exit 1
fi
