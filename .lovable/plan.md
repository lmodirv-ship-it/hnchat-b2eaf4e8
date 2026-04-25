# استيراد قناة YouTube وعرض كل فيديوهاتها

## الفكرة
يلصق المستخدم رابط قناة YouTube (مثل `youtube.com/@MrBeast` أو `youtube.com/channel/UC...`)، فيعرض الموقع كل فيديوهات القناة في شبكة جميلة، مع إمكانية تشغيل أي فيديو داخل صفحة `/watch-yt/$videoId` بنمط مشابه لـ `/watch/$id`.

## النطاق
صفحة جديدة `/youtube` + صفحة مشاهدة `/watch-yt/$videoId` + Server Function لجلب الفيديوهات + رابط في القائمة الجانبية + تكامل مع البحث الموحّد.

---

## طريقة جلب البيانات (الجزء التقني الحرج)

YouTube لا يسمح بسحب فيديوهات قناة مباشرةً من المتصفح (CORS + شروط الاستخدام). لذلك سنستخدم **خادم TanStack Start** عبر `createServerFn` بإحدى طريقتين:

### الخيار A — RSS العام (مجاني، بدون مفتاح، مُوصى به للبداية)
كل قناة YouTube لها feed عام:  
`https://www.youtube.com/feeds/videos.xml?channel_id=UCxxxxx`

- نُحوّل الرابط الذي ألصقه المستخدم (`@handle` أو `/c/name` أو `/channel/UC...`) إلى `channel_id` بسحب صفحة القناة وقراءة `<meta itemprop="identifier">` أو `channelId` من الـ HTML.
- ثم نقرأ الـ RSS ونُحلّله لاستخراج: عنوان الفيديو، videoId، الصورة المصغّرة، تاريخ النشر، الوصف.
- **القيد**: RSS يُرجع آخر **15 فيديو فقط** من القناة.

### الخيار B — YouTube Data API v3 (يحتاج مفتاحًا، يدعم آلاف الفيديوهات)
- يتطلب مفتاح `YOUTUBE_API_KEY` من Google Cloud Console.
- يعطي قوائم تشغيل كاملة، عدد المشاهدات، المدة، إلخ.

**اقتراحي**: نبدأ بالخيار A (يعمل فورًا بدون أي إعداد)، ونضيف زرّ "تحميل المزيد عبر API" لاحقًا إن أردتَ تفعيل الخيار B.

---

## الملفات الجديدة/المعدّلة

### 1. `src/utils/youtube.functions.ts` (جديد)
Server function:
```ts
resolveYoutubeChannel({ url }) → { channelId, title, avatar, subscribers? }
fetchChannelVideos({ channelId }) → Video[]  // عبر RSS
```
- يستخدم `fetch` على الخادم (لا CORS).
- يُحلّل XML بـ regex بسيطة (لا حاجة لمكتبة).
- يُخزّن النتائج مؤقتًا في الذاكرة لمدة 10 دقائق لتقليل الطلبات.

### 2. `src/routes/_authenticated/youtube.tsx` (جديد)
- حقل إدخال كبير لرابط قناة YouTube + زر "عرض الفيديوهات".
- بطاقة "ملف القناة" (الصورة + الاسم + عدد المشتركين إن توفّر).
- شبكة فيديوهات (responsive grid) مع thumbnail + عنوان + تاريخ.
- نقر على فيديو → `/watch-yt/$videoId`.
- دعم تاريخ القنوات المُستوردة سابقًا (محفوظة في `localStorage` للوصول السريع).

### 3. `src/routes/_authenticated/watch-yt.$videoId.tsx` (جديد)
- مُشغّل YouTube مدمج عبر `<iframe src="https://www.youtube.com/embed/$videoId">` بإطار 16:9.
- عنوان الفيديو + رابط القناة الأصلية.
- **التعليقات**: نُعيد استخدام `CommentsSection` لكن بـ `postId` ديناميكي — نُنشئ سجلًا في جدول `posts` بنوع خاص (`type = 'video'`) عند أول مشاهدة لكل فيديو YouTube حتى يقدر المستخدمون يعلّقوا داخل تطبيقنا (التعليقات داخلية، لا تُرسل لـ YouTube).
- زر "فتح في YouTube" للوصول للأصل.

### 4. `src/components/AppSidebar.tsx` (تعديل بسيط)
إضافة بند "YouTube" مع أيقونة `Youtube` من lucide-react يقود إلى `/youtube`.

### 5. (اختياري) `src/routes/_authenticated/search.tsx`
إضافة تبويب "YouTube" في البحث الموحّد يستدعي نفس الـ server function لو كان الاستعلام رابط قناة.

---

## مخطط البيانات

لا حاجة لجدول جديد. نستخدم جدول `posts` الموجود لتخزين فيديوهات YouTube المعروضة (لأجل التعليقات الداخلية فقط)، مع:
- `type = 'video'`
- `media_urls = [`https://www.youtube.com/embed/${videoId}`]`
- `content = العنوان`
- ميتاداتا في حقل النص (مصدر = youtube، videoId).

أو نتركها بالكامل بدون تخزين، ونُفعّل التعليقات فقط عند الطلب.

---

## QA
- لصق `https://www.youtube.com/@MrBeast` → عرض آخر 15 فيديو.
- لصق `https://www.youtube.com/channel/UCX6OQ3DkcsbYNE6H8uQQuVA` → نفس النتيجة.
- نقر فيديو → التشغيل في `/watch-yt/$videoId` بـ iframe.
- التعليقات تعمل وتُحفظ.

---

## ملاحظة قانونية
عرض فيديوهات YouTube عبر `<iframe>` الرسمي مسموح بشروط YouTube (Embed Player). سحب الميتاداتا من RSS العام مسموح أيضًا. لا نقوم بتنزيل الفيديوهات نفسها.

---

هل توافق على البدء بـ **الخيار A (RSS مجاني، آخر 15 فيديو لكل قناة)**؟ أم تفضّل تفعيل الخيار B (YouTube API بمفتاح، فيديوهات غير محدودة) من البداية؟
