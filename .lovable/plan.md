# خطة: تطوير الموقع وتحويله إلى تطبيق هاتف

الموقع غني بالميزات (Feed, Reels, Messages, Stories, Mail, Marketplace, Groups, AI Hub…) لكنه مصمم أساسًا للويب. الهدف: رفع جودة تجربة الجوّال + إتاحة تثبيته كتطبيق حقيقي على Android و iOS.

## المرحلة 1 — تحسينات تطوير الموقع (Polish)

1. **Bottom Navigation للجوّال**: شريط سفلي ثابت (Feed / Reels / + Compose / Messages / Profile) بدل الاعتماد على السايدبار في الجوّال.
2. **Header علوي مضغوط** مع أيقونة بحث + إشعارات + قصص (Stories Bar).
3. **Pull-to-Refresh** في Feed و Notifications و Messages.
4. **Skeletons موحّدة + Lazy loading** للصور والفيديوهات (بدّل أي `<img>` ثقيل بـ loading="lazy").
5. **Haptics** (اهتزاز خفيف) عند الإعجاب/الحفظ/الإرسال على الجوّال.
6. **Splash Screen + Logo Animation** عند فتح التطبيق.
7. **Safe-area insets** (دعم نوتش iPhone) عبر `env(safe-area-inset-*)`.
8. **Dark/Light theme toggle** في الإعدادات + احترام تفضيل النظام.
9. **Offline banner** يظهر عند انقطاع الشبكة.
10. **إصلاح خطأ runtime**: `Cannot set property attributeName of MutationRecord` (يبدو من تعديل DOM يدوي خاطئ — سأبحث وأصلح).

## المرحلة 2 — جعله "App-Like" (Installable PWA)

PWA = أبسط وأسرع طريق ليصبح "تطبيق على الهاتف" يُثبَّت من المتصفح بدون متاجر.
- إضافة `manifest.json` بأيقونات (192/512) + `display: "standalone"` + theme color.
- شاشة Splash + أيقونة على Home Screen.
- زر "تثبيت التطبيق" داخل الإعدادات.
- بدون Service Worker / دون offline (لتفادي مشاكل preview حسب توجيهات Lovable).

النتيجة: يضغط المستخدم "إضافة إلى الشاشة الرئيسية" فيظهر التطبيق بأيقونة كاملة وبدون شريط متصفح، ويعمل على iOS و Android.

## المرحلة 3 — تطبيق Native حقيقي (Android APK + iOS) عبر Capacitor

لمن يريد APK/IPA حقيقي للنشر على Google Play / App Store:
- إعداد **Capacitor** (يلفّ الموقع داخل WebView مع وصول للـ native APIs).
- إعداد `capacitor.config.ts` + مجلدات `android/` و `ios/`.
- إضافة plugins: Push Notifications، Camera (للقصص)، Haptics، Status Bar، Splash Screen، Share.
- توثيق خطوات البناء (يحتاج Android Studio محليًا أو خدمة build سحابية لأن Lovable لا تبني APK داخل الـ sandbox).

سأقدم سكربتًا جاهزًا + ملف README بالخطوات.

## التفاصيل التقنية

- **Bottom Nav**: مكوّن `<MobileBottomNav />` يظهر فقط `md:hidden`، يستخدم `Link` من TanStack Router مع `activeProps`.
- **Safe area**: في `styles.css` إضافة `padding-bottom: env(safe-area-inset-bottom)` للشريط السفلي و `viewport-fit=cover` في `__root.tsx`.
- **PWA Manifest**: ملف ثابت في `public/manifest.webmanifest` + ربطه من `__root.tsx` head، بدون vite-plugin-pwa.
- **أيقونات**: توليد PNG من شعار `HnLogo` بأحجام 192 و 512 و 180 (Apple touch).
- **Capacitor**: `bun add @capacitor/core @capacitor/cli @capacitor/android @capacitor/ios` + `npx cap init` + إضافة `server.url` يشير للنسخة المنشورة.
- **Haptics**: استخدام `navigator.vibrate(20)` على الويب، و `@capacitor/haptics` داخل التطبيق الأصلي.
- **Pull-to-refresh**: مكوّن خفيف يدويًا (touchstart/touchmove) بدون مكتبة إضافية.

## ما لن أفعله (وسبب ذلك)

- لن أضيف Service Worker كامل لأن Lovable توصي بتجنّبه (يكسر الـ preview).
- لن أبني APK داخل sandbox (غير متاح) — سأجهّز المشروع وأوفّر تعليمات البناء.

## التسليم

ملفات معدّلة/جديدة متوقعة:
- `src/components/layout/MobileBottomNav.tsx` (جديد)
- `src/components/layout/InstallPrompt.tsx` (جديد)
- `src/components/layout/OfflineBanner.tsx` (جديد)
- `src/routes/__root.tsx` (head meta + viewport-fit)
- `src/routes/_authenticated.tsx` (تركيب Bottom Nav)
- `src/styles.css` (safe-area + theme polish)
- `public/manifest.webmanifest` + `public/icon-192.png` + `public/icon-512.png` + `public/apple-touch-icon.png` (جديدة)
- `capacitor.config.ts` + `MOBILE_APP_README.md` (للمرحلة 3)

---

**ملاحظة**: هذه خطة كبيرة. أنصح بتنفيذها على دفعات: **(أ) المرحلة 1 + 2 معًا** أولًا (تحسين + PWA قابل للتثبيت)، ثم **(ب) المرحلة 3** عند رغبتك في APK رسمي. هل أبدأ بـ (أ)؟
