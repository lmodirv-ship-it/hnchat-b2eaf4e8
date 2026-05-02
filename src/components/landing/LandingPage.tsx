import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { HnLogo } from "@/components/HnLogo";
import {
  MessageCircle,
  Bot,
  ShoppingBag,
  TrendingUp,
  Mic,
  Video,
  Sparkles,
  Shield,
  Users,
  Globe,
  Zap,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: "easeOut" },
  }),
};

const features = [
  { icon: Bot, title: "ذكاء اصطناعي متقدم", desc: "دردش مع أقوى نماذج AI واحصل على إجابات فورية", color: "from-cyan-glow to-primary-glow" },
  { icon: MessageCircle, title: "مراسلة فورية", desc: "تواصل مع أصدقائك برسائل نصية وصوتية ومرئية", color: "from-violet-glow to-pink-glow" },
  { icon: Mic, title: "غرف صوتية حية", desc: "انضم لغرف نقاش صوتية مع مجتمعك المفضل", color: "from-pink-glow to-violet-glow" },
  { icon: ShoppingBag, title: "سوق إلكتروني", desc: "اشترِ وبِع المنتجات في سوق متكامل وآمن", color: "from-cyan-glow to-violet-glow" },
  { icon: TrendingUp, title: "تداول العملات", desc: "تابع أسعار العملات الرقمية وتداول بسهولة", color: "from-violet-glow to-cyan-glow" },
  { icon: Video, title: "فيديوهات قصيرة", desc: "شاهد وأنشئ فيديوهات قصيرة ممتعة", color: "from-pink-glow to-cyan-glow" },
];

const stats = [
  { value: "10K+", label: "مستخدم نشط" },
  { value: "50K+", label: "محادثة AI يومياً" },
  { value: "1M+", label: "رسالة مُرسلة" },
  { value: "99.9%", label: "وقت التشغيل" },
];

const featuredChats = [
  { title: "مساعد البرمجة", desc: "اكتب كوداً احترافياً بمساعدة AI", icon: Zap },
  { title: "مترجم ذكي", desc: "ترجم أي نص لأي لغة فوراً", icon: Globe },
  { title: "كاتب محتوى", desc: "أنشئ محتوى تسويقياً مذهلاً", icon: Sparkles },
];

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Ambient Glows */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-cyan-glow/15 blur-[100px]" />
        <div className="absolute top-1/2 -left-40 h-[500px] w-[500px] rounded-full bg-violet-glow/15 blur-[100px]" />
        <div className="absolute -bottom-40 right-1/3 h-[400px] w-[400px] rounded-full bg-pink-glow/10 blur-[100px]" />
      </div>

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <HnLogo className="h-10 w-10" />
          <span className="text-xl font-bold bg-gradient-to-r from-cyan-glow to-violet-glow bg-clip-text text-transparent">
            hnChat
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/sign-up-login">
            <Button variant="ghost" size="sm">تسجيل الدخول</Button>
          </Link>
          <Link to="/sign-up-login">
            <Button size="sm" className="bg-gradient-to-r from-cyan-glow to-violet-glow text-primary-foreground font-semibold shadow-glow-cyan">
              ابدأ مجاناً
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pt-16 pb-20 text-center">
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-ice-border bg-ice-card/50 text-xs text-muted-foreground mb-6">
            <Sparkles className="h-3.5 w-3.5 text-cyan-glow" />
            منصة Super App العربية الأولى
          </span>
        </motion.div>

        <motion.h1
          className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-6"
          initial="hidden" animate="visible" variants={fadeUp} custom={1}
        >
          <span className="bg-gradient-to-r from-cyan-glow via-foreground to-violet-glow bg-clip-text text-transparent">
            عالمك بالكامل
          </span>
          <br />
          في تطبيق واحد
        </motion.h1>

        <motion.p
          className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10"
          initial="hidden" animate="visible" variants={fadeUp} custom={2}
        >
          دردشة ذكاء اصطناعي، تواصل اجتماعي، تسوق، تداول عملات رقمية، وفيديوهات — كل ما تحتاجه في مكان واحد.
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
          initial="hidden" animate="visible" variants={fadeUp} custom={3}
        >
          <Link to="/sign-up-login">
            <Button size="lg" className="text-base px-8 py-6 bg-gradient-to-r from-cyan-glow to-violet-glow text-primary-foreground font-bold shadow-diamond hover:scale-105 transition-transform">
              <ArrowLeft className="h-5 w-5 ml-2" />
              ابدأ الآن مجاناً
            </Button>
          </Link>
          <Link to="/about">
            <Button variant="outline" size="lg" className="text-base px-8 py-6 border-ice-border hover:bg-ice-card/50">
              اكتشف المزيد
            </Button>
          </Link>
        </motion.div>
      </section>

      {/* Stats */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              className="rounded-xl border border-ice-border bg-ice-card/40 backdrop-blur-xl p-5 text-center"
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}
            >
              <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-cyan-glow to-violet-glow bg-clip-text text-transparent">
                {s.value}
              </div>
              <div className="text-sm text-muted-foreground mt-1">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pb-20">
        <motion.h2
          className="text-3xl font-bold text-center mb-12"
          initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}
        >
          كل ما تحتاجه في <span className="bg-gradient-to-r from-cyan-glow to-violet-glow bg-clip-text text-transparent">مكان واحد</span>
        </motion.h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={f.title}
                className="group relative rounded-2xl border border-ice-border bg-ice-card/30 backdrop-blur-xl p-6 hover:shadow-card-hover transition-all duration-300 hover:border-cyan-glow/30"
                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}
              >
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${f.color} bg-opacity-20 mb-4`}>
                  <div className="rounded-lg bg-background/60 p-2">
                    <Icon className="h-6 w-6 text-foreground" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Featured AI Chats */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pb-20">
        <motion.h2
          className="text-3xl font-bold text-center mb-4"
          initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}
        >
          جرّب قوة <span className="bg-gradient-to-r from-cyan-glow to-violet-glow bg-clip-text text-transparent">الذكاء الاصطناعي</span>
        </motion.h2>
        <motion.p
          className="text-center text-muted-foreground mb-10"
          initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={1}
        >
          محادثات ذكية جاهزة لمساعدتك في كل شيء
        </motion.p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {featuredChats.map((c, i) => {
            const Icon = c.icon;
            return (
              <motion.div
                key={c.title}
                className="rounded-2xl border border-ice-border bg-ice-card/30 backdrop-blur-xl p-6 text-center hover:shadow-diamond transition-all duration-300"
                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i + 2}
              >
                <div className="inline-flex p-3 rounded-full bg-gradient-to-br from-cyan-glow/20 to-violet-glow/20 mb-4">
                  <Icon className="h-7 w-7 text-cyan-glow" />
                </div>
                <h3 className="font-semibold mb-1">{c.title}</h3>
                <p className="text-sm text-muted-foreground">{c.desc}</p>
              </motion.div>
            );
          })}
        </div>
        <motion.div
          className="text-center mt-8"
          initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={5}
        >
          <Link to="/sign-up-login">
            <Button size="lg" className="bg-gradient-to-r from-cyan-glow to-violet-glow text-primary-foreground font-semibold shadow-glow-cyan">
              جرّب الآن مجاناً
            </Button>
          </Link>
        </motion.div>
      </section>

      {/* Trust Bar */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 pb-20">
        <motion.div
          className="rounded-2xl border border-ice-border bg-ice-card/40 backdrop-blur-xl p-8 flex flex-col md:flex-row items-center gap-6"
          initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}
        >
          <Shield className="h-12 w-12 text-cyan-glow shrink-0" />
          <div className="text-center md:text-right flex-1">
            <h3 className="text-xl font-bold mb-2">خصوصيتك أولاً</h3>
            <p className="text-sm text-muted-foreground">
              بياناتك مشفّرة ومحمية بأحدث تقنيات الأمان. لن نشارك معلوماتك مع أي طرف ثالث.
            </p>
          </div>
          <Link to="/sign-up-login">
            <Button variant="outline" className="border-cyan-glow/40 hover:bg-cyan-glow/10 whitespace-nowrap">
              سجّل الآن
            </Button>
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-ice-border py-8 px-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <HnLogo className="h-6 w-6" />
            <span className="text-sm text-muted-foreground">© 2025 hnChat. جميع الحقوق محفوظة.</span>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <Link to="/about" className="hover:text-foreground transition-colors">حول</Link>
            <Link to="/contact" className="hover:text-foreground transition-colors">تواصل</Link>
            <Link to="/privacy" className="hover:text-foreground transition-colors">الخصوصية</Link>
            <Link to="/terms" className="hover:text-foreground transition-colors">الشروط</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
