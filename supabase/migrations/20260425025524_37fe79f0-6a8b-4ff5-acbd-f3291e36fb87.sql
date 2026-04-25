-- Remove all elevated roles from admin@hnchat.demo
DELETE FROM public.user_roles
WHERE user_id = 'c365fef4-f2d1-46be-920f-8070bf3f9d01'
  AND role IN ('owner','admin');

-- Grant owner role to lmodurv@gmail.com if account already exists
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'owner'::app_role FROM auth.users WHERE email = 'lmodurv@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- Trigger: auto-assign owner role when lmodurv@gmail.com signs up
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