
CREATE TABLE IF NOT EXISTS public.ai_tool_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.ai_tool_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view tool categories" ON public.ai_tool_categories FOR SELECT USING (true);
CREATE POLICY "Admins manage tool categories" ON public.ai_tool_categories FOR ALL TO authenticated USING (public.is_owner(auth.uid()) OR public.is_admin(auth.uid()));

CREATE TABLE IF NOT EXISTS public.ai_tools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  long_description TEXT,
  logo_url TEXT,
  website_url TEXT,
  category_id UUID REFERENCES public.ai_tool_categories(id),
  category_slug TEXT,
  rating NUMERIC(2,1) DEFAULT 0,
  is_free BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  pricing_info TEXT,
  pros TEXT[],
  cons TEXT[],
  features JSONB DEFAULT '[]',
  tags TEXT[],
  views_count INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.ai_tools ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view tools" ON public.ai_tools FOR SELECT USING (true);
CREATE POLICY "Admins manage tools" ON public.ai_tools FOR ALL TO authenticated USING (public.is_owner(auth.uid()) OR public.is_admin(auth.uid()));

CREATE INDEX IF NOT EXISTS idx_ai_tools_category ON public.ai_tools(category_slug);
CREATE INDEX IF NOT EXISTS idx_ai_tools_slug ON public.ai_tools(slug);
