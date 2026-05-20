# نشر hnChat على سيرفار خاص بك (HTML)

## ⚠️ ملاحظة مهمة
hnChat هو تطبيق **SSR** (React + TanStack Start) يحتوي على:
- قاعدة بيانات (Supabase / Lovable Cloud)
- مصادقة المستخدمين، AI، رسائل، فيديو
- خادم Cloudflare Workers

تحويله إلى **HTML ثابت بالكامل** يُلغي جميع هذه الميزات. لذلك يوجد **3 حلول** حسب احتياجك:

---

## ✅ الحل 1: صفحة HTML ثابتة (الأبسط)

ملف `public/launcher.html` يعمل على **أي سيرفار** (Apache, Nginx, GitHub Pages, استضافة عادية).

```bash
# انسخ الملف فقط إلى سيرفارك
scp public/launcher.html user@yourserver:/var/www/html/index.html
```

يعرض روابط جميع النطاقات + أزرار تحميل APK / EXE، ويستورد قائمة النطاقات من API الحي تلقائيًا.

---

## ✅ الحل 2: بناء كامل (SPA + سيرفار خارجي)

إذا أردت نسخة كاملة على سيرفارك الخاص:

```bash
npm install
npm run build
```

يُنشئ مجلد `.output/` يحتوي على:
- `.output/public/` — الملفات الثابتة (HTML, CSS, JS, صور)
- `.output/server/` — كود السيرفر (Node.js)

### النشر على Nginx
```nginx
server {
  listen 80;
  server_name hn-chat.com www.hn-chat.com;
  root /var/www/hnchat/.output/public;
  index index.html;

  location / {
    try_files $uri $uri/ @ssr;
  }

  location @ssr {
    proxy_pass http://localhost:3000;
    proxy_set_header Host $host;
  }
}
```

ثم شغّل السيرفر:
```bash
cd .output/server && node index.mjs
```

---

## ✅ الحل 3: WebView (APK / EXE)

تطبيقا الأندرويد والويندوز يفتحان `https://www.hn-chat.com` مباشرة عبر WebView، ويستوردان النطاقات من:

```
GET https://www.hn-chat.com/api/public/domains
```

يُرجع JSON بقائمة النطاقات المسجلة في قاعدة البيانات (جدول `site_domains`).

---

## النطاقات الرسمية
- `hn-chat.com` (الأساسي)
- `www.hn-chat.com`
- `hnchat.net`
- `www.hnchat.net`

كل نطاق مستقل ويمكن توجيهه لنفس السيرفار أو لسيرفارات منفصلة.
