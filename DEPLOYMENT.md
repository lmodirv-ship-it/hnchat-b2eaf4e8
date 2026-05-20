# 🚀 دليل النشر الكامل لـ hnChat

## 📦 الملفات الجاهزة في المشروع

| الملف | الوصف |
|---|---|
| `deploy.sh` | نشر الموقع على السيرفار الخاص |
| `nginx-hnchat.conf` | إعدادات Nginx (كل نطاق معزول) |
| `build-apk.sh` | بناء تطبيق Android APK |
| `build-exe.sh` | بناء تطبيق Windows EXE |
| `public/launcher.html` | صفحة HTML ثابتة لمساحة النطاق |

---

## 1️⃣ تحميل المشروع كاملاً

من الزر العلوي في Lovable: **GitHub → Connect → Push**، ثم على جهازك:
```bash
git clone https://github.com/YOUR_USERNAME/hnchat.git
cd hnchat
```

أو **Download Code** مباشرة كملف ZIP.

---

## 2️⃣ النشر على السيرفار (VPS)

```bash
# على السيرفار (Ubuntu/Debian)
ssh user@your-server-ip

# انسخ المشروع
scp -r ./hnchat user@your-server-ip:~/

# شغّل سكربت النشر
cd ~/hnchat
chmod +x deploy.sh
./deploy.sh

# انسخ إعدادات Nginx
sudo cp nginx-hnchat.conf /etc/nginx/sites-available/hnchat
sudo ln -sf /etc/nginx/sites-available/hnchat /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# SSL مجاني (Let's Encrypt)
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx \
  -d hn-chat.com -d www.hn-chat.com \
  -d hnchat.net  -d www.hnchat.net
```

---

## 3️⃣ ربط النطاقات (DNS)

في إعدادات كل نطاق (registrar الخاص بك):

| النطاق | النوع | القيمة |
|---|---|---|
| `hn-chat.com` | A | `IP_السيرفار` |
| `www.hn-chat.com` | A | `IP_السيرفار` |
| `hnchat.net` | A | `IP_السيرفار` |
| `www.hnchat.net` | A | `IP_السيرفار` |

✅ **كل نطاق مستقل** — لا يتم التحويل من نطاق لآخر.

---

## 4️⃣ بناء تطبيق Android (APK)

```bash
# على جهازك (يتطلب Android Studio + JDK 17)
chmod +x build-apk.sh
./build-apk.sh

# الناتج: ./hnchat.apk
# ارفعه للسيرفار:
scp hnchat.apk user@server:/var/www/hnchat/.output/public/downloads/
```

---

## 5️⃣ بناء تطبيق Windows (EXE)

```bash
chmod +x build-exe.sh
./build-exe.sh

# الناتج: ./hnChat-windows.zip
scp hnChat-windows.zip user@server:/var/www/hnchat/.output/public/downloads/
```

---

## 6️⃣ مساحة النطاق فقط (بدون VPS)

إذا أردت نطاقاً واحداً يعرض launcher بسيط بدون سيرفر Node:

```bash
# ارفع فقط
public/launcher.html → public_html/index.html
public/icon-512.png  → public_html/icon-512.png
```

سيعرض روابط النطاقات + أزرار تحميل APK/EXE تلقائياً.

---

## 🔐 المتغيرات السرية المطلوبة على السيرفار

أنشئ ملف `.env` في `/var/www/hnchat/`:

```env
SUPABASE_URL=https://mldhfeedpztfqrlotvkb.supabase.co
SUPABASE_PUBLISHABLE_KEY=<من_لوحة_تحكم_Supabase>
SUPABASE_SERVICE_ROLE_KEY=<من_لوحة_تحكم_Supabase>
LOVABLE_API_KEY=<من_Lovable>
FIRECRAWL_API_KEY=<من_Lovable>
```

---

## ✅ التحقق من العمل

```bash
# تأكد من تشغيل السيرفر
pm2 status hnchat
pm2 logs hnchat

# اختبر كل نطاق
curl -I https://hn-chat.com
curl -I https://www.hn-chat.com
curl -I https://hnchat.net
curl -I https://www.hnchat.net

# يجب أن يُرجع كل واحد 200 OK مع عنوانه الخاص (لا redirect)
```
