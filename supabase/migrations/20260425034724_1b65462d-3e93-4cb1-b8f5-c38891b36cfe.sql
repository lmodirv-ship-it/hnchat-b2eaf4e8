-- Unified catalog/metrics/bookmarks infrastructure for scalable feature pages

-- 1. ENUM for catalog item types
CREATE TYPE public.catalog_item_type AS ENUM (
  'app',
  'game',
  'shop_product',
  'ad_template',
  'push_template',
  'email_template',
  'ai_tool'
);

-- 2. catalog_items: unified table for all "card-like" content
CREATE TABLE public.catalog_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type public.catalog_item_type NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  link_url TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  price NUMERIC(12, 2),
  currency TEXT NOT NULL DEFAULT 'USD',
  rating NUMERIC(3, 2),
  downloads_count BIGINT NOT NULL DEFAULT 0,
  category TEXT,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INT NOT NULL DEFAULT 0,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_catalog_items_type_active ON public.catalog_items(type, is_active);
CREATE INDEX idx_catalog_items_featured ON public.catalog_items(is_featured) WHERE is_featured = true;

ALTER TABLE public.catalog_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY catalog_select_active ON public.catalog_items
  FOR SELECT USING (is_active OR (auth.uid() = created_by) OR public.is_admin(auth.uid()) OR public.is_owner(auth.uid()));

CREATE POLICY catalog_insert_auth ON public.catalog_items
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY catalog_update_own ON public.catalog_items
  FOR UPDATE USING ((auth.uid() = created_by) OR public.is_owner(auth.uid()));

CREATE POLICY catalog_delete_own ON public.catalog_items
  FOR DELETE USING ((auth.uid() = created_by) OR public.is_owner(auth.uid()));

CREATE POLICY catalog_owner_all ON public.catalog_items
  FOR ALL USING (public.is_owner(auth.uid()));

CREATE TRIGGER catalog_items_updated_at
  BEFORE UPDATE ON public.catalog_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3. user_bookmarks: link users to any content (posts, products, videos, catalog_items)
CREATE TABLE public.user_bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  item_type TEXT NOT NULL,
  item_id UUID NOT NULL,
  folder TEXT NOT NULL DEFAULT 'default',
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, item_type, item_id)
);

CREATE INDEX idx_user_bookmarks_user ON public.user_bookmarks(user_id, created_at DESC);

ALTER TABLE public.user_bookmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY bookmarks_select_own ON public.user_bookmarks
  FOR SELECT USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

CREATE POLICY bookmarks_insert_own ON public.user_bookmarks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY bookmarks_delete_own ON public.user_bookmarks
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY bookmarks_update_own ON public.user_bookmarks
  FOR UPDATE USING (auth.uid() = user_id);

-- 4. user_metrics: time-series metric storage for dashboards
CREATE TABLE public.user_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  metric_key TEXT NOT NULL,
  value NUMERIC NOT NULL DEFAULT 0,
  dimension TEXT,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_user_metrics_user_key_time ON public.user_metrics(user_id, metric_key, recorded_at DESC);

ALTER TABLE public.user_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY metrics_select_own ON public.user_metrics
  FOR SELECT USING (auth.uid() = user_id OR public.is_admin(auth.uid()) OR public.is_owner(auth.uid()));

CREATE POLICY metrics_insert_own ON public.user_metrics
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY metrics_owner_all ON public.user_metrics
  FOR ALL USING (public.is_owner(auth.uid()));

-- 5. Seed initial catalog items
INSERT INTO public.catalog_items (type, title, description, image_url, category, price, currency, rating, downloads_count, is_featured, sort_order, metadata) VALUES
-- shop_product
('shop_product', 'hnChat Premium', 'اشتراك شهري بميزات حصرية ولا إعلانات', NULL, 'subscription', 9.99, 'USD', 4.8, 12500, true, 1, '{"period":"month"}'),
('shop_product', 'حزمة 1000 عملة hn', '1000 عملة افتراضية لشراء الهدايا والملصقات', NULL, 'coins', 4.99, 'USD', 4.9, 8200, true, 2, '{"coins":1000}'),
('shop_product', 'حزمة ملصقات Eid', 'مجموعة ملصقات حصرية للأعياد', NULL, 'stickers', 1.99, 'USD', 4.6, 3400, false, 3, '{}'),
('shop_product', 'شارة Verified', 'علامة التحقق الزرقاء لحسابك', NULL, 'badge', 4.99, 'USD', 4.7, 5600, true, 4, '{}'),
-- app
('app', 'hnChat Camera', 'كاميرا متقدمة بفلاتر AR للحظات الفورية', NULL, 'photo', 0, 'USD', 4.5, 22000, true, 1, '{"version":"2.1"}'),
('app', 'hnChat Wallet', 'محفظة موحّدة للعملات والمدفوعات', NULL, 'finance', 0, 'USD', 4.6, 18000, true, 2, '{"version":"1.4"}'),
('app', 'hnChat Translator', 'ترجمة فورية بـ AI لأكثر من 100 لغة', NULL, 'utility', 0, 'USD', 4.7, 15600, false, 3, '{"version":"3.0"}'),
('app', 'hnChat Notes', 'تدوين سريع مع مزامنة عبر الأجهزة', NULL, 'productivity', 0, 'USD', 4.4, 9800, false, 4, '{}'),
('app', 'hnChat Calendar', 'تقويم ذكي مرتبط بمحادثاتك', NULL, 'productivity', 0, 'USD', 4.3, 7200, false, 5, '{}'),
-- game
('game', 'WordChain Battle', 'لعبة كلمات جماعية بالعربية', NULL, 'word', 0, 'USD', 4.8, 45000, true, 1, '{"players":"2-8"}'),
('game', 'Quick Quiz', 'مسابقات سريعة بكل المجالات', NULL, 'trivia', 0, 'USD', 4.6, 32000, true, 2, '{"players":"1-4"}'),
('game', 'Chess Pro', 'شطرنج ضد أصدقائك أو AI', NULL, 'strategy', 0, 'USD', 4.9, 28000, false, 3, '{"players":"2"}'),
('game', 'Color Match', 'لغز ألوان بمستويات متدرجة', NULL, 'puzzle', 0, 'USD', 4.5, 19500, false, 4, '{"players":"1"}'),
-- ad_template
('ad_template', 'إطلاق منتج جديد', 'قالب إعلان لإطلاق منتج بصورة + CTA قوي', NULL, 'product', 0, 'USD', NULL, 0, true, 1, '{"layout":"product","cta":"اشترِ الآن"}'),
('ad_template', 'تخفيضات محدودة', 'قالب عرض ترويجي بعدّاد تنازلي', NULL, 'sale', 0, 'USD', NULL, 0, true, 2, '{"layout":"sale","cta":"اطلب قبل النفاد"}'),
('ad_template', 'اشتراك Premium', 'قالب لترويج اشتراك شهري', NULL, 'subscription', 0, 'USD', NULL, 0, false, 3, '{"layout":"subscription","cta":"ابدأ مجاناً"}'),
-- push_template
('push_template', 'ترحيب بالأعضاء الجدد', 'إشعار ودّي للمستخدمين الجدد بعد التسجيل', NULL, 'onboarding', 0, 'USD', NULL, 0, true, 1, '{"title":"أهلاً بك في hnChat 👋","body":"اكتشف ما يميّزنا من ميزات حصرية"}'),
('push_template', 'تنبيه عرض حصري', 'إشعار لتنبيه المستخدمين بخصم محدود', NULL, 'promo', 0, 'USD', NULL, 0, true, 2, '{"title":"خصم 30% لـ 24 ساعة فقط ⚡","body":"اغتنم الفرصة قبل انتهائها"}'),
('push_template', 'تذكير غير نشط', 'إشعار لإعادة جذب من لم يفتح التطبيق منذ 7 أيام', NULL, 're_engagement', 0, 'USD', NULL, 0, false, 3, '{"title":"اشتقنا لك! 💙","body":"فاتك الكثير، تعال لتستكشف"}'),
-- email_template
('email_template', 'تأكيد التسجيل', 'بريد ترحيبي مع تفعيل الحساب', NULL, 'transactional', 0, 'USD', NULL, 0, true, 1, '{"subject":"أكّد بريدك للبدء"}'),
('email_template', 'نشرة أسبوعية', 'ملخّص أسبوعي بأبرز المحتوى والأنشطة', NULL, 'newsletter', 0, 'USD', NULL, 0, true, 2, '{"subject":"ملخّص أسبوعك في hnChat"}'),
('email_template', 'استعادة كلمة السر', 'بريد تأمين لإعادة تعيين كلمة المرور', NULL, 'security', 0, 'USD', NULL, 0, false, 3, '{"subject":"إعادة تعيين كلمة المرور"}'),
-- ai_tool
('ai_tool', 'كاتب منشورات', 'يولّد منشوراً جذّاباً من فكرة بسيطة', NULL, 'writing', 0, 'USD', 4.7, 12000, true, 1, '{"model":"gemini-2.5-flash","preset":"social_post"}'),
('ai_tool', 'مولّد صور', 'تحويل النص إلى صورة فنية فورية', NULL, 'image', 0, 'USD', 4.8, 18000, true, 2, '{"model":"gemini-3-pro-image-preview","preset":"art"}'),
('ai_tool', 'مساعد ترجمة', 'ترجمة سياقية احترافية بكل اللغات', NULL, 'language', 0, 'USD', 4.6, 9500, false, 3, '{"model":"gemini-2.5-flash","preset":"translator"}'),
('ai_tool', 'محسّن السيرة', 'يحوّل سيرتك الذاتية لنسخة احترافية', NULL, 'writing', 0, 'USD', 4.5, 6800, false, 4, '{"model":"gpt-5-mini","preset":"resume"}');