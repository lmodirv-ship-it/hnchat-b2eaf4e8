-- 1. Extend role enum with 'owner' and 'group_admin'
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'owner';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'group_admin';