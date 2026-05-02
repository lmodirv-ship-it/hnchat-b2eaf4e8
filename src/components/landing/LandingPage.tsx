import { Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { HnLogo } from "@/components/HnLogo";
import { VisitorCounter } from "@/components/layout/VisitorCounter";
import { SocialProofToast } from "@/components/landing/SocialProofToast";
import { FloatingParticles } from "@/components/landing/FloatingParticles";
import { PartnerStrip } from "@/components/landing/PartnerStrip";
import { PhoneMockup } from "@/components/landing/PhoneMockup";
import { useState, useEffect, useRef, useCallback } from "react";
import {
  MessageCircle,
  Bot,
  ShoppingBag,
  TrendingUp,
  Mic,
  Video,
  Sparkles,
  Shield,
  Globe,
  Zap,
  ArrowLeft,
  Send,
} from "lucide-react";

/* ── i18n lightweight ── */
type Lang = "ar" | "en" | "fr";

const t = {
  ar: {
    signIn: "تسجيل الدخول",
    startFree: "ابدأ مجاناً",
    badge: "منصة Super App العربية الأولى",
    heroTitle1: "مرحباً بك في عالم",
    heroTitle2: "hnChat",
    heroSub: "رفيقك الذكي للعمل والتواصل",
    heroDesc: "دردشة ذكاء اصطناعي، تواصل اجتماعي، تسوق، تداول عملات رقمية، وفيديوهات — كل ما تحتاجه في مكان واحد.",
    joinNow: "انضم إلينا الآن",
    discover: "اكتشف المزيد",
    allInOne: "كل ما تحتاجه في",
    onePlace: "مكان واحد",
    tryAI: "جرّب قوة",
    aiWord: "الذكاء الاصطناعي",
    aiSub: "محادثات ذكية جاهزة لمساعدتك في كل شيء",
    tryFree: "جرّب الآن مجاناً",
    privacyTitle: "خصوصيتك أولاً",
    privacyDesc: "بياناتك مشفّرة ومحمية بأحدث تقنيات الأمان. لن نشارك معلوماتك مع أي طرف ثالث.",
    registerNow: "سجّل الآن",
    copyright: "جميع الحقوق محفوظة لمجموعة HN © 2024 - تصميم مولاي إسماعيل الحسني",
    about: "حول",
    contact: "تواصل",
    privacy: "الخصوصية",
    terms: "الشروط",
    liveChat: "الدردشة الحية",
    online: "متصل الآن",
    features: [
      { title: "ذكاء اصطناعي متقدم", desc: "دردش مع أقوى نماذج AI واحصل على إجابات فورية" },
      { title: "مراسلة فورية", desc: "تواصل مع أصدقائك برسائل نصية وصوتية ومرئية" },
      { title: "غرف صوتية حية", desc: "انضم لغرف نقاش صوتية مع مجتمعك المفضل" },
      { title: "سوق إلكتروني", desc: "اشترِ وبِع المنتجات في سوق متكامل وآمن" },
      { title: "تداول العملات", desc: "تابع أسعار العملات الرقمية وتداول بسهولة" },
      { title: "فيديوهات قصيرة", desc: "شاهد وأنشئ فيديوهات قصيرة ممتعة" },
    ],
    chats: [
      { title: "مساعد البرمجة", desc: "اكتب كوداً احترافياً بمساعدة AI" },
      { title: "مترجم ذكي", desc: "ترجم أي نص لأي لغة فوراً" },
      { title: "كاتب محتوى", desc: "أنشئ محتوى تسويقياً مذهلاً" },
    ],
    stats: [
      { value: "10K+", label: "مستخدم نشط" },
      { value: "50K+", label: "محادثة AI يومياً" },
      { value: "1M+", label: "رسالة مُرسلة" },
      { value: "99.9%", label: "وقت التشغيل" },
    ],
  },
  en: {
    signIn: "Sign In",
    startFree: "Start Free",
    badge: "The #1 Arabic Super App",
    heroTitle1: "Welcome to",
    heroTitle2: "hnChat",
    heroSub: "Your smart companion for work & communication",
    heroDesc: "AI chat, social networking, shopping, crypto trading, and videos — everything you need in one place.",
    joinNow: "Join Us Now",
    discover: "Learn More",
    allInOne: "Everything you need in",
    onePlace: "one place",
    tryAI: "Experience the power of",
    aiWord: "Artificial Intelligence",
    aiSub: "Smart conversations ready to help you with anything",
    tryFree: "Try Free Now",
    privacyTitle: "Privacy First",
    privacyDesc: "Your data is encrypted and protected with the latest security technologies. We never share your information.",
    registerNow: "Register Now",
    copyright: "All rights reserved to HN Group © 2024 - Designed by Moulay Ismail El Hassani",
    about: "About",
    contact: "Contact",
    privacy: "Privacy",
    terms: "Terms",
    liveChat: "Live Chat",
    online: "Online now",
    features: [
      { title: "Advanced AI", desc: "Chat with the most powerful AI models and get instant answers" },
      { title: "Instant Messaging", desc: "Connect with friends via text, voice, and video" },
      { title: "Live Voice Rooms", desc: "Join voice discussions with your favorite community" },
      { title: "Marketplace", desc: "Buy and sell products in a secure integrated marketplace" },
      { title: "Crypto Trading", desc: "Track crypto prices and trade with ease" },
      { title: "Short Videos", desc: "Watch and create fun short-form videos" },
    ],
    chats: [
      { title: "Code Assistant", desc: "Write professional code with AI help" },
      { title: "Smart Translator", desc: "Translate any text to any language instantly" },
      { title: "Content Writer", desc: "Create amazing marketing content" },
    ],
    stats: [
      { value: "10K+", label: "Active Users" },
      { value: "50K+", label: "Daily AI Chats" },
      { value: "1M+", label: "Messages Sent" },
      { value: "99.9%", label: "Uptime" },
    ],
  },
  fr: {
    signIn: "Connexion",
    startFree: "Commencer",
    badge: "La 1ère Super App arabe",
    heroTitle1: "Bienvenue sur",
    heroTitle2: "hnChat",
    heroSub: "Votre compagnon intelligent pour le travail et la communication",
    heroDesc: "Chat IA, réseau social, shopping, trading crypto et vidéos — tout ce dont vous avez besoin en un seul endroit.",
    joinNow: "Rejoignez-nous",
    discover: "En savoir plus",
    allInOne: "Tout ce dont vous avez besoin en",
    onePlace: "un seul endroit",
    tryAI: "Découvrez la puissance de",
    aiWord: "l'Intelligence Artificielle",
    aiSub: "Des conversations intelligentes prêtes à vous aider en tout",
    tryFree: "Essayer maintenant",
    privacyTitle: "Vie privée d'abord",
    privacyDesc: "Vos données sont cryptées et protégées. Nous ne partageons jamais vos informations.",
    registerNow: "S'inscrire",
    copyright: "Tous droits réservés au Groupe HN © 2024 - Conçu par Moulay Ismail El Hassani",
    about: "À propos",
    contact: "Contact",
    privacy: "Confidentialité",
    terms: "Conditions",
    liveChat: "Chat en direct",
    online: "En ligne",
    features: [
      { title: "IA avancée", desc: "Discutez avec les modèles d'IA les plus puissants" },
      { title: "Messagerie instantanée", desc: "Connectez-vous avec vos amis par texte, voix et vidéo" },
      { title: "Salons vocaux", desc: "Rejoignez des discussions vocales en direct" },
      { title: "Marketplace", desc: "Achetez et vendez dans un marché sécurisé" },
      { title: "Trading crypto", desc: "Suivez les prix des cryptos et tradez facilement" },
      { title: "Vidéos courtes", desc: "Regardez et créez des vidéos courtes et fun" },
    ],
    chats: [
      { title: "Assistant code", desc: "Écrivez du code pro avec l'aide de l'IA" },
      { title: "Traducteur intelligent", desc: "Traduisez n'importe quel texte instantanément" },
      { title: "Rédacteur", desc: "Créez du contenu marketing incroyable" },
    ],
    stats: [
      { value: "10K+", label: "Utilisateurs actifs" },
      { value: "50K+", label: "Chats IA/jour" },
      { value: "1M+", label: "Messages envoyés" },
      { value: "99.9%", label: "Disponibilité" },
    ],
  },
};

function detectLang(): Lang {
  if (typeof navigator === "undefined") return "ar";
  const nav = navigator.language?.toLowerCase() ?? "";
  if (nav.startsWith("fr")) return "fr";
  if (nav.startsWith("en")) return "en";
  return "ar";
}

/* ── Animation ── */
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: "easeOut" as const },
  }),
};

const featureIcons = [Bot, MessageCircle, Mic, ShoppingBag, TrendingUp, Video];
const featureColors = [
  "from-cyan-glow to-primary-glow",
  "from-violet-glow to-pink-glow",
  "from-pink-glow to-violet-glow",
  "from-cyan-glow to-violet-glow",
  "from-violet-glow to-cyan-glow",
  "from-pink-glow to-cyan-glow",
];
const chatIcons = [Zap, Globe, Sparkles];

/* ── Fake live chat messages ── */
const fakeChatPool = [
  { user: "أحمد", msg: "مرحباً بالجميع! 👋", avatar: "🧑‍💻", time: "الآن" },
  { user: "Sarah", msg: "This app is amazing!", avatar: "👩‍🎨", time: "1m" },
  { user: "يوسف", msg: "جربت الذكاء الاصطناعي، مذهل! 🤖", avatar: "🧑‍🚀", time: "2m" },
  { user: "Marie", msg: "J'adore cette plateforme 💜", avatar: "👩‍🔬", time: "3m" },
  { user: "خالد", msg: "السوق فيه منتجات رائعة 🛍️", avatar: "🧑‍💼", time: "4m" },
  { user: "Lina", msg: "Voice rooms are so cool! 🎙️", avatar: "👩‍🎤", time: "5m" },
  { user: "عمر", msg: "التداول سهل وسريع 📈", avatar: "🧑‍💻", time: "6m" },
  { user: "Fatima", msg: "أنا أحب الفيديوهات القصيرة ❤️", avatar: "👩‍🎓", time: "7m" },
  { user: "Alex", msg: "Best super app I've tried!", avatar: "🧑‍🎨", time: "8m" },
  { user: "نور", msg: "مستقبل التطبيقات هنا 🚀", avatar: "👩‍💻", time: "9m" },
  { user: "Karim", msg: "الترجمة الفورية خرافية 🌍", avatar: "🧑‍🏫", time: "10m" },
  { user: "Amira", msg: "J'ai gagné avec le crypto! 💰", avatar: "👩‍💼", time: "11m" },
];

function useFakeChat() {
  const [messages, setMessages] = useState<typeof fakeChatPool>([]);

  useEffect(() => {
    setMessages(fakeChatPool.slice(0, 4));
    let idx = 4;
    const interval = setInterval(() => {
      setMessages((prev) => {
        const next = [...prev, fakeChatPool[idx % fakeChatPool.length]];
        if (next.length > 8) next.shift();
        return next;
      });
      idx++;
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return messages;
}

/* ── Glassmorphism CTA Button with animated border ── */
function GlassCTA({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`group relative ${className}`}>
      {/* Animated gradient border */}
      <div className="absolute -inset-[2px] rounded-2xl bg-gradient-to-r from-cyan-glow via-violet-glow to-pink-glow opacity-70 blur-[1px] group-hover:opacity-100 transition-opacity duration-500 animate-[spin_6s_linear_infinite]" style={{ backgroundSize: "200% 200%" }} />
      <div className="absolute -inset-[2px] rounded-2xl bg-gradient-to-r from-cyan-glow via-violet-glow to-pink-glow opacity-70 group-hover:opacity-100 transition-opacity duration-500" style={{ backgroundSize: "200% 200%", animation: "borderRotate 4s linear infinite" }} />
      <button className="relative px-12 py-5 text-lg font-bold rounded-2xl bg-background/80 backdrop-blur-2xl text-foreground hover:bg-background/60 transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] cursor-pointer select-none">
        {children}
      </button>
    </div>
  );
}

/* ── Outline Button ── */
function GlowButton({ children, variant = "primary", size = "default", className = "", ...props }: {
  children: React.ReactNode;
  variant?: "primary" | "outline";
  size?: "default" | "lg";
  className?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const base = "relative font-bold rounded-xl transition-all duration-300 cursor-pointer select-none active:translate-y-0.5 active:shadow-none";
  const sizeClass = size === "lg" ? "px-10 py-5 text-lg" : "px-6 py-3 text-sm";
  if (variant === "primary") {
    return (
      <button className={`${base} ${sizeClass} bg-gradient-to-r from-cyan-glow to-violet-glow text-primary-foreground shadow-[0_6px_24px_oklch(0.78_0.18_220/0.5),0_2px_8px_oklch(0_0_0/0.4),inset_0_1px_0_oklch(1_0_0/0.2)] hover:shadow-[0_8px_32px_oklch(0.78_0.18_220/0.7),0_4px_12px_oklch(0_0_0/0.5),inset_0_1px_0_oklch(1_0_0/0.3)] hover:scale-[1.05] hover:-translate-y-0.5 ${className}`} {...props}>{children}</button>
    );
  }
  return (
    <button className={`${base} ${sizeClass} border-2 border-ice-border bg-ice-card/30 text-foreground backdrop-blur-xl shadow-[0_4px_16px_oklch(0_0_0/0.3),inset_0_1px_0_oklch(1_0_0/0.05)] hover:shadow-[0_6px_24px_oklch(0.78_0.18_220/0.25),inset_0_1px_0_oklch(1_0_0/0.1)] hover:border-cyan-glow/50 hover:scale-[1.04] hover:-translate-y-0.5 ${className}`} {...props}>{children}</button>
  );
}

/* ── Main Component ── */
export function LandingPage() {
  const [lang, setLang] = useState<Lang>("ar");
  const [mounted, setMounted] = useState(false);
  const l = t[lang];
  const chatMessages = useFakeChat();
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    setLang(detectLang());
  }, []);

  // Auto-scroll chat
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTo({ top: chatRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [chatMessages]);

  const isRTL = lang === "ar";
  const initAnim = mounted ? "hidden" as const : undefined;
  const enterAnim = mounted ? "visible" as const : undefined;

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden" dir={isRTL ? "rtl" : "ltr"}>
      <SocialProofToast />

      {/* ═══ Animated Mesh Gradient Background ═══ */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        {/* Mesh gradient orbs — slowly moving */}
        <div className="absolute -top-32 -right-32 h-[600px] w-[600px] rounded-full bg-cyan-glow/20 blur-[120px] animate-[meshFloat1_20s_ease-in-out_infinite]" />
        <div className="absolute top-1/3 -left-48 h-[700px] w-[700px] rounded-full bg-violet-glow/20 blur-[140px] animate-[meshFloat2_25s_ease-in-out_infinite]" />
        <div className="absolute bottom-0 right-1/4 h-[500px] w-[500px] rounded-full bg-pink-glow/15 blur-[100px] animate-[meshFloat3_22s_ease-in-out_infinite]" />
        <div className="absolute top-2/3 left-1/3 h-[400px] w-[400px] rounded-full bg-cyan-glow/10 blur-[100px] animate-[meshFloat1_18s_ease-in-out_infinite_reverse]" />
        {/* Subtle grid overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
      </div>

      {/* ═══ Floating AI Particles ═══ */}
      <FloatingParticles />

      {/* ═══ Navbar ═══ */}
      <nav className="relative z-20 flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <HnLogo className="h-10 w-10" />
          <span className="text-xl font-bold bg-gradient-to-r from-cyan-glow to-violet-glow bg-clip-text text-transparent">
            hnChat
          </span>
          <VisitorCounter />
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center rounded-lg border border-ice-border bg-ice-card/30 backdrop-blur-xl overflow-hidden">
            {(["ar", "en", "fr"] as Lang[]).map((code) => (
              <button
                key={code}
                onClick={() => setLang(code)}
                className={`px-2.5 py-1.5 text-xs font-medium transition-all ${lang === code ? "bg-gradient-to-r from-cyan-glow/30 to-violet-glow/30 text-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                {code === "ar" ? "عربي" : code === "en" ? "EN" : "FR"}
              </button>
            ))}
          </div>
          <Link to="/sign-up-login">
            <GlowButton variant="outline">{l.signIn}</GlowButton>
          </Link>
          <Link to="/sign-up-login">
            <GlowButton variant="primary">{l.startFree}</GlowButton>
          </Link>
        </div>
      </nav>

      {/* ═══ Hero + Side Chat ═══ */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-8 pb-16 flex flex-col lg:flex-row gap-10 items-center">
        {/* Hero content */}
        <div className="flex-1 text-center lg:text-start pt-4">
          <motion.div initial={initAnim} animate={enterAnim} variants={fadeUp} custom={0}>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-ice-border bg-ice-card/50 backdrop-blur-xl text-xs text-muted-foreground mb-6">
              <Sparkles className="h-3.5 w-3.5 text-cyan-glow" />
              {l.badge}
            </span>
          </motion.div>

          <motion.h1
            className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-4"
            initial={initAnim} animate={enterAnim} variants={fadeUp} custom={1}
          >
            {l.heroTitle1}{" "}
            <span className="relative inline-block">
              <span className="bg-gradient-to-r from-cyan-glow via-foreground to-violet-glow bg-clip-text text-transparent drop-shadow-[0_0_30px_oklch(0.78_0.18_220/0.6)]">
                {l.heroTitle2}
              </span>
              {/* Glow pulse behind text */}
              <span className="absolute inset-0 bg-gradient-to-r from-cyan-glow to-violet-glow opacity-20 blur-2xl rounded-full animate-pulse" />
            </span>
          </motion.h1>

          <motion.p
            className="text-xl font-semibold mb-4 bg-gradient-to-r from-cyan-glow to-violet-glow bg-clip-text text-transparent drop-shadow-[0_0_20px_oklch(0.78_0.18_220/0.4)]"
            initial={initAnim} animate={enterAnim} variants={fadeUp} custom={1.5}
          >
            {l.heroSub}
          </motion.p>

          <motion.p
            className="text-base text-muted-foreground max-w-xl mb-10"
            initial={initAnim} animate={enterAnim} variants={fadeUp} custom={2}
          >
            {l.heroDesc}
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row items-center gap-5 justify-center lg:justify-start"
            initial={initAnim} animate={enterAnim} variants={fadeUp} custom={3}
          >
            <Link to="/sign-up-login">
              <GlassCTA>
                <span className="flex items-center gap-2">
                  {isRTL && <ArrowLeft className="h-5 w-5" />}
                  {l.joinNow}
                  {!isRTL && <ArrowLeft className="h-5 w-5 rotate-180" />}
                </span>
              </GlassCTA>
            </Link>
            <Link to="/about">
              <GlowButton variant="outline" size="lg">{l.discover}</GlowButton>
            </Link>
          </motion.div>
        </div>

        {/* Right side: Phone Mockup + Live Chat */}
        <div className="w-full lg:w-[420px] shrink-0 flex flex-col gap-6">
          {/* 3D Phone Mockup */}
          <motion.div
            initial={mounted ? { opacity: 0, y: 30, rotateY: -15 } : undefined}
            animate={mounted ? { opacity: 1, y: 0, rotateY: 0 } : undefined}
            transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" as const }}
            className="hidden lg:block"
          >
            <PhoneMockup />
          </motion.div>

          {/* Side Live Chat — Auto-scroll */}
          <motion.div
            initial={mounted ? { opacity: 0, x: 40 } : undefined}
            animate={mounted ? { opacity: 1, x: 0 } : undefined}
            transition={{ delay: 0.6, duration: 0.7, ease: "easeOut" as const }}
          >
            <div className="rounded-2xl border border-ice-border/50 bg-ice-card/10 backdrop-blur-2xl shadow-glass overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-ice-border/30 bg-ice-card/20">
                <div className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4 text-cyan-glow" />
                  <span className="text-sm font-semibold">{l.liveChat}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-xs text-muted-foreground">{l.online}</span>
                </div>
              </div>
              {/* Messages with auto-scroll */}
              <div ref={chatRef} className="h-64 overflow-y-auto px-3 py-2 flex flex-col gap-2 scroll-smooth" style={{ scrollbarWidth: "none" }}>
                <AnimatePresence initial={false}>
                  {chatMessages.map((m, i) => (
                    <motion.div
                      key={`${m.user}-${i}-${chatMessages.length}`}
                      initial={{ opacity: 0, y: 20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                      transition={{ duration: 0.4, ease: "easeOut" as const }}
                      className="flex items-start gap-2.5"
                    >
                      <span className="text-xl shrink-0 mt-0.5">{m.avatar}</span>
                      <div className="flex-1 rounded-xl bg-ice-card/30 backdrop-blur-xl px-3 py-2 border border-ice-border/20">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-xs font-semibold text-cyan-glow">{m.user}</span>
                          <span className="text-[10px] text-muted-foreground/60">{m.time}</span>
                        </div>
                        <p className="text-xs text-foreground/80 leading-relaxed">{m.msg}</p>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
              <div className="px-3 py-2 border-t border-ice-border/30">
                <Link to="/sign-up-login" className="flex items-center gap-2 rounded-xl bg-ice-card/20 px-3 py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-ice-card/40 transition-all cursor-pointer border border-ice-border/20">
                  <Send className="h-3.5 w-3.5 text-cyan-glow" />
                  {lang === "ar" ? "سجّل للمشاركة..." : lang === "fr" ? "Inscrivez-vous..." : "Sign up to chat..."}
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══ Stats ═══ */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {l.stats.map((s, i) => (
            <motion.div
              key={s.label}
              className="rounded-xl border border-ice-border/50 bg-ice-card/20 backdrop-blur-xl p-5 text-center hover:bg-ice-card/30 transition-all duration-300"
              initial={initAnim} whileInView={enterAnim} viewport={{ once: true }} variants={fadeUp} custom={i}
            >
              <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-cyan-glow to-violet-glow bg-clip-text text-transparent">
                {s.value}
              </div>
              <div className="text-sm text-muted-foreground mt-1">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ═══ Features Grid ═══ */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pb-20">
        <motion.h2
          className="text-3xl font-bold text-center mb-12"
          initial={initAnim} whileInView={enterAnim} viewport={{ once: true }} variants={fadeUp} custom={0}
        >
          {l.allInOne} <span className="bg-gradient-to-r from-cyan-glow to-violet-glow bg-clip-text text-transparent">{l.onePlace}</span>
        </motion.h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {l.features.map((f, i) => {
            const Icon = featureIcons[i];
            return (
              <motion.div
                key={f.title}
                className="group relative rounded-2xl border border-ice-border/40 bg-ice-card/15 backdrop-blur-xl p-6 hover:shadow-card-hover transition-all duration-300 hover:border-cyan-glow/30 hover:scale-[1.02] hover:bg-ice-card/30"
                initial={initAnim} whileInView={enterAnim} viewport={{ once: true }} variants={fadeUp} custom={i}
              >
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${featureColors[i]} mb-4`}>
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

      {/* ═══ Featured AI Chats ═══ */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pb-20">
        <motion.h2
          className="text-3xl font-bold text-center mb-4"
          initial={initAnim} whileInView={enterAnim} viewport={{ once: true }} variants={fadeUp} custom={0}
        >
          {l.tryAI} <span className="bg-gradient-to-r from-cyan-glow to-violet-glow bg-clip-text text-transparent">{l.aiWord}</span>
        </motion.h2>
        <motion.p
          className="text-center text-muted-foreground mb-10"
          initial={initAnim} whileInView={enterAnim} viewport={{ once: true }} variants={fadeUp} custom={1}
        >
          {l.aiSub}
        </motion.p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {l.chats.map((c, i) => {
            const Icon = chatIcons[i];
            return (
              <motion.div
                key={c.title}
                className="rounded-2xl border border-ice-border/40 bg-ice-card/15 backdrop-blur-xl p-6 text-center hover:shadow-diamond transition-all duration-300 hover:scale-[1.03] hover:bg-ice-card/30"
                initial={initAnim} whileInView={enterAnim} viewport={{ once: true }} variants={fadeUp} custom={i + 2}
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
        <motion.div className="text-center mt-8" initial={initAnim} whileInView={enterAnim} viewport={{ once: true }} variants={fadeUp} custom={5}>
          <Link to="/sign-up-login">
            <GlassCTA>
              <span className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                {l.tryFree}
              </span>
            </GlassCTA>
          </Link>
        </motion.div>
      </section>

      {/* ═══ Trust Bar ═══ */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 pb-16">
        <motion.div
          className="rounded-2xl border border-ice-border/40 bg-ice-card/20 backdrop-blur-xl p-8 flex flex-col md:flex-row items-center gap-6"
          initial={initAnim} whileInView={enterAnim} viewport={{ once: true }} variants={fadeUp} custom={0}
        >
          <Shield className="h-12 w-12 text-cyan-glow shrink-0" />
          <div className="text-center md:text-start flex-1">
            <h3 className="text-xl font-bold mb-2">{l.privacyTitle}</h3>
            <p className="text-sm text-muted-foreground">{l.privacyDesc}</p>
          </div>
          <Link to="/sign-up-login">
            <GlowButton variant="outline">{l.registerNow}</GlowButton>
          </Link>
        </motion.div>
      </section>

      {/* ═══ Partner / Features Strip ═══ */}
      <PartnerStrip />

      {/* ═══ Footer ═══ */}
      <footer className="relative z-10 border-t border-ice-border/30 py-8 px-6 bg-ice-card/5 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto flex flex-col items-center gap-4">
          <div className="flex items-center gap-2">
            <HnLogo className="h-6 w-6" />
            <span className="text-sm font-semibold bg-gradient-to-r from-cyan-glow to-violet-glow bg-clip-text text-transparent">hnChat</span>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <Link to="/about" className="hover:text-foreground transition-colors">{l.about}</Link>
            <Link to="/contact" className="hover:text-foreground transition-colors">{l.contact}</Link>
            <Link to="/privacy" className="hover:text-foreground transition-colors">{l.privacy}</Link>
            <Link to="/terms" className="hover:text-foreground transition-colors">{l.terms}</Link>
          </div>
          <p className="text-xs text-muted-foreground/70 text-center">{l.copyright}</p>
        </div>
      </footer>
    </div>
  );
}
