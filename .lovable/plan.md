# خطة: صفحة Notifications تفاعلية كاملة

## الوضع الحالي
`src/routes/_authenticated/notifications.tsx` placeholder ثابت ("You're all caught up"). جدول `notifications` موجود في قاعدة البيانات مع RLS مناسب (`notif_select_own` + `notif_update_own`)، وأنواع الإشعارات: `like, comment, follow, mention, message, system`.

## ما سأنفّذه

### إعادة كتابة `src/routes/_authenticated/notifications.tsx`
صفحة كاملة تعرض إشعارات المستخدم الحالي مع:

1. **جلب البيانات** عبر TanStack Query من جدول `notifications`:
   - `select * where user_id = auth.uid() order by created_at desc limit 100`
   - مفتاح cache: `["notifications", user.id]`

2. **تبويبات (tabs)** بثلاث حالات:
   - **الكل** — جميع الإشعارات
   - **غير مقروء** — `is_read = false` (مع شارة العدد)
   - **مقروء** — `is_read = true`
   - تبديل client-side بدون إعادة جلب (تصفية في الذاكرة).

3. **زر "تعليم الكل كمقروء"** في الـ header:
   - mutation: `update notifications set is_read=true where user_id=auth.uid() and is_read=false`
   - معطّل عند عدم وجود إشعارات غير مقروءة
   - toast نجاح/خطأ + invalidate للـ cache.

4. **تعليم إشعار واحد كمقروء**:
   - زر check بجانب كل إشعار غير مقروء
   - تلقائياً عند النقر على إشعار يحتوي `link` (ينقل بـ `<Link>`).

5. **تصميم العنصر الواحد**:
   - أيقونة ملوّنة حسب النوع (Heart/MessageCircle/UserPlus/AtSign/Mail/Sparkles) بتدرّج cyan/violet/pink من design tokens
   - نص "أعجب بمنشورك / علّق / بدأ بمتابعتك..." حسب النوع
   - timestamp نسبي بالعربية (ث/د/س/ي)
   - خلفية مميّزة للإشعارات غير المقروءة (تدرّج cyan-glow خفيف + حدّ ملوّن + نقطة glow)
   - الإشعارات المقروءة بخلفية محايدة باهتة.

6. **Realtime**: قناة Supabase على `notifications` مفلترة بـ `user_id` لتحديث القائمة فوراً عند وصول إشعار جديد.

7. **حالات فارغة وتحميل**:
   - Skeleton loader أثناء الجلب
   - Empty state مخصّص لكل تبويب (لا إشعارات / لا إشعارات غير مقروءة / لا إشعارات مقروءة).

8. **PageShell** مع subtitle ديناميكي يعرض عدد غير المقروء.

## الملفات
- تعديل: `src/routes/_authenticated/notifications.tsx` فقط.

## لا حاجة لـ
- migration (الجدول والسياسات جاهزة)
- ملفات جديدة
- backend changes
