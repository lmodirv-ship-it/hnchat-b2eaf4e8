# خطة تسريع انتشار hnChat

سنُنفّذ 5 ميزات بالترتيب — كل ميزة منها كاملة ومستقلة وتزيد فرص النمو.

---

## 1. أساس SEO (الظهور في جوجل ومشاركات السوشيال) 🔍

**الهدف**: جوجل يفهرس كل صفحة، ومشاركات الروابط على واتساب/فيسبوك/تويتر تظهر بصورة جذابة.

**ما سيتم تنفيذه:**
- `public/robots.txt` — يسمح للزواحف بفهرسة الموقع
- `src/routes/sitemap[.]xml.tsx` — sitemap ديناميكي يحوي كل المنشورات والصفحات العامة من قاعدة البيانات
- صورة OG افتراضية (`public/og-image.png`) — معاينة جذابة لمشاركات الروابط
- إضافة `og:image` و `twitter:card` و `canonical` للصفحة الرئيسية
- صفحات منفصلة بـ `head()` خاص بكل واحدة: `/about`, `/explore`, `/marketplace` (إن لم تكن موجودة)
- JSON-LD منظم (Schema.org) من نوع `WebApplication` و `Organization` في الجذر
- meta tags خاصة بالعربية (`og:locale: ar_AR`)

---

## 2. نظام الإحالة (Referral) 🎁

**الهدف**: كل مستخدم يدعو أصدقاءه ويحصل على مكافأة → نمو فيروسي.

**قاعدة البيانات (migration):**
- جدول `referrals`: `referrer_id`, `referred_id`, `created_at`, `reward_granted`
- إضافة عمود `referral_code` (نص فريد قصير) لجدول `profiles`
- trigger يولّد `referral_code` تلقائياً عند إنشاء أي ملف شخصي
- عداد `referrals_count` في `profiles`

**الواجهة:**
- صفحة `/invite` تعرض:
  - رابط الإحالة الشخصي مع زر نسخ
  - QR code للرابط
  - زر مشاركة على واتساب/تيليجرام/تويتر مباشرة
  - عداد عدد الذين دعوتهم
  - leaderboard لأكثر 10 مستخدمين دعوة
- في صفحة التسجيل: قبول `?ref=CODE` من الرابط وحفظه
- بعد التسجيل: ربط المستخدم الجديد بمن دعاه + منح badge "مدعو من X"

**المكافآت المقترحة:**
- بعد 5 دعوات: badge "Influencer"
- بعد 10: badge "Ambassador" + تمييز في الملف
- بعد 25: badge "VIP" + شارة ذهبية

---

## 3. PWA (تطبيق قابل للتثبيت) 📲

**الهدف**: الزوار يثبّتون الموقع كتطبيق على الهاتف بضغطة → عودة مستمرة.

**ما سيتم:**
- تحديث `manifest.webmanifest` كاملاً (الاسم، الأيقونات، الألوان، الاختصارات)
- إضافة Service Worker للتخزين المؤقت (يعمل أوفلاين جزئياً)
- شاشة splash مخصصة
- prompt تلقائي "ثبّت hnChat على هاتفك" بعد ثاني زيارة
- اختصارات سريعة (shortcuts) في القائمة: Feed, Messages, Marketplace

---

## 4. نظام Badges & Leaderboard 🏆

**الهدف**: تحفيز المستخدمين على النشاط اليومي → engagement أعلى.

**قاعدة البيانات:**
- جدول `badges`: `id`, `name`, `description`, `icon`, `criteria`
- جدول `user_badges`: `user_id`, `badge_id`, `earned_at`
- function `check_and_award_badges(user_id)` تُشغّل عند كل نشاط

**Badges جاهزة:**
- "First Post", "10 Posts", "100 Posts"
- "First Like", "100 Likes Received"
- "Early Adopter" (لأول 1000 مستخدم)
- "Verified", "Influencer", "Ambassador"
- "Streak 7" (نشاط 7 أيام متتالية)

**الواجهة:**
- عرض الـ badges في الملف الشخصي
- صفحة `/leaderboard` تعرض:
  - أكثر المستخدمين منشورات
  - أكثر إعجاباً
  - أكثر متابعين
  - تحديث أسبوعي

---

## 5. إشعارات Push 🔔

**الهدف**: إعادة الزوار للموقع تلقائياً.

**ما سيتم:**
- تفعيل Web Push API في الـ Service Worker
- جدول `push_subscriptions` لتخزين اشتراكات المستخدمين
- زر "تفعيل الإشعارات" في الإعدادات
- Edge function لإرسال الإشعارات عند:
  - رسالة جديدة
  - تعليق على منشورك
  - إعجاب جديد
  - متابع جديد
- إعدادات تفصيلية يختار منها المستخدم نوع الإشعارات

---

## ترتيب التنفيذ

سأنفذ كل خطوة وأخبرك عند الانتهاء قبل الانتقال للتالية، حتى تتمكن من المراجعة.

1. ✅ **SEO** (سريعة - بدون قاعدة بيانات)
2. ✅ **Referral** (متوسطة - migration + صفحة)
3. ✅ **PWA** (سريعة - service worker)
4. ✅ **Badges + Leaderboard** (متوسطة - migration + صفحات)
5. ✅ **Push Notifications** (الأطول - VAPID keys + edge function)

---

## ملاحظة مهمة

بعد تنفيذ كل خطوة:
- اضغط **Publish → Update** لتطبيق التغييرات على الموقع المباشر
- بعد SEO: سجّل الموقع في **Google Search Console** وأرسل sitemap
- بعد Push: سيُطلب منك تأكيد إضافة VAPID keys (مفاتيح أمنية لإشعارات Push)

هل توافق على البدء؟
