# خطة تحسين الأداء و SEO للصفحة الرئيسية

تحليل تقرير Lighthouse يكشف 4 مشاكل حرجة. الخطة تركّز على إصلاحها فقط دون لمس التصميم أو حذف أي صفحة/قسم.

## 1. شعار HN-Logo (المشكلة الأكبر — توفير ~790 KB)

**الواقع:** `src/assets/hn-logo.png` بحجم **791 KiB** بأبعاد 512×1024 يُعرض بحجم 40×40 على كل صفحة.

**الإصلاح:**
- توليد نسخة مُحسّنة من الشعار بصيغة WebP بأبعاد 128×128 (≈ 5–10 KB) وحفظها في `src/assets/hn-logo.webp`.
- تحديث `src/components/HnLogo.tsx` لاستخدام النسخة الجديدة + إضافة `width`/`height` صريحَين على `<img>` لمنع layout shift.
- الاحتفاظ بالـ PNG الأصلي للأماكن التي قد تحتاج دقة عالية (favicon/OG) دون استيراده في الـ bundle.

## 2. تثبيت CLS من 0.921 إلى < 0.1

**الأسباب من التقرير:**
- الشريط الجانبي والبطاقة البنفسجية تُحرّك المحتوى (shift score 0.919).
- خطوط Cairo/Inter تتحمّل متأخّرة فتُغيّر مقاسات النص (FOUT).

**الإصلاح:**
- إضافة `font-display: swap` + `size-adjust` عبر `@font-face` محلي fallback في `src/styles.css`، أو استخدام `<link rel="preload">` للخطين الأساسيين في `__root.tsx`.
- في `LandingPage.tsx`: حجز ارتفاع/عرض ثابت (`min-height` + skeleton) للبطاقات التي تظهر بعد جلب البيانات (الشريط الجانبي للـ public chat والبطاقة البنفسجية المُشار إليها).
- إضافة `width`/`height` لكل `<img>` في `BlogSection`, `ChannelVideosSection`, `UnifiedActivityFeed`.

## 3. تحسين صور Supabase Storage (توفير ~600 KB)

**الواقع:** صور المقالات تُحمَّل بدقة 1920×1080 لتُعرض 414×276.

**الإصلاح:**
- إنشاء helper `src/lib/image.ts` يضيف معاملات Supabase image transformation (`?width=…&quality=75&format=webp`) للروابط المُخزّنة على `mldhfeedpztfqrlotvkb.supabase.co/storage/...`.
- تطبيقه في `BlogSection`, `UnifiedActivityFeed`, `ChannelVideosSection` على غلاف المقالات.
- إضافة `sizes` و `loading="lazy"` + `decoding="async"` (موجود جزئياً).

## 4. تأجيل السكربتات الخارجية (توفير TBT ~570ms → < 200ms)

**في `src/routes/__root.tsx`:**
- نقل سكربت AdSense من `<head>` ليُحقن بعد `load` event عبر مكوّن صغير، أو إضافة `data-ad-frequency-hint` وتأخيره بـ 3 ثوان.
- التأكّد من أن `gtag` و `googletagmanager` يُحمَّلان بـ `async` (موجود) + إزالة السكربت inline المكرَّر (يُوجد منه نسختان حالياً: في `<head>` و `ScriptOnce`).

## 5. SEO الصفحة الرئيسية (رفع النتيجة من 43)

السبب الأساسي لانخفاض SEO على الصفحة هو ضعف الأداء على الموبايل + روابط داخلية. تحسينات سريعة:
- إضافة `<link rel="preload" as="image" fetchpriority="high">` لصورة LCP (الشعار/الـ hero).
- التأكّد من وجود `alt` وصفي على كل صورة في `LandingPage`.
- إضافة `aria-label` للأزرار الأيقونية.

## الملفات المتأثّرة

- `src/assets/hn-logo.webp` (جديد)
- `src/components/HnLogo.tsx`
- `src/components/landing/LandingPage.tsx`
- `src/components/landing/BlogSection.tsx`
- `src/components/landing/ChannelVideosSection.tsx`
- `src/components/landing/UnifiedActivityFeed.tsx`
- `src/lib/image.ts` (جديد)
- `src/routes/__root.tsx`
- `src/styles.css`

## النتائج المتوقّعة

| المقياس | قبل | بعد (هدف) |
|---|---|---|
| Performance | 43 | 80+ |
| SEO | 43 | 90+ |
| CLS | 0.921 | < 0.1 |
| LCP | 1.4s | < 1.2s |
| TBT | 570ms | < 200ms |
| حجم الصفحة | ~2.1 MB | ~600 KB |

## خارج النطاق

- لا تغيير في التصميم أو الألوان أو ترتيب الأقسام.
- لا حذف أي صفحة أو ميزة.
- لا تعديل على نظام المدوّنة (تم في الجلسة السابقة).
