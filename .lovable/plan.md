## المشكلة

الصورة تُظهر أنك على صفحة `/feed` (وليس `/`). التغييرات السابقة طُبّقت على الصفحة الرئيسية `LandingPage` فقط، لكن `/feed` (`src/routes/_authenticated/feed.tsx`) ما زالت تعرض:
- قسم منفصل "أحدث المقالات" (`articles-section`) في الأعلى
- ثم المنشورات بالأسفل
- بدون فيديوهات القنوات في تدفق موحد

## الحل

توحيد التدفق في `feed.tsx` بحيث المقالات + الفيديوهات + المنشورات تظهر في قائمة واحدة مرتّبة بتاريخ النشر تنازلياً، بنفس بطاقات `UnifiedActivityFeed` (التي تُخفي مصدر يوتيوب وتعرض views/likes/comments/share).

## التغييرات

### `src/routes/_authenticated/feed.tsx`
- حذف الكتلة `{/* Articles Section */}` كاملة (الأسطر 278–296) واستيراد/استخدام `usePublishedArticles` + `FeedArticleCard` المرتبطين بها.
- استبدال كتلة `{/* Posts */}` (الأسطر 320–340) باستدعاء `<UnifiedActivityFeed lang="ar" />` لعرض كل الأنواع مدموجة.
- إبقاء: الهيدر، StoriesRail، MyChannelsCard، FeedInsights، AdSenseUnit، AiComposer، شارة "منشورات جديدة".
- زر "تحديث" العلوي يبقى يدوياً (لا تحديث تلقائي — احتراماً لقاعدة الذاكرة).

### `src/components/landing/UnifiedActivityFeed.tsx`
- إضافة prop اختياري `variant?: "section" | "embedded"` (افتراضي `section`). في وضع `embedded` يُلغى `<section className="py-16 px-4">` ويُستبدل بـ `<div>` بدون padding خارجي ليناسب تخطيط `/feed`، كما يُخفى عنوان "آخر ما يحدث في الموقع" المكرّر مع هيدر الصفحة.
- تمرير `variant="embedded"` من `feed.tsx`.

## النتيجة

- `/feed`: تدفق واحد موحّد (مقالات + فيديوهات قنوات + منشورات + بث) مرتّب زمنياً، نفس البطاقات الأنيقة بدون كشف يوتيوب، مع views/likes/comments/share.
- لا حذف لأي صفحة أو ميزة. لا تحديث تلقائي.
- لا تغييرات في قاعدة البيانات (المخطط الحالي يكفي).
