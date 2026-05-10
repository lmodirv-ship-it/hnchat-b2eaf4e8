## التغييرات المطلوبة

### 1) نقل زر لون خلفية الـ Composer إلى TopBar بجانب زر الإشعارات
- إزالة الزر الذي أضفته داخل `AiComposer` في `src/routes/_authenticated/feed.tsx` (التراجع عن إدراج الـ Popover ولكن **الإبقاء** على تطبيق `composerBg` كخلفية للـ Textarea عبر `useComposerColor`).
- إضافة زر جديد في `src/components/layout/TopBar.tsx` **مباشرة قبل** زر الإشعارات (الجرس) — أيقونة `PaintBucket` من lucide — يفتح Popover صغير فيه:
  - 8 ألوان جاهزة (نفس اللوحة).
  - زر "إعادة تعيين".
- يستخدم نفس hook `useComposerColor` (ينعكس فوراً على Textarea في صفحة feed لأنه يقرأ من نفس عمود `profiles.composer_bg_color`).

### 2) تطبيق "لون الأزرار" على **كل** أزرار الشريط الجانبي
حالياً `--theme-btn` في `src/components/AppSidebar.tsx` يُطبَّق فقط على الزر **النشط** (السطر 60 و 139). نحتاج تطبيقه على كل العناصر:
- في `SidebarLink`: تغيير `themeBtnStyle` ليُحسب دائماً عندما `btnColor` معرّف:
  - النشط: `backgroundColor: btnColor` (لون كامل) + `color: white`.
  - غير النشط: `backgroundColor: color-mix(in oklch, btnColor 18%, transparent)` كي يظل مرئياً لكن أخف.
- نفس الشيء للحالة المطوية (collapsed) في `SidebarGroup` (السطر 59-61).
- لقراءة `btnColor`: استدعاء `useThemeColors()` داخل `SidebarLink` و `SidebarGroup` (أو تمريره عبر prop من `AppSidebar` لتفادي استدعاء الـ hook كثيراً — سنمرّره prop).

### 3) تنظيف
- إزالة `Popover` و `Palette` و `useComposerColor` import من `feed.tsx` (لأنها لم تعد مستخدمة هناك)، مع إبقاء `composerBg` style على الـ Textarea عن طريق استدعاء `useComposerColor()` فقط (بدون UI).

## ملاحظات
- لا تغيير في قاعدة البيانات (العمود `composer_bg_color` و `btn_color` موجودان).
- لا تغيير في الصفحات أو التنقل.
- التطبيق فوري: تغيير اللون من TopBar يُحدّث Textarea في feed وأزرار السايدبار كلها.
