## الوضع الحالي

- `admin@hnchat.demo` موجود في قاعدة البيانات (لكن دوره `user` فقط، وليس `owner` فعلياً).
- `lmodurv@gmail.com` **غير مسجل** في الموقع حتى الآن — لا يوجد حساب له في نظام المصادقة.

## الخطة

### 1. التأكد من تسجيل lmodurv@gmail.com
يجب على `lmodurv@gmail.com` التسجيل أولاً عبر صفحة `/sign-up-login` في الموقع لإنشاء حساب. بدون حساب لا يمكن منحه أي صلاحية.

### 2. إنشاء Trigger تلقائي للمالك (حل دائم وآمن)
بدلاً من تنفيذ SQL يدوي في كل مرة، سننشئ trigger في قاعدة البيانات:
- عند تسجيل أي حساب جديد بإيميل `lmodurv@gmail.com` → يُمنح دور `owner` تلقائياً.
- إذا كان الحساب مسجلاً مسبقاً، سيُمنح الدور فوراً بـ migration.

### 3. إزالة صلاحيات admin@hnchat.demo
- حذف أي دور `owner` أو `admin` من المستخدم `admin@hnchat.demo` (id: `c365fef4-f2d1-46be-920f-8070bf3f9d01`).
- إبقاء دور `user` العادي فقط (أو حذف الحساب كاملاً إذا رغبت لاحقاً).

### 4. تحديث وثائق الإعداد
تحديث أي إشارة في الكود إلى `admin@hnchat.demo` كحساب تجريبي للمالك.

## التفاصيل التقنية

Migration SQL مقترح:

```sql
-- إزالة صلاحيات admin@hnchat.demo
DELETE FROM public.user_roles
WHERE user_id = 'c365fef4-f2d1-46be-920f-8070bf3f9d01'
  AND role IN ('owner','admin');

-- منح المالك للحساب lmodurv@gmail.com إن وُجد الآن
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'owner'::app_role FROM auth.users WHERE email = 'lmodurv@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- Trigger يضيف دور owner تلقائياً عند تسجيل lmodurv@gmail.com
CREATE OR REPLACE FUNCTION public.assign_owner_to_lmodurv()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.email = 'lmodurv@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'owner')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS trg_assign_owner_lmodurv ON auth.users;
CREATE TRIGGER trg_assign_owner_lmodurv
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.assign_owner_to_lmodurv();
```

## ما عليك فعله

1. اطلب من `lmodurv@gmail.com` التسجيل في الموقع عبر `/sign-up-login` (إذا لم يكن قد سجل بعد).
2. وافق على هذه الخطة لأقوم بتنفيذ الـ migration.
3. بعد التسجيل، ادخل بحساب `lmodurv@gmail.com` ثم انتقل إلى `/owner-x9k2m7` لرؤية لوحة المالك.

هل توافق على التنفيذ؟
