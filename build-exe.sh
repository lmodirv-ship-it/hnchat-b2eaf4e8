#!/usr/bin/env bash
# ============================================================
#  بناء EXE لتطبيق Windows عبر Electron
#  يمكن تشغيله على Linux/Mac أيضاً لإنتاج EXE
# ============================================================
set -e

echo "🖥️  بناء تطبيق Windows EXE..."

# 1. تثبيت Electron
echo "📦 تثبيت Electron..."
npm install --save-dev electron @electron/packager

# 2. إنشاء ملف main process
mkdir -p electron
cat > electron/main.cjs << 'EOF'
const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    title: 'hnChat',
    backgroundColor: '#0a0a1f',
    icon: path.join(__dirname, '..', 'public', 'icon-512.png'),
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // افتح الموقع الحي مباشرة
  win.loadURL('https://www.hn-chat.com');

  win.webContents.setWindowOpenHandler(({ url }) => {
    require('electron').shell.openExternal(url);
    return { action: 'deny' };
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
EOF

# 3. تحديث package.json بإضافة main
node -e "
const pkg = require('./package.json');
pkg.main = 'electron/main.cjs';
require('fs').writeFileSync('./package.json', JSON.stringify(pkg, null, 2));
"

# 4. بناء الـ EXE
echo "🔨 بناء EXE..."
npx @electron/packager . "hnChat" \
  --platform=win32 \
  --arch=x64 \
  --out=electron-release \
  --overwrite \
  --icon=public/icon-512.png \
  --ignore="^/src" \
  --ignore="^/android" \
  --ignore="^/supabase" \
  --ignore="^/.output" \
  --ignore="^/electron-release"

# 5. ضغط الناتج
cd electron-release
if command -v zip >/dev/null 2>&1; then
  zip -r ../hnChat-windows.zip hnChat-win32-x64/
  echo "✅ EXE جاهز: ./hnChat-windows.zip"
  echo "   داخل الـ ZIP: hnChat.exe"
  echo "   ارفعه إلى: /var/www/hnchat/.output/public/downloads/hnchat-setup.exe"
else
  echo "✅ مجلد الـ EXE جاهز: ./electron-release/hnChat-win32-x64/"
  echo "   شغّل: hnChat.exe"
fi
