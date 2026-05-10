## الهدف
إضافة زر صغير ضمن أزرار شريط AI Composer (بجانب شارة "AI Composer" و عدّاد الحروف) في صفحة `/feed`، يفتح منتقي ألوان لتغيير **خلفية مربع كتابة المنشور** (`Textarea`) فقط — مع حفظ اللون لكل مستخدم في قاعدة البيانات.

## التغييرات

### 1) قاعدة البيانات (Lovable Cloud)
إضافة عمود جديد على جدول `profiles`:
- `composer_bg_color text` (يقبل null) — يخزّن لون الخلفية المختار للـ Composer (مثل `oklch(...)` أو `#hex`).

(لن نلمس باقي حقول الألوان `bg_color/text_color/btn_color` الموجودة أصلاً.)

### 2) Hook جديد: `src/hooks/useComposerColor.ts`
- يقرأ `composer_bg_color` من `profiles` للمستخدم الحالي.
- يوفّر `color` و `setColor(value)` مع حفظ debounced في DB (بنفس نمط `useThemeColors`).
- لا يُطبّق متغيرات CSS عامة — فقط يُرجع القيمة لاستخدامها inline على الـ Textarea.

### 3) تعديل `src/routes/_authenticated/feed.tsx` (داخل `AiComposer`)
- استدعاء `useComposerColor()`.
- إضافة زر صغير دائري (Popover) في الشريط العلوي للـ Composer، **بجانب شارة "AI Composer" و قبل عداد `440/2000`**:
  - أيقونة `Palette` من `lucide-react`.
  - عند الضغط يفتح `Popover` صغير فيه:
    - شبكة من 6–8 ألوان جاهزة (نفس لوحة الثيم: navy افتراضي، بنفسجي، أخضر، وردي، رمادي داكن، أسود، شفاف).
    - زر "إعادة تعيين" يمسح اللون.
- تطبيق اللون على `Textarea` عبر `style={{ backgroundColor: color || "transparent" }}` — بدون تغيير باقي ستايلات الكومبوزر أو الصفحة.

### 4) لا تغييرات على
- باقي الصفحات أو الثيم العام.
- الـ Sidebar / TopBar / الـ Feed نفسه.
- التحديث التلقائي (يبقى يدوي كما هو في الذاكرة).

## ملاحظات تقنية
- موضع الزر: داخل `<div className="flex items-center gap-2 mb-3">` في `AiComposer`، قبل `<div className="flex-1" />`.
- الزر بحجم `h-6 w-6 rounded-full` ليتناسق مع الشارات الموجودة.
- RLS: العمود الجديد يخضع لسياسات `profiles` الحالية (المستخدم يحدّث صفّه فقط) — لا حاجة لسياسات إضافية.
