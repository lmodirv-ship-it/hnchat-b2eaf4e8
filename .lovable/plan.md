# خطة: Super App موحّد (Facebook + Instagram + TikTok + YouTube + Google)

## الرؤية
تحويل hnChat الحالي إلى **منصة موحّدة معزولة** تجمع أفضل تجارب الشبكات الاجتماعية الكبرى في تجربة واحدة سلسة، دون الاعتماد على أي خدمة خارجية. كل المحتوى والبيانات والتفاعل داخل النظام (Self-hosted Super App).

## ما هو موجود فعليًا (الأساس القوي)
لديك 36 صفحة مفعّلة + قاعدة بيانات كاملة:
- ✅ **Feed + Posts + Likes + Comments** (Facebook-like)
- ✅ **Stories** (Instagram-like) — مع bucket تخزين
- ✅ **Videos + Short Videos** (TikTok/YouTube-like) — مع VideoFeed
- ✅ **Live Stream + Voice Rooms** (Twitch/Clubhouse)
- ✅ **Messages + Conversations** (Messenger/WhatsApp)
- ✅ **Groups + Pages** (Facebook Groups)
- ✅ **Marketplace + hnShop** (Facebook Marketplace)
- ✅ **AI Hub + AI Assistant** (Google Gemini-like)
- ✅ **Profile + Bookmarks + Notifications**

## ما سيُضاف لجعلها تجربة موحّدة حقيقية

### 1. الصفحة الرئيسية الموحّدة (/)
**Hub رئيسي** يجمع كل شيء في "موجز ذكي" مثل الصفحة الرئيسية لـ Facebook لكن بأقسام:
- **Stories rail** (Instagram) في الأعلى
- **Live now** شريط أفقي (TikTok Live)
- **Smart Feed** يدمج: منشورات + reels قصيرة بين كل 3 منشورات + اقتراحات مجموعات + إعلانات
- **Trending sidebar** (Twitter-style) — هاشتاقات + أشخاص للمتابعة

### 2. تجربة TikTok/Reels منغمسة (/reels)
شاشة كاملة عمودية مع تمرير عمودي (snap scroll):
- فيديو ملء الشاشة + أزرار جانبية (إعجاب/تعليق/مشاركة/متابعة)
- تشغيل تلقائي + كتم/فك بنقرة
- الانتقال للفيديو التالي بـ swipe
- يستخدم جدول `posts` مع `type='video'`

### 3. منصة فيديوهات شبيهة بـ YouTube (/watch)
- **مشغّل كبير** + معلومات الفيديو + وصف
- **قائمة Up Next** على اليمين
- **تعليقات** أسفل الفيديو
- زر **Subscribe** (يستخدم نظام `follows` الحالي)
- صفحة قناة منفصلة `/channel/$username`

### 4. بحث Google-like موحّد (/search)
محرّك بحث واحد لكل شيء:
- **All / People / Posts / Videos / Groups / Products** كتبويبات
- نتائج فورية مع debounce
- اقتراحات سريعة
- بحث AI عن إجابات (يستخدم Lovable AI)

### 5. Profile موحّد كـ "كل شيء عن المستخدم"
بناء على `/profile` الحالي، إضافة تبويبات على غرار Instagram/TikTok:
- **Posts** | **Reels** | **Videos** | **Stories Highlights** | **About**
- شبكة 3×N للمنشورات (Instagram grid)
- عدّاد متابعين/متابعة قابل للنقر

### 6. صندوق إنشاء عام (Universal Composer)
زر عائم `+` في كل مكان يفتح modal بـ تبويبات:
- **Post** (نص + صور)
- **Story** (صورة سريعة 24س)
- **Reel** (فيديو قصير)
- **Live** (بدء بث)
- **Marketplace** (منتج)
الكل يُحفظ في الجداول الموجودة بدون تكرار.

### 7. اكتشاف موحّد (/explore — تحسين)
شبكة Pinterest/Instagram Explore: مزيج بصري من Reels + صور + Live thumbnails.

### 8. شريط حالة عام (Top Bar)
في كل صفحة: شعار + بحث Google-style + إشعارات + رسائل + Avatar — تجربة واحدة متّسقة.

## التغييرات التقنية

### ملفات جديدة:
- `src/routes/index.tsx` — Hub الرئيسي الموحّد (Smart Feed)
- `src/routes/_authenticated/reels.tsx` — TikTok-style full-screen
- `src/routes/_authenticated/watch.$videoId.tsx` — YouTube-style player page
- `src/routes/_authenticated/channel.$username.tsx` — صفحة قناة
- `src/components/composer/UniversalComposer.tsx` — صندوق إنشاء عام
- `src/components/composer/FloatingComposeButton.tsx` — زر عائم
- `src/components/layout/TopBar.tsx` — شريط علوي موحّد
- `src/components/feed/SmartFeed.tsx` — موجز يمزج أنواع متعددة
- `src/components/reels/ReelsViewer.tsx` — مشغّل عمودي full-screen
- `src/components/search/UnifiedSearch.tsx` — بحث ذكي موحّد

### ملفات معدّلة:
- `src/routes/_authenticated/profile.tsx` — تبويبات Instagram-style
- `src/routes/_authenticated/explore.tsx` — شبكة بصرية
- `src/routes/_authenticated/search.tsx` — Google-like
- `src/components/AppSidebar.tsx` — تنظيم وإضافة Reels/Watch
- `src/routes/__root.tsx` أو layout — إضافة TopBar + FloatingCompose

### قاعدة البيانات
**لا حاجة لجداول جديدة** — البنية الحالية كافية:
- `posts.type` يميز بين post/video/short
- `stories` للقصص
- `follows` للاشتراكات
- `catalog_items` للمنتجات والتطبيقات
- ستضاف فقط: عمود `posts.thumbnail_url` (اختياري) لمعاينات الفيديو

### التنفيذ على مراحل
نظرًا لحجم العمل، سأنفّذ على **3 جولات** في رسائل متتالية:

**الجولة 1 (هذه):**
- TopBar موحّد + UniversalComposer + FloatingButton
- Smart Feed على الصفحة الرئيسية
- صفحة Reels (TikTok)

**الجولة 2:**
- صفحة Watch (YouTube) + Channel
- بحث موحّد محسّن
- تحسين Profile بتبويبات

**الجولة 3:**
- Explore بشبكة بصرية
- ربط الإشعارات بكل التفاعلات
- صقل التصميم والانتقالات

## الأمان والصلاحيات
- كل المحتوى يستخدم RLS الموجود (ملكية المستخدم لمنشوراته)
- الإجراءات الإدارية تستخدم `useAuth().isAdmin/isOwner`
- لا تكامل مع APIs خارجية — كل شيء داخلي

## النتيجة
بعد الجولات الثلاث: تطبيق موحّد، هوية بصرية واحدة، يمكن للمستخدم التنقل بين تجربة Facebook (Feed/Groups) → Instagram (Stories/Reels) → TikTok (Reels Viewer) → YouTube (Watch/Channels) → Google (Search) كلها داخل **app واحد معزول** بدون مغادرة الموقع.
