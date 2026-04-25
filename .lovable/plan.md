# خطة: تفعيل جميع الصفحات بنية قابلة للتوسع

## التحدي
11 صفحة placeholder حالياً تعرض "Coming Soon" فقط. المطلوب تفعيل وظيفي حقيقي مع بنية تحتية تجعل التوسع المستقبلي سهلاً.

## فلسفة الحل: "Generic Items + Categories" قابلة للتوسع
بدل بناء 11 جدولاً منفصلاً، أُنشئ **بنية تحتية موحّدة** تخدم كل الصفحات:

### 1. جداول قاعدة بيانات قابلة للتوسع (3 جداول فقط)
- **`catalog_items`** — جدول موحّد لكل ما يُعرض كـ"بطاقة": apps, games, shop products, AI tools, push templates, email templates...
  - `id, type (enum), title, description, image_url, link_url, metadata jsonb, price, currency, rating, downloads_count, is_featured, is_active, sort_order, created_by, created_at`
  - `type` enum: `app, game, shop_product, ad_template, push_template, email_template, ai_tool, bookmark`
  - يخدم: hnShop, App Store, Games, AI Assistant catalog, Ads & Promo templates, Push templates, Email templates
- **`user_bookmarks`** — لربط المستخدمين بأي محتوى (posts, products, videos, catalog_items)
  - `id, user_id, item_type, item_id, folder, created_at`
  - يخدم: Bookmarks
- **`user_metrics`** — لتخزين إحصاءات قابلة للعرض (growth, monitoring)
  - `id, user_id, metric_key, value numeric, dimension text, recorded_at`
  - يخدم: Growth Analytics, Monitoring Pro

كلها مع RLS كاملة:
- `catalog_items`: قراءة عامة للنشط؛ كتابة للمالك أو owner
- `user_bookmarks`: كل مستخدم يرى/يدير الخاص به
- `user_metrics`: كل مستخدم يرى الخاص به + admin يرى الكل

### 2. مكونات مشتركة (3 مكونات)
- **`<CatalogGrid type="..." />`** — يجلب من `catalog_items` بنوع معيّن، يعرض شبكة بطاقات بحث/فلتر
- **`<CatalogCard />`** — بطاقة موحّدة (صورة، عنوان، وصف، سعر/تحميل، CTA)
- **`<MetricsDashboard userId="..." />`** — لوحة إحصاءات تستهلك `user_metrics`

### 3. تفعيل الصفحات الـ 11

| الصفحة | التفعيل |
|---|---|
| **hnshop** | `<CatalogGrid type="shop_product" />` + بحث + فلتر فئات + Empty state حقيقي |
| **app-store** | `<CatalogGrid type="app" />` + tabs (مثبّت/مقترح/جديد) |
| **games** | `<CatalogGrid type="game" />` + tabs (mine/popular) |
| **ai-assistant** | محادثة AI حقيقية مع `lovable-ai` (تستفيد من edge function `ai-chat` الموجود) + سجل محادثات في sessionStorage |
| **ads-promo** | `<CatalogGrid type="ad_template" />` لقوالب جاهزة + زر "أنشئ من قالب" يفتح dialog من Ads Manager الموجود |
| **push** | `<CatalogGrid type="push_template" />` + form لإرسال إشعار test (يكتب في `notifications` للـ user الحالي فقط) |
| **email-dashboard** | `<CatalogGrid type="email_template" />` + إحصائيات وهمية مع المتغيّر `user_metrics` |
| **bookmarks** | يقرأ من `user_bookmarks` بـ tabs لكل `item_type`، مع زر إزالة |
| **growth** | `<MetricsDashboard />` يقرأ من `user_metrics`: متابعون، إعجابات، مشاهدات، نمو 7/30 يوم؛ مع رسم recharts |
| **monitoring** | يعرض حالة الخدمات (DB ping، last sign-in من `auth.users` عبر RPC) + uptime من `user_metrics` |
| **short-videos** | يعيد استخدام `<VideoFeed />` الموجود مع فلتر `posts.type = 'short'` بدل `'video'` |

### 4. بيانات افتتاحية (seed)
عبر `INSERT` بسيط: ~20-30 صف في `catalog_items` موزّعة على الأنواع لتعطي للصفحات محتوى يظهر فوراً.

## التنفيذ بدفعتين

### الدفعة A — البنية التحتية + 5 صفحات
1. Migration: enum `catalog_item_type` + 3 جداول + RLS + triggers `updated_at`
2. Seed بيانات تجريبية
3. مكونات: `CatalogGrid`, `CatalogCard`, `MetricsDashboard`
4. تفعيل: `hnshop`, `app-store`, `games`, `ads-promo`, `bookmarks`

### الدفعة B — 6 صفحات متبقية
5. تفعيل: `short-videos`, `ai-assistant`, `push`, `email-dashboard`, `growth`, `monitoring`
6. حذف import `ComingSoon` من الصفحات المُفعّلة (يبقى المكون لاستخدام مستقبلي)
7. `tsc --noEmit` للتحقق

## الملفات

**جديد**:
- `supabase/migrations/<ts>_catalog_metrics_bookmarks.sql`
- `src/components/catalog/CatalogGrid.tsx`
- `src/components/catalog/CatalogCard.tsx`
- `src/components/catalog/MetricsDashboard.tsx`
- `src/hooks/useCatalog.ts` (TanStack Query hook موحّد)

**تعديل** (11 ملف صفحة):
- جميع ملفات الـ placeholder المذكورة أعلاه

## ما لن أفعله
- لن أبني نظام مدفوعات حقيقي لـ hnShop (يحتاج Stripe — يمكن إضافته لاحقاً)
- لن أبني تكامل Push API حقيقي للمتصفح (الإشعار يُحفظ في DB فقط)
- لن أبني نظام upload فيديو جديد لـ short-videos (يعيد استخدام `videos` bucket والمنشورات)
- لن أبني تكامل بريد حقيقي (email-dashboard للقوالب والإحصاءات فقط)

كل هذه يمكن إضافتها لاحقاً فوق نفس البنية بدون تغيير هيكلي.

## التوسع المستقبلي
أي صفحة جديدة تحتاج "كتالوج" تستخدم `<CatalogGrid type="new_type" />` — يكفي إضافة قيمة للـ enum وصفّ بيانات. أي إحصاءات جديدة تكتب في `user_metrics` بـ `metric_key` جديد.
