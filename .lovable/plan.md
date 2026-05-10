## المشكلة

الفراغ الكبير الظاهر في صفحة `/feed` بين شريط المؤشرات (رائج/نشط/AI) ومُنشئ المنشورات (AI Composer) سببه كتلة `AdSenseUnit` (السطور 279–282 في `src/routes/_authenticated/feed.tsx`). عندما لا يتم تعبئة الإعلان من Google AdSense، يبقى العنصر `<ins class="adsbygoogle">` فارغاً لكنه يحجز مساحة عمودية كبيرة (خاصةً مع `format="auto"` و responsive).

## الحل

إزالة كتلة `AdSenseUnit` من `feed.tsx` فقط (مع استيرادها)، لأن صفحة `/feed` لا تحتاج إعلاناً وسيطاً بين المؤشرات والمُنشئ. هذا يلغي الفراغ نهائياً.

## التغييرات

### `src/routes/_authenticated/feed.tsx`
- حذف كتلة الإعلان (الأسطر 279–282):
  ```
  {/* Ad Unit */}
  <div className="mb-5">
    <AdSenseUnit className="rounded-xl overflow-hidden" />
  </div>
  ```
- حذف الاستيراد غير المستخدم: `import { AdSenseUnit } from "@/components/ads/AdSenseUnit";`

## ما لن يتغير

- لن يتم حذف أي صفحة أو ميزة.
- باقي مكونات الصفحة (Stories، MyChannelsCard، FeedInsights، AiComposer، UnifiedActivityFeed، شارة المنشورات الجديدة) تبقى كما هي.
- `AdSenseUnit` نفسه يبقى موجوداً ويُستخدم في صفحات أخرى.
- لا تحديثات تلقائية، لا تغييرات في قاعدة البيانات.

## النتيجة

- اختفاء الفراغ بين شريط المؤشرات و AI Composer.
- ترتيب المحتوى في `/feed` يصبح: الهيدر → Stories → قنواتي → المؤشرات → AI Composer → شارة "منشورات جديدة" (إن وُجدت) → التدفق الموحّد.
