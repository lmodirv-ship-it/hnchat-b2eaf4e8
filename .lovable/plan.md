## نظرة عامة

**hnChat** = منصة اجتماعية شاملة شعارها "Your World. One App." — تجمع التواصل الاجتماعي، الفيديوهات القصيرة، البث المباشر، السوق التجاري، والتوصيات بالذكاء الاصطناعي في تطبيق واحد بهوية بصرية مستقبلية (Diamond/Ice).

سنبني نسخة Lovable من الموقع تطابق التصميم الحالي على hnchat.net، مع تنفيذ الوظائف الأساسية فعلياً (وليس فقط واجهة).

> ⚠️ **تنبيه أمني عاجل:** مفتاح **Brevo API** الذي ظهر في `.env` المرفوع أصبح مكشوفاً علنياً. يجب إلغاؤه وإنشاء بديل من لوحة Brevo فوراً.

---

## الإصدار الأول (MVP) — ما سيُبنى

### 1. صفحة الترحيب / تسجيل الدخول `/sign-up-login`
نسخة طبق الأصل من الصفحة الحالية:
- **العمود الأيسر:** شعار hnChat، عنوان "Your World. One App."، وصف، وقائمة المميزات الخمس مع أيقونات سماوية متوهجة (Messaging, Short Videos, Marketplace, Smart Search, AI Recommendations)
- **العمود الأيمن:** بطاقة زجاجية تحوي:
  - شارة "Early access open"
  - تبويبان: **Join hnChat** / **Sign In**
  - زر "Sign up with Google"
  - نموذج بريد + كلمة سر (مع Full Name, Username, Confirm Password للتسجيل)
  - زر متدرج "Join hnChat Now"
  - بطاقة **Demo Accounts** (Creator, Shopper, Admin) لتعبئة سريعة
- **شريط سفلي:** Early Access Open · Growing Fast · 100% Free to Join

### 2. الخلاصة الرئيسية `/feed` (الصفحة بعد الدخول)
- عمود يسار: شريط جانبي للتنقل (Home, Explore, Videos, Marketplace, Messages, Profile)
- عمود وسط: تدفق منشورات (نص + صور)، إعجاب، تعليق، مشاركة
- عمود يمين: اقتراحات متابعة + موضوعات رائجة

### 3. الفيديوهات القصيرة `/videos`
- عرض عمودي بملء الشاشة (TikTok-style)
- تشغيل/إيقاف عند التمرير
- إعجاب، تعليق، مشاركة

### 4. السوق `/marketplace`
- شبكة منتجات (صورة، اسم، سعر، بائع)
- بحث وفلاتر بالفئة
- صفحة تفاصيل منتج بسيطة

### 5. الرسائل `/messages`
- قائمة محادثات + نافذة محادثة 1-1 لحظية
- مؤشر "كاتب الآن" والقراءة
- بحث في المحادثات

### 6. الملف الشخصي `/profile/$username`
- صورة غلاف + صورة شخصية + bio + إحصائيات (متابعون/متابَعون/منشورات)
- شبكة منشورات المستخدم
- زر Follow/Unfollow

### 7. الإعدادات `/settings`
- الملف الشخصي، الخصوصية، الإشعارات، تسجيل الخروج

---

## الهوية البصرية (طبقاً للموقع الأصلي)

| العنصر | القيمة |
|---|---|
| الخلفية | أسود جليدي `#050508` → `#0a0a12` (متدرج) |
| لون أساسي | سماوي توهج `#00d2ff` |
| لون ثانوي | بنفسجي `#9b59ff` ووردي `#e879f9` |
| البطاقات | زجاجية: `rgba(255,255,255,0.04)` + blur + حدود رفيعة |
| الأزرار الأساسية | متدرج سماوي→بنفسجي مع توهج |
| الخط | **Plus Jakarta Sans** (نصوص) + **JetBrains Mono** (كود) |
| الأيقونات | lucide-react بتوهج سماوي |
| التأثيرات | glassmorphism, glow shadows, smooth transitions |
| الشعار | فقاعة محادثة بنفسجية متدرجة + برق سماوي |

---

## البنية التقنية

### قاعدة البيانات (Lovable Cloud)

```text
profiles          → id, username, full_name, avatar_url, bio, role
posts             → id, user_id, content, media_url, type (post/video), created_at
comments          → id, post_id, user_id, content, created_at
likes             → id, post_id, user_id (unique pair)
follows           → follower_id, following_id (unique pair)
conversations     → id, created_at
conversation_participants → conversation_id, user_id
messages          → id, conversation_id, sender_id, content, created_at, read_at
products          → id, seller_id, title, description, price, images, category
user_roles        → user_id, role (admin/creator/shopper) ← جدول منفصل لمنع الصلاحيات الخاطئة
```

كل جدول محمي بـ **Row-Level Security (RLS)** صارمة.

### المسارات (TanStack Start)

```text
src/routes/
├── __root.tsx
├── index.tsx              → إعادة توجيه إلى /sign-up-login أو /feed
├── sign-up-login.tsx      → عام
├── _authenticated.tsx     → بوابة الحماية
└── _authenticated/
    ├── feed.tsx
    ├── videos.tsx
    ├── marketplace.tsx
    ├── marketplace.$id.tsx
    ├── messages.tsx
    ├── messages.$conversationId.tsx
    ├── profile.$username.tsx
    └── settings.tsx
```

### الذكاء الاصطناعي
**Lovable AI Gateway** (Gemini + GPT-5، بدون مفاتيح):
- توصيات منشورات/مستخدمين على `/feed`
- بحث ذكي عن المنتجات في `/marketplace`

### المصادقة
- بريد + كلمة سر عبر Lovable Cloud
- جدول `profiles` مع trigger لإنشاء profile تلقائياً عند التسجيل
- Google OAuth (يحتاج إعداداً لاحقاً من المستخدم)

---

## ما لن يُبنى في الإصدار الأول

لتجنّب التضخم، سنؤجل لمراحل لاحقة:
- البث المباشر (Live Streams) — يتطلب WebRTC وبنية تحتية معقدة
- المدفوعات الفعلية (Stripe) — يُضاف عند جاهزية المتجر
- إشعارات Push
- Brevo للبريد — Lovable Cloud يوفر بريد مدمج
- Google Analytics + AdSense — تُضاف بعد النشر

---

## ملاحظات مهمة

1. **الإطار يتغير:** الكود الأصلي مبني بـ Next.js — Lovable تستخدم TanStack Start. سنعيد كتابة الكود بنفس التصميم والوظائف، وليس نسخه حرفياً.

2. **قاعدة البيانات الحالية لن تُربط:** سننشئ قاعدة جديدة عبر Lovable Cloud بدلاً من استخدام مشروع Supabase الحالي (لتفادي تضارب المفاتيح والحفاظ على الأمان). إن أردت لاحقاً، يمكن نقل البيانات يدوياً.

3. **الحسابات التجريبية (Demo Accounts):** سأنشئها فعلياً في قاعدة البيانات (Creator, Shopper, Admin) مع بيانات أولية لكل دور حتى تعمل أزرار "Use" مباشرة.

---

## ترتيب التنفيذ بعد الموافقة

1. تفعيل Lovable Cloud + إعداد المصادقة
2. تطبيق ثيم Diamond/Ice (ألوان، خطوط، تأثيرات زجاجية)
3. إنشاء جداول قاعدة البيانات + RLS + Trigger للـ profiles
4. بناء صفحة `/sign-up-login` مطابقة للأصل
5. بناء بوابة `_authenticated` + Header + Sidebar مشترك
6. صفحة `/feed` مع المنشورات والإعجاب والتعليق
7. صفحة `/videos`
8. صفحة `/marketplace` + تفاصيل المنتج
9. صفحة `/messages` لحظية
10. صفحة `/profile/$username` + `/settings`
11. إضافة Lovable AI للتوصيات والبحث الذكي
12. إنشاء بيانات Demo + 3 حسابات تجريبية

اضغط **Implement plan** لبدء البناء، أو أخبرني بتعديل تريده.