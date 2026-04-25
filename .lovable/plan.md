# خطة: إكمال الشريط الجانبي بقسم "More"

## الوضع الحالي
الشريط الجانبي يحتوي على كل عناصر "Navigation" الـ 26 الموجودة في الصورة (Home Feed → Profile + Admin). الناقص هو **قسم "More"** الذي يظهر أسفل الشريط في الصورة:
- Notifications (5) — الصفحة موجودة لكنها غير مربوطة في الشريط
- Bookmarks — صفحة غير موجودة
- Settings — صفحة غير موجودة (Preferences ≠ Settings)
- Privacy Policy — صفحة غير موجودة
- Terms of Service — صفحة غير موجودة

## ما سأنفّذه

### 1. إنشاء 4 صفحات جديدة في `src/routes/_authenticated/`
- `bookmarks.tsx` — قائمة العناصر المحفوظة (placeholder بتصميم متّسق عبر `ComingSoon`، مع أيقونة Bookmark وأقسام: Posts / Videos / Products).
- `settings.tsx` — صفحة إعدادات حقيقية بسيطة: Account info (email + role)، Theme toggle (dark/light)، Language، Sign out — وليست placeholder.
- `privacy-policy.tsx` — صفحة محتوى ثابت بسياسة خصوصية موجزة (مقدمة + جمع البيانات + الاستخدام + المشاركة + الحقوق + التواصل).
- `terms-of-service.tsx` — صفحة محتوى ثابت بشروط استخدام موجزة (القبول + الحساب + المحتوى + الاستخدام المحظور + إخلاء المسؤولية + التعديل).

### 2. تحديث `src/components/AppSidebar.tsx`
- إضافة قسم منفصل بعنوان **"More"** أسفل قائمة Navigation وقبل قسم Admin، يحتوي على:
  ```
  Notifications  [5]
  Bookmarks
  Settings
  Privacy Policy
  Terms of Service
  ```
- استخدام نفس نمط الأيقونات (`Bell, Bookmark, Settings, FileText, ScrollText`) ونفس مكوّن `Badge` المستخدم حالياً (tone="count" للرقم 5).
- نفس نمط active state ونفس الـ Link.

### 3. لا حاجة لأي migration أو backend
كل العناصر الجديدة إمّا صفحات محتوى ثابت أو placeholder، ولا تتطلب جداول أو RLS.

## التحقق
- `tsc --noEmit` للتأكد من أن `<Link to="...">` لكل المسارات الجديدة type-safe بعد توليد `routeTree.gen.ts` تلقائياً.
- التأكد من ظهور القسم الجديد في الـ viewport الحالي (785px) — الشريط الجانبي مخفي تحت `md:` فلا تأثير على الموبايل.

## الملفات
- إنشاء: `src/routes/_authenticated/bookmarks.tsx`, `settings.tsx`, `privacy-policy.tsx`, `terms-of-service.tsx`
- تعديل: `src/components/AppSidebar.tsx`
