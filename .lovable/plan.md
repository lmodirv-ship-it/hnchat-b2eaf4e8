## المشكلة

`bun install` فشل لأنه لا يوجد `package.json` في `C:\hn\site`. هذا يعني أحد ثلاثة احتمالات:

1. ملف الـ ZIP لم يُفك بعد
2. ملف الـ ZIP فُك في مكان آخر (مثل `C:\hn` مباشرة وليس `C:\hn\site`)
3. اسم المجلد داخل الـ ZIP مختلف (مثلاً `lovable-site-complete` بدل `site`)

---

## خطوات التشخيص (نفّذها بالترتيب في PowerShell)

### 1. اعرف ما الموجود فعلاً في `C:\hn`

```powershell
cd C:\hn
dir
```

أرسل لي النتيجة. سأعرف منها:
- هل ملف الـ ZIP موجود؟
- هل تم فكه؟
- ما الاسم الفعلي للمجلد؟

### 2. لو رأيت ملف ZIP فقط (لم يُفك)

```powershell
cd C:\hn
Expand-Archive -Path .\lovable-site-complete.zip -DestinationPath .\site -Force
cd site
dir
```

ثم تأكد من رؤية `package.json` في القائمة.

### 3. لو رأيت مجلداً باسم آخر (مثل `lovable-site-complete`)

```powershell
cd C:\hn\lovable-site-complete
dir
```

لو ظهر `package.json` هنا، فهذا هو المجلد الصحيح. كمل العمل من داخله:

```powershell
bun install
bun run dev
```

### 4. لو الملفات فُكت داخل مجلد فرعي إضافي

أحياناً ZIP يحتوي مجلد داخل مجلد، مثل:
`C:\hn\site\lovable-site-complete\package.json`

تحقق:

```powershell
cd C:\hn\site
dir
```

لو رأيت مجلداً واحداً فقط بدون `package.json`، ادخله:

```powershell
cd C:\hn\site\<اسم-المجلد>
dir
bun install
```

---

## الإجراء المطلوب منك الآن

نفّذ **الخطوة 1 فقط** وأرسل لي ناتج `dir` لمجلد `C:\hn`. بناءً على ذلك سأعطيك الأمر التالي بالضبط.

---

## ملاحظة تقنية

ملف المشروع المضغوط الذي حُمّل سابقاً يجب أن يحتوي على هذه الملفات في الجذر:
- `package.json`
- `bun.lockb` أو `bun.lock`
- `vite.config.ts`
- `src/`
- `supabase/`
- `.env`

لو أي من هذه ناقص، سنحتاج إعادة تحميل الملف.