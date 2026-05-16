
## الوضع الحالي (ما هو موجود فعلاً)

- ✅ `/blog` — صفحة فهرس بمميز + رائج + فلاتر لغة/تصنيف + بحث
- ✅ `/blog/$articleId` — صفحة مستقلة لكل مقال مع SEO كامل وOG وJSON-LD
- ✅ محرر مقالات بـ Markdown + معاينة + رفع صور + SEO فيلدز
- ✅ trigger `article_to_feed_post` ينشر تلقائياً في الفيد
- ✅ تعليقات، إعجابات، مقالات مرتبطة، بطاقة المؤلف

**النتيجة:** البنية ممتازة. ما يحتاج تحسيناً هو **تجربة القارئ** و**تجربة الناشر** ليصبح "من أفضل المدونات".

---

## التحسينات المقترحة (10 تحسينات مركّزة، بدون إعادة تصميم)

### 🔝 صفحة المقال `/blog/$articleId`

1. **Reading Progress Bar** — شريط أعلى الصفحة يتتبع نسبة القراءة (سطر CSS + قليل من JS).
2. **Table of Contents (فهرس تلقائي)** — يُولَّد من عناوين H2/H3 في المحتوى، ثابت على اليسار في الشاشات الكبيرة، قابل للطي على الموبايل، يبرز القسم الحالي عند التمرير.
3. **Drop Cap للحرف الأول** + تحسين تايبوغرافي طفيف (margin أكبر بين الفقرات والعناوين، tracking للعناوين).
4. **Anchor Links على العناوين** — أيقونة 🔗 بجانب كل H2/H3 لنسخ رابط مباشر.
5. **Newsletter inline CTA** — بطاقة اشتراك في منتصف المقال (بعد ثلث المحتوى).
6. **Related Articles بذكاء** — حالياً يجلب الأحدث؛ سيُحدَّث ليكون: نفس التصنيف أولاً، ثم تطابق tags، fallback للأحدث.
7. **زر "نسخ الرابط"** ثابت ضمن الـ StickyShareBar مع تأكيد toast.

### ✍️ تجربة الناشر (ArticleEditor)

8. **بعد النشر** — toast غني يحوي زر "افتح المقال" يفتح `/blog/{short_id}` في tab جديد + زر "نسخ الرابط"، بدل التحويل الفوري لـ `/blog-dashboard`. هذا يحل مباشرة ما طلبه المستخدم: تأكيد إنشاء الصفحة الخاصة.
9. **Slug Validation فورياً** — تحقق من تفرّد الـ slug أثناء الكتابة (debounced) مع علامة ✓ أو ✗.

### 🌐 SEO و Discovery

10. **RSS Feed على `/blog/rss.xml`** — route جديد يصدّر آخر 30 مقالاً منشوراً بصيغة RSS 2.0 صحيحة. يُضاف link في `__root.tsx` ليكتشفه القراء و Feedly. كذلك التأكد أن `sitemap.xml` يحوي كل المقالات المنشورة (verify فقط، أصلحه إن لزم).

---

## التفاصيل التقنية

### ملفات ستُعدَّل
- `src/routes/blog.$articleId.tsx` — إضافة ReadingProgressBar, TableOfContents, drop cap, anchor links, newsletter CTA الوسطى
- `src/components/blog/ArticleEditor.tsx` — تعديل `doSave`: عند publish، إظهار dialog/toast بزر فتح المقال بدل التحويل المباشر
- `src/hooks/useBlog.ts` — تحسين `useRelatedArticles` (تصنيف ثم tags ثم recent)
- `src/routes/__root.tsx` — إضافة `<link rel="alternate" type="application/rss+xml" href="/blog/rss.xml">`
- `src/routes/sitemap[.]xml.tsx` — التحقق من تضمين كل المقالات

### ملفات جديدة
- `src/routes/blog/rss[.]xml.tsx` — server route يعيد XML
- `src/components/blog/ReadingProgressBar.tsx`
- `src/components/blog/TableOfContents.tsx`
- `src/components/blog/PublishSuccessDialog.tsx`

### قاعدة البيانات
لا تغييرات. كل شيء يعمل على الجداول الحالية (`articles`, `article_categories`, `article_likes`, `article_comments`).

---

## ما لن أفعله (احتراماً للذاكرة)

- ❌ لن أعيد تصميم المدونة أو أغيّر الهوية البصرية الحالية (الـ glassmorphism الداكن)
- ❌ لن أحذف أي ميزة موجودة (المميز، الرائج، الفلاتر، الفيد...)
- ❌ لن أضيف auto-refresh لأي صفحة
- ❌ لن أغيّر بنية الـ routes أو نظام الـ short_id

---

## التحقق بعد التنفيذ

1. إنشاء مقال جديد ونشره → ظهور dialog بزر "افتح المقال" يفتح URL الصحيح
2. فتح مقال طويل → ظهور TOC، شريط التقدم يتحرك، النقر على H2 ينسخ الرابط
3. زيارة `/blog/rss.xml` → XML صحيح يُحمَّل
4. زيارة `/sitemap.xml` → كل المقالات مدرجة

هل أبدأ بالتنفيذ؟
