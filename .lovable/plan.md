## المشكلة

اكتشفت السبب الحقيقي بعد فحص قاعدة البيانات:

- جدول `channel_videos` فارغ تماماً (0 صف) — لذا قسم "فيديوهات القنوات" لا يعرض شيئاً
- جدول `user_channels` فارغ تماماً — أي قناة لم تُحفظ
- لكن جدول `posts` يحتوي على **154 منشور فيديو** (روابط YouTube حقيقية) — هذه فيديوهات قديمة موجودة فعلاً

النتيجة: الفيديوهات موجودة في قاعدة البيانات لكن الصفحة الرئيسية لا تعرفها لأن `UnifiedActivityFeed` يبحث فقط في `channel_videos` (الفارغ) ويعرض الـ posts كـ "منشور" عادي بدون صورة مصغرة.

## الحل

### 1. إصلاح `UnifiedActivityFeed.tsx`
عند جلب posts، إذا كان رابط media_url يحتوي على YouTube:
- استخراج `videoId`
- توليد thumbnail تلقائياً: `https://i.ytimg.com/vi/{videoId}/hqdefault.jpg`
- تصنيفه ككـ `kind: "video"` بدلاً من `"post"`
- توجيه الرابط إلى `/watch-yt/{videoId}` بدلاً من `/post/{id}`

بهذا تظهر الـ 154 فيديو فوراً في الصفحة الرئيسية بصور مصغرة وزر تشغيل أحمر.

### 2. تعبئة `channel_videos` من posts الموجودة
تشغيل migration يدخل صفاً في `channel_videos` لكل post من نوع "video" يحتوي رابط YouTube، مع:
- `is_published = true`, `show_in_feed = true`, `show_in_reels = true`
- `post_id` يربط بالمنشور الأصلي
- `published_at_app = created_at` للترتيب الزمني

بهذا قسم "فيديوهات القنوات" المنفصل يعرض الفيديوهات أيضاً، وأي إعجاب/مشاركة مستقبلي يكون موحَّداً.

### 3. إصلاح `add-channel.tsx` للمستقبل
بما أن `user_channels` فارغ رغم محاولات الاستيراد، يبدو أن خطوة "تأكيد النشر" قد تفشل بصمت. سأضيف:
- log واضح لأي خطأ في الكونسول
- toast يعرض الخطأ الفعلي بدل رسالة عامة
- التحقق أن `requireSupabaseAuth` نشط في `importYoutubeChannel`

## الملفات المعدلة

- `src/components/landing/UnifiedActivityFeed.tsx` — كشف YouTube في posts وعرضها كفيديوهات
- `supabase/migrations/...` — backfill `channel_videos` من 154 منشور موجود
- `src/routes/_authenticated/add-channel.tsx` — تحسين رسائل الخطأ

## النتيجة

- فوراً: 154 فيديو YouTube تظهر في الصفحة الرئيسية بصور وأزرار تشغيل، مرتبة حسب التاريخ مع المقالات والمنشورات
- قسم "فيديوهات القنوات" يعرض المحتوى أيضاً
- استيراد القنوات الجديدة سيعرض أخطاء واضحة لو فشل