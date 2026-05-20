# 🚀 نشر hnChat على FTP (hnchat.net) + VPS (admin.hnchat.net)

## 📐 البنية النهائية

```
┌─────────────────────────────────────────────────────────┐
│  hnchat.net  (FTP / cPanel — المستخدمون العاديون)       │
│  www.hnchat.net                                          │
│  ─ الواجهة الكاملة (HTML + JS + CSS)                    │
│  ─ تتصل مباشرة بـ Lovable Cloud لحفظ/جلب البيانات       │
│  ─ الجلسة محفوظة في localStorage (يبقى المستخدم مسجلاً)  │
└─────────────────────────────────────────────────────────┘
                          ↕ HTTPS
┌─────────────────────────────────────────────────────────┐
│         Lovable Cloud (قاعدة البيانات + AI)              │
│         mldhfeedpztfqrlotvkb.supabase.co                 │
└─────────────────────────────────────────────────────────┘
                          ↕
┌─────────────────────────────────────────────────────────┐
│  admin.hnchat.net  (VPS — المدير/المالك فقط)             │
│  hn-chat.com / www.hn-chat.com  (VPS)                    │
│  ─ Node.js + SSR + server functions                      │
│  ─ لوحة المدير الكاملة (/admin, /owner)                  │
└─────────────────────────────────────────────────────────┘
```

---

## 1️⃣ رفع الواجهة على FTP (hnchat.net)

### ما ترفعه:
كل محتويات مجلد **`dist/client/`** إلى `public_html/` على الـ FTP.

```
public_html/
├── index.html
├── favicon.png
├── manifest.webmanifest
├── apple-touch-icon.png
├── ads.txt
├── googlec9a405c0fc07da80.html
└── assets/
    ├── *.js
    └── *.css
```

### أضف ملف `.htaccess` في `public_html/` للتعامل مع التوجيه:

```apache
# .htaccess — لجعل TanStack Router يعمل بشكل صحيح على Apache/cPanel
RewriteEngine On

# لا تعد توجيه الملفات الموجودة (CSS, JS, صور)
RewriteCond %{REQUEST_FILENAME} -f [OR]
RewriteCond %{REQUEST_FILENAME} -d
RewriteRule ^ - [L]

# لوحة المدير لا تُخدم من هنا — حوّلها لـ VPS
RewriteRule ^(admin|owner)(/.*)?$ https://admin.hnchat.net/$1$2 [R=302,L]

# كل ما عداها → index.html (SPA fallback)
RewriteRule ^ index.html [L]

# Cache للملفات الثابتة
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType text/css "access plus 1 year"
  ExpiresByType application/javascript "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
</IfModule>

# Gzip
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/css application/javascript application/json
</IfModule>
```

### إعدادات DNS لـ `hnchat.net`:
| النوع | الاسم | القيمة |
|---|---|---|
| A | @ | IP_الـ_FTP_hosting |
| A | www | IP_الـ_FTP_hosting |
| A | admin | **IP_الـ_VPS** |
| A | api | IP_الـ_VPS (اختياري) |

---

## 2️⃣ نشر VPS (admin.hnchat.net + hn-chat.com)

```bash
# انسخ المشروع للسيرفار
scp -r ./hnchat user@VPS_IP:~/
ssh user@VPS_IP
cd ~/hnchat

# شغّل سكربت النشر
chmod +x deploy.sh
./deploy.sh

# انسخ إعدادات Nginx (تتضمن admin.hnchat.net)
sudo cp nginx-hnchat.conf /etc/nginx/sites-available/hnchat
sudo ln -sf /etc/nginx/sites-available/hnchat /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# SSL لكل النطاقات على VPS
sudo certbot --nginx \
  -d hn-chat.com -d www.hn-chat.com \
  -d admin.hnchat.net
```

---

## 3️⃣ حماية لوحة المدير admin.hnchat.net

### الخيار أ — حماية بـ IP (الأقوى)
عدّل `nginx-hnchat.conf` في block `admin.hnchat.net`:
```nginx
allow 1.2.3.4;     # IP المنزل/المكتب
allow 5.6.7.8;     # IP احتياطي
deny all;
```

### الخيار ب — حماية بكلمة سر HTTP Basic
```bash
sudo apt install apache2-utils -y
sudo htpasswd -c /etc/nginx/.htpasswd admin
```
ثم أضف في block `admin.hnchat.net`:
```nginx
auth_basic "Admin Area";
auth_basic_user_file /etc/nginx/.htpasswd;
```

### الخيار ج — الاكتفاء بحماية الدور (موجود مسبقاً)
الموقع يحمي مسارات `/admin` و `/owner` بالفعل عبر `_admin.tsx` و `_owner.tsx` — لن يصل إليها سوى المستخدم بدور admin/owner في قاعدة البيانات.

---

## 4️⃣ التحقق من العمل

```bash
# الواجهة على FTP
curl -I https://hnchat.net
curl -I https://www.hnchat.net

# VPS
curl -I https://hn-chat.com
curl -I https://admin.hnchat.net   # يجب أن يحوّل لـ /admin
```

### تجربة من المتصفح:
1. افتح `https://hnchat.net` → الواجهة الكاملة، سجّل دخول
2. أعد تحميل الصفحة → ✅ تبقى مسجّلاً (localStorage)
3. أنشئ منشور → يُحفظ في Lovable Cloud
4. افتح `https://admin.hnchat.net` → لوحة المدير
5. افتح `https://hnchat.net/admin` → تتحول تلقائياً لـ `admin.hnchat.net/admin`

---

## ✅ مزايا هذه البنية

| العنصر | الفائدة |
|---|---|
| الواجهة على FTP | سريعة جداً، بدون تكلفة VPS للزوار |
| VPS منفصل للمدير | عزل أمني كامل |
| Lovable Cloud للبيانات | لا حاجة لإدارة قاعدة بيانات |
| localStorage للجلسة | المستخدم يبقى مسجّلاً |
| كل نطاق مستقل | لا redirects متقاطعة |
