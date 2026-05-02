import { Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { HnLogo } from "@/components/HnLogo";
import { useState, useEffect, useMemo } from "react";
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
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";

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
  { user: "أحمد", msg: "مرحباً بالجميع! 👋", avatar: "🧑‍💻" },
  { user: "Sarah", msg: "This app is amazing!", avatar: "👩‍🎨" },
  { user: "يوسف", msg: "جربت الذكاء الاصطناعي، مذهل! 🤖", avatar: "🧑‍🚀" },
  { user: "Marie", msg: "J'adore cette plateforme 💜", avatar: "👩‍🔬" },
  { user: "خالد", msg: "السوق فيه منتجات رائعة 🛍️", avatar: "🧑‍💼" },
  { user: "Lina", msg: "Voice rooms are so cool! 🎙️", avatar: "👩‍🎤" },
  { user: "عمر", msg: "التداول سهل وسريع 📈", avatar: "🧑‍💻" },
  { user: "Fatima", msg: "أنا أحب الفيديوهات القصيرة ❤️", avatar: "👩‍🎓" },
  { user: "Alex", msg: "Best super app I've tried!", avatar: "🧑‍🎨" },
  { user: "نور", msg: "مستقبل التطبيقات هنا 🚀", avatar: "👩‍💻" },
];

function useFakeChat() {
  const [messages, setMessages] = useState<typeof fakeChatPool>([]);

  useEffect(() => {
    // Start with 3 messages
    setMessages(fakeChatPool.slice(0, 3));
    let idx = 3;
    const interval = setInterval(() => {
      setMessages((prev) => {
        const next = [...prev, fakeChatPool[idx % fakeChatPool.length]];
        if (next.length > 6) next.shift();
        return next;
      });
      idx++;
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return messages;
}

/* ── 3D Button Component ── */
function GlowButton({
  children,
  variant = "primary",
  size = "default",
  className = "",
  ...props
}: {
  children: React.ReactNode;
  variant?: "primary" | "outline";
  size?: "default" | "lg";
  className?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const base =
    "relative font-bold rounded-xl transition-all duration-300 cursor-pointer select-none active:translate-y-0.5 active:shadow-none";
  const sizeClass = size === "lg" ? "px-10 py-5 text-lg" : "px-6 py-3 text-sm";

  if (variant === "primary") {
    return (
      <button
        className={`${base} ${sizeClass} bg-gradient-to-r from-cyan-glow to-violet-glow text-primary-foreground
          shadow-[0_6px_24px_oklch(0.78_0.18_220/0.5),0_2px_8px_oklch(0_0_0/0.4),inset_0_1px_0_oklch(1_0_0/0.2)]
          hover:shadow-[0_8px_32px_oklch(0.78_0.18_220/0.7),0_4px_12px_oklch(0_0_0/0.5),inset_0_1px_0_oklch(1_0_0/0.3)]
          hover:scale-[1.05] hover:-translate-y-0.5 ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
  return (
    <button
      className={`${base} ${sizeClass} border-2 border-ice-border bg-ice-card/30 text-foreground backdrop-blur-xl
        shadow-[0_4px_16px_oklch(0_0_0/0.3),inset_0_1px_0_oklch(1_0_0/0.05)]
        hover:shadow-[0_6px_24px_oklch(0.78_0.18_220/0.25),inset_0_1px_0_oklch(1_0_0/0.1)]
        hover:border-cyan-glow/50 hover:scale-[1.04] hover:-translate-y-0.5 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

/* ── Main Component ── */
export function LandingPage() {
  const [lang, setLang] = useState<Lang>("ar");
  const [mounted, setMounted] = useState(false);
  const l = t[lang];
  const chatMessages = useFakeChat();

  useEffect(() => {
    setMounted(true);
    setLang(detectLang());
  }, []);

  const isRTL = lang === "ar";

  // On SSR, skip animation initial state (opacity:0) to avoid blank page
  const initAnim = mounted ? "hidden" as const : undefined;
  const enterAnim = mounted ? "visible" as const : undefined;

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden" dir={isRTL ? "rtl" : "ltr"}>
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
          {/* Language Switcher */}
          <div className="flex items-center rounded-lg border border-ice-border bg-ice-card/30 backdrop-blur-xl overflow-hidden">
            {(["ar", "en", "fr"] as Lang[]).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`px-2.5 py-1.5 text-xs font-medium transition-all ${
                  lang === l
                    ? "bg-gradient-to-r from-cyan-glow/30 to-violet-glow/30 text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {l === "ar" ? "عربي" : l === "en" ? "EN" : "FR"}
              </button>
            ))}
          </div>
          <Link to="/sign-up-login">
            <GlowButton variant="outline" size="default">{l.signIn}</GlowButton>
          </Link>
          <Link to="/sign-up-login">
            <GlowButton variant="primary" size="default">{l.startFree}</GlowButton>
          </Link>
        </div>
      </nav>

      {/* Hero + Side Chat Layout */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-12 pb-20 flex flex-col lg:flex-row gap-8 items-start">
        {/* Hero content */}
        <div className="flex-1 text-center lg:text-start pt-4">
          <motion.div initial={initAnim} animate={enterAnim} variants={fadeUp} custom={0}>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-ice-border bg-ice-card/50 text-xs text-muted-foreground mb-6">
              <Sparkles className="h-3.5 w-3.5 text-cyan-glow" />
              {l.badge}
            </span>
          </motion.div>

          <motion.h1
            className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-4"
            initial={initAnim} animate={enterAnim} variants={fadeUp} custom={1}
          >
            {l.heroTitle1}{" "}
            <span className="bg-gradient-to-r from-cyan-glow via-foreground to-violet-glow bg-clip-text text-transparent">
              {l.heroTitle2}
            </span>
          </motion.h1>

          <motion.p
            className="text-xl text-cyan-glow font-semibold mb-4"
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
            className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start"
            initial={initAnim} animate={enterAnim} variants={fadeUp} custom={3}
          >
            <Link to="/sign-up-login">
              <GlowButton variant="primary" size="lg">
                <span className="flex items-center gap-2">
                  {isRTL && <ArrowLeft className="h-5 w-5" />}
                  {l.joinNow}
                  {!isRTL && <ArrowLeft className="h-5 w-5 rotate-180" />}
                </span>
              </GlowButton>
            </Link>
            <Link to="/about">
              <GlowButton variant="outline" size="lg">{l.discover}</GlowButton>
            </Link>
          </motion.div>
        </div>

        {/* Side Live Chat — Glassmorphism */}
        <motion.div
          className="w-full lg:w-80 shrink-0"
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5, duration: 0.7, ease: "easeOut" as const }}
        >
          <div className="rounded-2xl border border-ice-border/60 bg-ice-card/20 backdrop-blur-2xl shadow-glass overflow-hidden">
            {/* Chat header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-ice-border/40">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-cyan-glow" />
                <span className="text-sm font-semibold">{l.liveChat}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-xs text-muted-foreground">{l.online}</span>
              </div>
            </div>
            {/* Chat messages */}
            <div className="h-72 overflow-hidden px-3 py-2 flex flex-col gap-2 relative">
              <div className="absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-ice-card/20 to-transparent z-10 pointer-events-none" />
              <AnimatePresence initial={false}>
                {chatMessages.map((m, i) => (
                  <motion.div
                    key={`${m.user}-${i}-${chatMessages.length}`}
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4, ease: "easeOut" as const }}
                    className="flex items-start gap-2"
                  >
                    <span className="text-lg shrink-0">{m.avatar}</span>
                    <div className="rounded-xl bg-ice-card/40 backdrop-blur-xl px-3 py-1.5 border border-ice-border/30">
                      <span className="text-xs font-semibold text-cyan-glow">{m.user}</span>
                      <p className="text-xs text-foreground/80">{m.msg}</p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            {/* Fake input */}
            <div className="px-3 py-2 border-t border-ice-border/40">
              <Link to="/sign-up-login" className="flex items-center gap-2 rounded-lg bg-ice-card/30 px-3 py-2 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                <Send className="h-3.5 w-3.5 text-cyan-glow" />
                {lang === "ar" ? "سجّل للمشاركة..." : lang === "fr" ? "Inscrivez-vous..." : "Sign up to chat..."}
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Stats */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {l.stats.map((s, i) => (
            <motion.div
              key={s.label}
              className="rounded-xl border border-ice-border bg-ice-card/40 backdrop-blur-xl p-5 text-center"
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

      {/* Features Grid */}
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
                className="group relative rounded-2xl border border-ice-border bg-ice-card/30 backdrop-blur-xl p-6 hover:shadow-card-hover transition-all duration-300 hover:border-cyan-glow/30 hover:scale-[1.02]"
                initial={initAnim} whileInView={enterAnim} viewport={{ once: true }} variants={fadeUp} custom={i}
              >
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${featureColors[i]} bg-opacity-20 mb-4`}>
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
                className="rounded-2xl border border-ice-border bg-ice-card/30 backdrop-blur-xl p-6 text-center hover:shadow-diamond transition-all duration-300 hover:scale-[1.03]"
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
        <motion.div
          className="text-center mt-8"
          initial={initAnim} whileInView={enterAnim} viewport={{ once: true }} variants={fadeUp} custom={5}
        >
          <Link to="/sign-up-login">
            <GlowButton variant="primary" size="lg">{l.tryFree}</GlowButton>
          </Link>
        </motion.div>
      </section>

      {/* Trust Bar */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 pb-20">
        <motion.div
          className="rounded-2xl border border-ice-border bg-ice-card/40 backdrop-blur-xl p-8 flex flex-col md:flex-row items-center gap-6"
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

      {/* Footer */}
      <footer className="relative z-10 border-t border-ice-border py-8 px-6">
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
          <p className="text-xs text-muted-foreground text-center">{l.copyright}</p>
        </div>
      </footer>
    </div>
  );
}
