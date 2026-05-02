import { Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { HnLogo } from "@/components/HnLogo";
import { VisitorCounter } from "@/components/layout/VisitorCounter";
import { SocialProofToast } from "@/components/landing/SocialProofToast";
import { FloatingParticles } from "@/components/landing/FloatingParticles";
import { PartnerStrip } from "@/components/landing/PartnerStrip";
import { PhoneMockup } from "@/components/landing/PhoneMockup";
import { AIDemoChat } from "@/components/landing/AIDemoChat";
import { useState, useEffect, useRef } from "react";
import {
  MessageCircle, Bot, ShoppingBag, TrendingUp, Mic, Video,
  Sparkles, Shield, Globe, Zap, ArrowLeft, Send,
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════
   i18n
   ═══════════════════════════════════════════════════════════ */
type Lang = "ar" | "en" | "fr" | "es" | "de" | "tr" | "pt" | "zh" | "ru";

const langLabels: Record<Lang, string> = {
  ar: "العربية", en: "English", fr: "Français", es: "Español",
  de: "Deutsch", tr: "Türkçe", pt: "Português", zh: "中文", ru: "Русский",
};

const t: Record<Lang, {
  signIn: string; startFree: string; badge: string;
  heroTitle1: string; heroTitle2: string; heroSub: string; heroDesc: string;
  joinNow: string; discover: string;
  allInOne: string; onePlace: string;
  tryAI: string; aiWord: string; aiSub: string; tryFree: string;
  privacyTitle: string; privacyDesc: string; registerNow: string;
  copyright: string;
  about: string; contact: string; privacy: string; terms: string;
  liveChat: string; online: string;
  features: { title: string; desc: string }[];
  chats: { title: string; desc: string }[];
  stats: { value: string; label: string; icon: string }[];
}> = {
  ar: {
    signIn: "تسجيل الدخول", startFree: "ابدأ مجاناً",
    badge: "The Global #1 Super App",
    heroTitle1: "مرحباً بك في عالم", heroTitle2: "hnChat",
    heroSub: "رفيقك الذكي للعمل والتواصل",
    heroDesc: "دردشة ذكاء اصطناعي، تواصل اجتماعي، تسوق، تداول عملات رقمية، وفيديوهات — كل ما تحتاجه في مكان واحد.",
    joinNow: "انضم إلينا الآن", discover: "اكتشف المزيد",
    allInOne: "كل ما تحتاجه في", onePlace: "مكان واحد",
    tryAI: "جرّب قوة", aiWord: "الذكاء الاصطناعي",
    aiSub: "محادثات ذكية جاهزة لمساعدتك في كل شيء", tryFree: "جرّب الآن مجاناً",
    privacyTitle: "خصوصيتك أولاً",
    privacyDesc: "بياناتك مشفّرة ومحمية بأحدث تقنيات الأمان. لن نشارك معلوماتك مع أي طرف ثالث.",
    registerNow: "سجّل الآن",
    copyright: "جميع الحقوق محفوظة لمجموعة HN © 2024 - تصميم مولاي إسماعيل الحسني",
    about: "حول", contact: "تواصل", privacy: "الخصوصية", terms: "الشروط",
    liveChat: "الدردشة الحية", online: "متصل الآن",
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
      { value: "10K+", label: "مستخدم نشط", icon: "👥" },
      { value: "50K+", label: "محادثة AI يومياً", icon: "🤖" },
      { value: "1M+", label: "رسالة مُرسلة", icon: "💬" },
      { value: "99.9%", label: "وقت التشغيل", icon: "⚡" },
    ],
  },
  en: {
    signIn: "Sign In", startFree: "Start Free",
    badge: "The Global #1 Super App",
    heroTitle1: "Welcome to", heroTitle2: "hnChat",
    heroSub: "Your smart companion for work & communication",
    heroDesc: "AI chat, social networking, shopping, crypto trading, and videos — everything you need in one place.",
    joinNow: "Join Us Now", discover: "Learn More",
    allInOne: "Everything you need in", onePlace: "one place",
    tryAI: "Experience the power of", aiWord: "Artificial Intelligence",
    aiSub: "Smart conversations ready to help you with anything", tryFree: "Try Free Now",
    privacyTitle: "Privacy First",
    privacyDesc: "Your data is encrypted and protected with the latest security technologies. We never share your information.",
    registerNow: "Register Now",
    copyright: "All rights reserved to HN Group © 2024 - Designed by Moulay Ismail El Hassani",
    about: "About", contact: "Contact", privacy: "Privacy", terms: "Terms",
    liveChat: "Live Chat", online: "Online now",
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
      { value: "10K+", label: "Active Users", icon: "👥" },
      { value: "50K+", label: "Daily AI Chats", icon: "🤖" },
      { value: "1M+", label: "Messages Sent", icon: "💬" },
      { value: "99.9%", label: "Uptime", icon: "⚡" },
    ],
  },
  fr: {
    signIn: "Connexion", startFree: "Commencer",
    badge: "La Super App mondiale #1",
    heroTitle1: "Bienvenue sur", heroTitle2: "hnChat",
    heroSub: "Votre compagnon intelligent pour le travail et la communication",
    heroDesc: "Chat IA, réseau social, shopping, trading crypto et vidéos — tout ce dont vous avez besoin en un seul endroit.",
    joinNow: "Rejoignez-nous", discover: "En savoir plus",
    allInOne: "Tout ce dont vous avez besoin en", onePlace: "un seul endroit",
    tryAI: "Découvrez la puissance de", aiWord: "l'Intelligence Artificielle",
    aiSub: "Des conversations intelligentes prêtes à vous aider en tout", tryFree: "Essayer maintenant",
    privacyTitle: "Vie privée d'abord",
    privacyDesc: "Vos données sont cryptées et protégées. Nous ne partageons jamais vos informations.",
    registerNow: "S'inscrire",
    copyright: "Tous droits réservés au Groupe HN © 2024 - Conçu par Moulay Ismail El Hassani",
    about: "À propos", contact: "Contact", privacy: "Confidentialité", terms: "Conditions",
    liveChat: "Chat en direct", online: "En ligne",
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
      { value: "10K+", label: "Utilisateurs actifs", icon: "👥" },
      { value: "50K+", label: "Chats IA/jour", icon: "🤖" },
      { value: "1M+", label: "Messages envoyés", icon: "💬" },
      { value: "99.9%", label: "Disponibilité", icon: "⚡" },
    ],
  },
  es: {
    signIn: "Iniciar sesión", startFree: "Empieza gratis",
    badge: "La Super App global #1",
    heroTitle1: "Bienvenido a", heroTitle2: "hnChat",
    heroSub: "Tu compañero inteligente para el trabajo y la comunicación",
    heroDesc: "Chat IA, redes sociales, compras, trading de criptomonedas y videos — todo lo que necesitas en un solo lugar.",
    joinNow: "Únete ahora", discover: "Descubre más",
    allInOne: "Todo lo que necesitas en", onePlace: "un solo lugar",
    tryAI: "Descubre el poder de la", aiWord: "Inteligencia Artificial",
    aiSub: "Conversaciones inteligentes listas para ayudarte", tryFree: "Prueba gratis",
    privacyTitle: "Privacidad primero",
    privacyDesc: "Tus datos están encriptados y protegidos. Nunca compartimos tu información.",
    registerNow: "Regístrate",
    copyright: "Todos los derechos reservados a HN Group © 2024 - Diseñado por Moulay Ismail El Hassani",
    about: "Acerca de", contact: "Contacto", privacy: "Privacidad", terms: "Términos",
    liveChat: "Chat en vivo", online: "En línea",
    features: [
      { title: "IA avanzada", desc: "Chatea con los modelos de IA más potentes" },
      { title: "Mensajería instantánea", desc: "Conéctate con amigos por texto, voz y video" },
      { title: "Salas de voz", desc: "Únete a discusiones de voz en vivo" },
      { title: "Marketplace", desc: "Compra y vende en un mercado seguro" },
      { title: "Trading crypto", desc: "Sigue precios de criptomonedas y opera fácilmente" },
      { title: "Videos cortos", desc: "Mira y crea videos cortos y divertidos" },
    ],
    chats: [
      { title: "Asistente de código", desc: "Escribe código profesional con IA" },
      { title: "Traductor inteligente", desc: "Traduce cualquier texto al instante" },
      { title: "Redactor", desc: "Crea contenido de marketing increíble" },
    ],
    stats: [
      { value: "10K+", label: "Usuarios activos", icon: "👥" },
      { value: "50K+", label: "Chats IA/día", icon: "🤖" },
      { value: "1M+", label: "Mensajes enviados", icon: "💬" },
      { value: "99.9%", label: "Disponibilidad", icon: "⚡" },
    ],
  },
  de: {
    signIn: "Anmelden", startFree: "Kostenlos starten",
    badge: "Die globale #1 Super App",
    heroTitle1: "Willkommen bei", heroTitle2: "hnChat",
    heroSub: "Dein smarter Begleiter für Arbeit & Kommunikation",
    heroDesc: "KI-Chat, soziales Netzwerk, Shopping, Krypto-Trading und Videos — alles an einem Ort.",
    joinNow: "Jetzt beitreten", discover: "Mehr erfahren",
    allInOne: "Alles was du brauchst an", onePlace: "einem Ort",
    tryAI: "Erlebe die Kraft der", aiWord: "Künstlichen Intelligenz",
    aiSub: "Intelligente Gespräche, die dir bei allem helfen", tryFree: "Jetzt testen",
    privacyTitle: "Datenschutz zuerst",
    privacyDesc: "Deine Daten sind verschlüsselt und geschützt. Wir teilen niemals deine Informationen.",
    registerNow: "Registrieren",
    copyright: "Alle Rechte vorbehalten HN Group © 2024 - Design von Moulay Ismail El Hassani",
    about: "Über uns", contact: "Kontakt", privacy: "Datenschutz", terms: "AGB",
    liveChat: "Live-Chat", online: "Online",
    features: [
      { title: "Fortschrittliche KI", desc: "Chatte mit den leistungsstärksten KI-Modellen" },
      { title: "Instant Messaging", desc: "Verbinde dich mit Freunden per Text, Sprache und Video" },
      { title: "Live-Sprachräume", desc: "Nimm an Live-Sprachdiskussionen teil" },
      { title: "Marktplatz", desc: "Kaufe und verkaufe auf einem sicheren Marktplatz" },
      { title: "Krypto-Trading", desc: "Verfolge Krypto-Preise und handle einfach" },
      { title: "Kurzvideos", desc: "Schaue und erstelle lustige Kurzvideos" },
    ],
    chats: [
      { title: "Code-Assistent", desc: "Schreibe professionellen Code mit KI" },
      { title: "Smarter Übersetzer", desc: "Übersetze jeden Text sofort" },
      { title: "Content-Autor", desc: "Erstelle erstaunlichen Marketing-Content" },
    ],
    stats: [
      { value: "10K+", label: "Aktive Nutzer", icon: "👥" },
      { value: "50K+", label: "KI-Chats/Tag", icon: "🤖" },
      { value: "1M+", label: "Gesendete Nachrichten", icon: "💬" },
      { value: "99.9%", label: "Verfügbarkeit", icon: "⚡" },
    ],
  },
  tr: {
    signIn: "Giriş Yap", startFree: "Ücretsiz Başla",
    badge: "Dünyanın 1 Numaralı Süper Uygulaması",
    heroTitle1: "Hoş geldiniz", heroTitle2: "hnChat",
    heroSub: "İş ve iletişim için akıllı yoldaşınız",
    heroDesc: "Yapay zeka sohbeti, sosyal ağ, alışveriş, kripto ticaret ve videolar — tek bir yerde.",
    joinNow: "Şimdi Katıl", discover: "Daha Fazla",
    allInOne: "İhtiyacınız olan her şey", onePlace: "tek yerde",
    tryAI: "Yapay zekanın gücünü", aiWord: "keşfedin",
    aiSub: "Her konuda yardıma hazır akıllı sohbetler", tryFree: "Ücretsiz dene",
    privacyTitle: "Gizlilik Öncelikli",
    privacyDesc: "Verileriniz şifrelenmiş ve korunmaktadır. Bilgilerinizi asla paylaşmayız.",
    registerNow: "Kayıt Ol",
    copyright: "Tüm hakları saklıdır HN Group © 2024 - Moulay Ismail El Hassani tarafından tasarlandı",
    about: "Hakkında", contact: "İletişim", privacy: "Gizlilik", terms: "Şartlar",
    liveChat: "Canlı Sohbet", online: "Çevrimiçi",
    features: [
      { title: "Gelişmiş Yapay Zeka", desc: "En güçlü AI modelleriyle sohbet edin" },
      { title: "Anlık Mesajlaşma", desc: "Arkadaşlarınızla metin, ses ve video ile bağlanın" },
      { title: "Canlı Ses Odaları", desc: "Canlı ses tartışmalarına katılın" },
      { title: "Pazar Yeri", desc: "Güvenli bir pazarda alın ve satın" },
      { title: "Kripto Ticaret", desc: "Kripto fiyatlarını takip edin ve kolayca işlem yapın" },
      { title: "Kısa Videolar", desc: "Eğlenceli kısa videolar izleyin ve oluşturun" },
    ],
    chats: [
      { title: "Kod Asistanı", desc: "AI ile profesyonel kod yazın" },
      { title: "Akıllı Çevirmen", desc: "Herhangi bir metni anında çevirin" },
      { title: "İçerik Yazarı", desc: "Harika pazarlama içerikleri oluşturun" },
    ],
    stats: [
      { value: "10K+", label: "Aktif Kullanıcı", icon: "👥" },
      { value: "50K+", label: "Günlük AI Sohbet", icon: "🤖" },
      { value: "1M+", label: "Gönderilen Mesaj", icon: "💬" },
      { value: "99.9%", label: "Çalışma Süresi", icon: "⚡" },
    ],
  },
  pt: {
    signIn: "Entrar", startFree: "Começar grátis",
    badge: "O Super App global #1",
    heroTitle1: "Bem-vindo ao", heroTitle2: "hnChat",
    heroSub: "Seu companheiro inteligente para trabalho e comunicação",
    heroDesc: "Chat IA, rede social, compras, trading de criptomoedas e vídeos — tudo em um só lugar.",
    joinNow: "Junte-se agora", discover: "Saiba mais",
    allInOne: "Tudo o que você precisa em", onePlace: "um só lugar",
    tryAI: "Experimente o poder da", aiWord: "Inteligência Artificial",
    aiSub: "Conversas inteligentes prontas para ajudá-lo", tryFree: "Teste grátis",
    privacyTitle: "Privacidade em primeiro",
    privacyDesc: "Seus dados são criptografados e protegidos. Nunca compartilhamos suas informações.",
    registerNow: "Registre-se",
    copyright: "Todos os direitos reservados ao HN Group © 2024 - Design por Moulay Ismail El Hassani",
    about: "Sobre", contact: "Contato", privacy: "Privacidade", terms: "Termos",
    liveChat: "Chat ao vivo", online: "Online",
    features: [
      { title: "IA avançada", desc: "Converse com os modelos de IA mais poderosos" },
      { title: "Mensagens instantâneas", desc: "Conecte-se com amigos por texto, voz e vídeo" },
      { title: "Salas de voz", desc: "Participe de discussões de voz ao vivo" },
      { title: "Marketplace", desc: "Compre e venda em um mercado seguro" },
      { title: "Trading crypto", desc: "Acompanhe preços de criptomoedas e negocie facilmente" },
      { title: "Vídeos curtos", desc: "Assista e crie vídeos curtos e divertidos" },
    ],
    chats: [
      { title: "Assistente de código", desc: "Escreva código profissional com IA" },
      { title: "Tradutor inteligente", desc: "Traduza qualquer texto instantaneamente" },
      { title: "Redator", desc: "Crie conteúdo de marketing incrível" },
    ],
    stats: [
      { value: "10K+", label: "Usuários ativos", icon: "👥" },
      { value: "50K+", label: "Chats IA/dia", icon: "🤖" },
      { value: "1M+", label: "Mensagens enviadas", icon: "💬" },
      { value: "99.9%", label: "Disponibilidade", icon: "⚡" },
    ],
  },
  zh: {
    signIn: "登录", startFree: "免费开始",
    badge: "全球第一超级应用",
    heroTitle1: "欢迎来到", heroTitle2: "hnChat",
    heroSub: "您的智能工作与社交伙伴",
    heroDesc: "AI聊天、社交网络、购物、加密货币交易和视频 — 一切尽在一个平台。",
    joinNow: "立即加入", discover: "了解更多",
    allInOne: "您需要的一切尽在", onePlace: "一个地方",
    tryAI: "体验", aiWord: "人工智能的力量",
    aiSub: "智能对话随时为您提供帮助", tryFree: "免费试用",
    privacyTitle: "隐私优先",
    privacyDesc: "您的数据经过加密和保护。我们绝不共享您的信息。",
    registerNow: "立即注册",
    copyright: "版权所有 HN Group © 2024 - 由 Moulay Ismail El Hassani 设计",
    about: "关于", contact: "联系", privacy: "隐私", terms: "条款",
    liveChat: "实时聊天", online: "在线",
    features: [
      { title: "高级AI", desc: "与最强大的AI模型对话" },
      { title: "即时通讯", desc: "通过文字、语音和视频与朋友连接" },
      { title: "语音聊天室", desc: "加入实时语音讨论" },
      { title: "电子商城", desc: "在安全的市场中买卖" },
      { title: "加密货币交易", desc: "追踪加密货币价格并轻松交易" },
      { title: "短视频", desc: "观看和创建有趣的短视频" },
    ],
    chats: [
      { title: "代码助手", desc: "用AI编写专业代码" },
      { title: "智能翻译", desc: "即时翻译任何文本" },
      { title: "内容创作者", desc: "创建精彩的营销内容" },
    ],
    stats: [
      { value: "10K+", label: "活跃用户", icon: "👥" },
      { value: "50K+", label: "每日AI聊天", icon: "🤖" },
      { value: "1M+", label: "已发送消息", icon: "💬" },
      { value: "99.9%", label: "在线率", icon: "⚡" },
    ],
  },
  ru: {
    signIn: "Войти", startFree: "Начать бесплатно",
    badge: "Глобальное суперприложение #1",
    heroTitle1: "Добро пожаловать в", heroTitle2: "hnChat",
    heroSub: "Ваш умный помощник для работы и общения",
    heroDesc: "ИИ-чат, соцсеть, покупки, крипто-трейдинг и видео — всё в одном месте.",
    joinNow: "Присоединяйтесь", discover: "Узнать больше",
    allInOne: "Всё что нужно в", onePlace: "одном месте",
    tryAI: "Откройте силу", aiWord: "Искусственного Интеллекта",
    aiSub: "Умные разговоры готовы помочь вам во всём", tryFree: "Попробовать бесплатно",
    privacyTitle: "Конфиденциальность прежде всего",
    privacyDesc: "Ваши данные зашифрованы и защищены. Мы никогда не делимся вашей информацией.",
    registerNow: "Зарегистрироваться",
    copyright: "Все права защищены HN Group © 2024 - Дизайн Moulay Ismail El Hassani",
    about: "О нас", contact: "Контакты", privacy: "Конфиденциальность", terms: "Условия",
    liveChat: "Живой чат", online: "Онлайн",
    features: [
      { title: "Продвинутый ИИ", desc: "Общайтесь с мощнейшими моделями ИИ" },
      { title: "Мгновенные сообщения", desc: "Связывайтесь с друзьями через текст, голос и видео" },
      { title: "Голосовые комнаты", desc: "Присоединяйтесь к живым голосовым обсуждениям" },
      { title: "Маркетплейс", desc: "Покупайте и продавайте на безопасной площадке" },
      { title: "Крипто-трейдинг", desc: "Отслеживайте цены криптовалют и торгуйте легко" },
      { title: "Короткие видео", desc: "Смотрите и создавайте весёлые короткие видео" },
    ],
    chats: [
      { title: "Ассистент кода", desc: "Пишите профессиональный код с ИИ" },
      { title: "Умный переводчик", desc: "Переводите любой текст мгновенно" },
      { title: "Копирайтер", desc: "Создавайте потрясающий маркетинговый контент" },
    ],
    stats: [
      { value: "10K+", label: "Активные пользователи", icon: "👥" },
      { value: "50K+", label: "ИИ-чатов в день", icon: "🤖" },
      { value: "1M+", label: "Отправлено сообщений", icon: "💬" },
      { value: "99.9%", label: "Время работы", icon: "⚡" },
    ],
  },
};

function detectLang(): Lang {
  if (typeof navigator === "undefined") return "en";
  const nav = navigator.language?.toLowerCase() ?? "";
  if (nav.startsWith("ar")) return "ar";
  if (nav.startsWith("fr")) return "fr";
  if (nav.startsWith("es")) return "es";
  if (nav.startsWith("de")) return "de";
  if (nav.startsWith("tr")) return "tr";
  if (nav.startsWith("pt")) return "pt";
  if (nav.startsWith("zh")) return "zh";
  if (nav.startsWith("ru")) return "ru";
  return "en";
}

/* ═══ Animations ═══ */
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.6, ease: "easeOut" as const } }),
};

const featureIcons = [Bot, MessageCircle, Mic, ShoppingBag, TrendingUp, Video];
const featureColors = ["from-cyan-glow to-primary-glow", "from-violet-glow to-pink-glow", "from-pink-glow to-violet-glow", "from-cyan-glow to-violet-glow", "from-violet-glow to-cyan-glow", "from-pink-glow to-cyan-glow"];
const chatIcons = [Zap, Globe, Sparkles];

/* ═══ Chat messages ═══ */
const chatPool = [
  { user: "Ahmed", msg: "مرحباً بالجميع! 👋 Hello everyone!", avatar: "🧑‍💻", time: "now" },
  { user: "Sarah", msg: "This app is amazing! 🌟", avatar: "👩‍🎨", time: "1m" },
  { user: "Carlos", msg: "¡Me encanta esta plataforma! 💜", avatar: "🧑‍🚀", time: "2m" },
  { user: "Marie", msg: "J'adore cette plateforme 💜", avatar: "👩‍🔬", time: "3m" },
  { user: "Hans", msg: "Die KI ist unglaublich! 🤖", avatar: "🧑‍💼", time: "4m" },
  { user: "Yuki", msg: "最高のアプリです！🎌", avatar: "👩‍🎤", time: "5m" },
  { user: "Priya", msg: "Loving the AI features! 🚀", avatar: "👩‍💻", time: "6m" },
  { user: "Marco", msg: "Marketplace is fantastic! 🛍️", avatar: "🧑‍🎨", time: "7m" },
  { user: "Alex", msg: "Best super app I've tried!", avatar: "🧑‍🎓", time: "8m" },
  { user: "Elena", msg: "Отличное приложение! ⭐", avatar: "👩‍💼", time: "9m" },
  { user: "Chen", msg: "这个平台太棒了！🔥", avatar: "🧑‍🏫", time: "10m" },
  { user: "Isabella", msg: "Crypto trading is so easy here 📈", avatar: "👩‍💼", time: "11m" },
  { user: "Mehmet", msg: "Harika bir uygulama! 🇹🇷", avatar: "🧑‍💻", time: "12m" },
  { user: "Lucas", msg: "Adorei o app! 🇧🇷", avatar: "🧑‍🚀", time: "13m" },
];

const bubbleGradients = [
  "from-cyan-glow/20 to-violet-glow/10",
  "from-violet-glow/20 to-pink-glow/10",
  "from-pink-glow/15 to-cyan-glow/10",
  "from-cyan-glow/15 to-pink-glow/10",
];

function useFakeChat() {
  const [messages, setMessages] = useState<typeof chatPool>([]);
  useEffect(() => {
    setMessages(chatPool.slice(0, 4));
    let idx = 4;
    const interval = setInterval(() => {
      setMessages((prev) => {
        const next = [...prev, chatPool[idx % chatPool.length]];
        if (next.length > 8) next.shift();
        return next;
      });
      idx++;
    }, 2500);
    return () => clearInterval(interval);
  }, []);
  return messages;
}

/* ═══════════════════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════════════════ */
export function LandingPage() {
  const [lang, setLang] = useState<Lang>("en");
  const [mounted, setMounted] = useState(false);
  const l = t[lang];
  const chatMessages = useFakeChat();
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setMounted(true); setLang(detectLang()); }, []);
  useEffect(() => { chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: "smooth" }); }, [chatMessages]);

  const isRTL = lang === "ar";
  const init = mounted ? "hidden" as const : undefined;
  const enter = mounted ? "visible" as const : undefined;

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden" dir={isRTL ? "rtl" : "ltr"}>
      <SocialProofToast />

      {/* ═══ LAYERED BACKGROUND ═══ */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        {/* Animated mesh gradient orbs */}
        <div className="absolute -top-32 -right-32 h-[600px] w-[600px] rounded-full bg-cyan-glow/20 blur-[120px] animate-[meshFloat1_20s_ease-in-out_infinite]" />
        <div className="absolute top-1/3 -left-48 h-[700px] w-[700px] rounded-full bg-violet-glow/20 blur-[140px] animate-[meshFloat2_25s_ease-in-out_infinite]" />
        <div className="absolute bottom-0 right-1/4 h-[500px] w-[500px] rounded-full bg-pink-glow/15 blur-[100px] animate-[meshFloat3_22s_ease-in-out_infinite]" />
        <div className="absolute top-2/3 left-1/3 h-[400px] w-[400px] rounded-full bg-cyan-glow/10 blur-[100px] animate-[meshFloat1_18s_ease-in-out_infinite_reverse]" />
        {/* Noise texture overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E")` }} />
      </div>

      {/* AI Particles */}
      <FloatingParticles />

      {/* ═══ NAVBAR ═══ */}
      <nav className="relative z-20 flex items-center justify-between px-4 sm:px-6 py-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <HnLogo size={48} showText={false} />
          <span className="text-2xl font-extrabold bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 bg-clip-text text-transparent drop-shadow-[0_0_12px_oklch(0.78_0.18_60/0.4)]">hnChat</span>
          <VisitorCounter />
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Lang Switcher — Glass with dropdown */}
          <div className="relative group">
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border border-ice-border/40 bg-ice-card/10 backdrop-blur-2xl text-foreground transition-all duration-300 hover:border-cyan-glow/50 cursor-pointer">
              <Globe className="h-3.5 w-3.5 text-cyan-glow" />
              {langLabels[lang]}
            </button>
            <div className="absolute top-full right-0 mt-1 min-w-[140px] rounded-xl border border-ice-border/40 bg-background/90 backdrop-blur-2xl shadow-diamond opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 overflow-hidden">
              {(Object.keys(t) as Lang[]).map((code) => (
                <button key={code} onClick={() => setLang(code)}
                  className={`w-full text-left px-3 py-2 text-xs font-medium transition-all duration-200 ${lang === code ? "bg-gradient-to-r from-cyan-glow/20 to-violet-glow/20 text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-ice-card/20"}`}
                >{langLabels[code]}</button>
              ))}
            </div>
          </div>
          <Link to="/sign-up-login">
            <button className="px-4 py-2 text-sm font-semibold rounded-xl border border-ice-border/40 bg-ice-card/10 backdrop-blur-2xl text-foreground transition-all duration-300 hover:border-cyan-glow/50 hover:shadow-[0_0_20px_oklch(0.78_0.18_220/0.2)] hover:scale-[1.03] active:scale-[0.98] cursor-pointer">
              {l.signIn}
            </button>
          </Link>
          <Link to="/sign-up-login">
            <button className="px-5 py-2 text-sm font-bold rounded-xl bg-gradient-to-r from-cyan-glow to-violet-glow text-primary-foreground shadow-[0_4px_20px_oklch(0.78_0.18_220/0.4)] transition-all duration-300 hover:shadow-[0_6px_30px_oklch(0.78_0.18_220/0.6)] hover:scale-[1.05] active:scale-[0.97] cursor-pointer">
              {l.startFree}
            </button>
          </Link>
        </div>
      </nav>

      {/* ═══ HERO SECTION ═══ */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-8 pb-12 flex flex-col lg:flex-row gap-10 items-center">
        {/* Left: Hero text */}
        <div className="flex-1 text-center lg:text-start pt-4 max-w-2xl">
          <motion.div initial={init} animate={enter} variants={fadeUp} custom={0}>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-ice-border/40 bg-ice-card/10 backdrop-blur-2xl text-xs text-muted-foreground mb-6">
              <Sparkles className="h-3.5 w-3.5 text-cyan-glow" />
              {l.badge}
            </span>
          </motion.div>

          <motion.h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-5" initial={init} animate={enter} variants={fadeUp} custom={1}>
            {l.heroTitle1}{" "}
            <span className="relative inline-block">
              <span className="bg-gradient-to-r from-cyan-glow via-foreground to-violet-glow bg-clip-text text-transparent" style={{ textShadow: "0 0 40px oklch(0.78 0.18 220 / 0.4), 0 0 80px oklch(0.65 0.25 295 / 0.2)" }}>
                {l.heroTitle2}
              </span>
              <span className="absolute inset-0 bg-gradient-to-r from-cyan-glow/30 to-violet-glow/20 blur-3xl rounded-full animate-pulse" />
            </span>
          </motion.h1>

          <motion.p className="text-lg sm:text-xl font-semibold mb-3 bg-gradient-to-r from-cyan-glow to-violet-glow bg-clip-text text-transparent" initial={init} animate={enter} variants={fadeUp} custom={1.5}>
            {l.heroSub}
          </motion.p>

          <motion.p className="text-base text-muted-foreground max-w-lg mb-10 leading-relaxed" initial={init} animate={enter} variants={fadeUp} custom={2}>
            {l.heroDesc}
          </motion.p>

          {/* CTA Buttons */}
          <motion.div className="flex flex-col sm:flex-row items-center gap-5 justify-center lg:justify-start" initial={init} animate={enter} variants={fadeUp} custom={3}>
            <Link to="/sign-up-login">
              {/* Glassmorphism CTA with animated border + pulse */}
              <div className="group relative">
                <div className="absolute -inset-[2px] rounded-2xl bg-gradient-to-r from-cyan-glow via-violet-glow to-pink-glow opacity-70 group-hover:opacity-100 transition-opacity duration-500" style={{ backgroundSize: "200% 200%", animation: "borderRotate 4s linear infinite" }} />
                <button className="relative px-10 py-5 text-lg font-bold rounded-2xl bg-background/80 backdrop-blur-2xl text-foreground transition-all duration-300 hover:bg-background/60 cursor-pointer select-none" style={{ animation: "ctaPulse 3s ease-in-out infinite" }}>
                  <span className="flex items-center gap-2">
                    {isRTL && <ArrowLeft className="h-5 w-5" />}
                    {l.joinNow}
                    {!isRTL && <ArrowLeft className="h-5 w-5 rotate-180" />}
                  </span>
                </button>
              </div>
            </Link>
            <Link to="/about">
              <button className="px-8 py-4 text-base font-semibold rounded-2xl border-2 border-ice-border/40 bg-ice-card/10 backdrop-blur-2xl text-foreground transition-all duration-300 hover:border-cyan-glow/50 hover:shadow-[0_0_30px_oklch(0.78_0.18_220/0.2)] hover:scale-[1.03] active:scale-[0.97] cursor-pointer">
                {l.discover}
              </button>
            </Link>
          </motion.div>
        </div>

        {/* Right: Phone + Chat widget */}
        <div className="w-full lg:w-[400px] shrink-0 flex flex-col gap-6 items-center">
          {/* 3D Phone */}
          <motion.div
            initial={mounted ? { opacity: 0, y: 30 } : undefined}
            animate={mounted ? { opacity: 1, y: 0 } : undefined}
            transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" as const }}
            className="hidden lg:block"
          >
            <PhoneMockup />
          </motion.div>

          {/* Chat Widget — Floating, rounded, gradient bubbles */}
          <motion.div
            className="w-full max-w-sm"
            initial={mounted ? { opacity: 0, x: 30 } : undefined}
            animate={mounted ? { opacity: 1, x: 0 } : undefined}
            transition={{ delay: 0.6, duration: 0.7, ease: "easeOut" as const }}
          >
            <div className="rounded-3xl border border-ice-border/30 bg-ice-card/8 backdrop-blur-2xl shadow-[0_8px_40px_oklch(0_0_0/0.4),0_0_60px_oklch(0.78_0.18_220/0.06)] overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-ice-border/20 bg-ice-card/10">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <MessageCircle className="h-4 w-4 text-cyan-glow" />
                    <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                  </div>
                  <span className="text-sm font-semibold">{l.liveChat}</span>
                </div>
                <span className="text-[10px] text-muted-foreground/60">{l.online}</span>
              </div>
              {/* Messages */}
              <div ref={chatRef} className="h-56 overflow-y-auto px-3 py-3 flex flex-col gap-2.5" style={{ scrollbarWidth: "none" }}>
                <AnimatePresence initial={false}>
                  {chatMessages.map((m, i) => (
                    <motion.div
                      key={`${m.user}-${i}-${chatMessages.length}`}
                      initial={{ opacity: 0, y: 16, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                      transition={{ duration: 0.35, ease: "easeOut" as const }}
                      className="flex items-start gap-2"
                    >
                      <span className="text-lg shrink-0 mt-0.5">{m.avatar}</span>
                      <div className={`flex-1 rounded-2xl rounded-tl-sm bg-gradient-to-br ${bubbleGradients[i % bubbleGradients.length]} backdrop-blur-xl px-3.5 py-2 border border-ice-border/15`}>
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-[11px] font-semibold text-cyan-glow">{m.user}</span>
                          <span className="text-[9px] text-muted-foreground/40">{m.time}</span>
                        </div>
                        <p className="text-xs text-foreground/80 leading-relaxed">{m.msg}</p>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
              {/* Input */}
              <div className="px-3 py-2.5 border-t border-ice-border/15">
                <Link to="/sign-up-login" className="flex items-center gap-2 rounded-2xl bg-ice-card/10 backdrop-blur-xl px-4 py-2.5 text-xs text-muted-foreground hover:text-foreground hover:bg-ice-card/20 transition-all cursor-pointer border border-ice-border/15">
                  <Send className="h-3.5 w-3.5 text-cyan-glow" />
                  {lang === "ar" ? "سجّل للمشاركة..." : lang === "fr" ? "Inscrivez-vous..." : "Sign up to chat..."}
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══ FLOATING STATS ═══ */}
      <section className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 pb-20">
        <div className="flex flex-wrap justify-center gap-6 sm:gap-10">
          {l.stats.map((s, i) => (
            <motion.div
              key={s.label}
              className="flex items-center gap-3 group"
              initial={init} whileInView={enter} viewport={{ once: true }} variants={fadeUp} custom={i}
            >
              <span className="text-2xl">{s.icon}</span>
              <div>
                <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-cyan-glow to-violet-glow bg-clip-text text-transparent group-hover:drop-shadow-[0_0_12px_oklch(0.78_0.18_220/0.5)] transition-all duration-300">
                  {s.value}
                </div>
                <div className="text-xs text-muted-foreground/60">{s.label}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ═══ BENTO GRID — FEATURES ═══ */}
      <section className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pb-20">
        <motion.h2 className="text-3xl sm:text-4xl font-bold text-center mb-4" initial={init} whileInView={enter} viewport={{ once: true }} variants={fadeUp} custom={0}>
          {l.allInOne} <span className="bg-gradient-to-r from-cyan-glow to-violet-glow bg-clip-text text-transparent">{l.onePlace}</span>
        </motion.h2>
        <motion.p className="text-center text-muted-foreground mb-12 max-w-xl mx-auto" initial={init} whileInView={enter} viewport={{ once: true }} variants={fadeUp} custom={1}>
          {l.heroSub}
        </motion.p>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-[180px]">
          {l.features.map((f, i) => {
            const Icon = featureIcons[i];
            const isLarge = i === 0 || i === 3;
            return (
              <motion.div
                key={f.title}
                className={`group relative rounded-3xl overflow-hidden transition-all duration-500 hover:scale-[1.02] cursor-default ${isLarge ? "sm:col-span-2 sm:row-span-1" : ""}`}
                initial={init} whileInView={enter} viewport={{ once: true }} variants={fadeUp} custom={i * 0.5}
              >
                {/* Glass background */}
                <div className="absolute inset-0 bg-ice-card/5 backdrop-blur-2xl border border-ice-border/15 rounded-3xl" />
                {/* Hover gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${featureColors[i]} opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-3xl`} />
                {/* Content */}
                <div className="relative h-full flex flex-col justify-between p-6">
                  <div className="flex items-start justify-between">
                    <div className="p-3 rounded-2xl bg-background/40 backdrop-blur-xl border border-ice-border/10 group-hover:shadow-[0_0_30px_oklch(0.78_0.18_220/0.15)] transition-all duration-500">
                      <Icon className="h-6 w-6 text-foreground/80 group-hover:text-cyan-glow transition-colors duration-500" />
                    </div>
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-cyan-glow/10 to-violet-glow/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 group-hover:rotate-45">
                      <Sparkles className="h-3.5 w-3.5 text-cyan-glow" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-1.5">{f.title}</h3>
                    <p className="text-sm text-muted-foreground/70 leading-relaxed line-clamp-2">{f.desc}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ═══ AI INTERACTIVE DEMO ═══ */}
      <section className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 pb-24">
        <motion.h2 className="text-3xl sm:text-4xl font-bold text-center mb-4" initial={init} whileInView={enter} viewport={{ once: true }} variants={fadeUp} custom={0}>
          {l.tryAI} <span className="bg-gradient-to-r from-cyan-glow to-violet-glow bg-clip-text text-transparent">{l.aiWord}</span>
        </motion.h2>
        <motion.p className="text-center text-muted-foreground mb-10 max-w-lg mx-auto" initial={init} whileInView={enter} viewport={{ once: true }} variants={fadeUp} custom={1}>
          {l.aiSub}
        </motion.p>
        <motion.div initial={init} whileInView={enter} viewport={{ once: true }} variants={fadeUp} custom={2}>
          <AIDemoChat lang={lang} />
        </motion.div>
      </section>

      {/* ═══ TRUST BAR ═══ */}
      <section className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 pb-16">
        <motion.div
          className="rounded-3xl border border-ice-border/15 bg-ice-card/5 backdrop-blur-2xl p-8 flex flex-col md:flex-row items-center gap-6"
          initial={init} whileInView={enter} viewport={{ once: true }} variants={fadeUp} custom={0}
        >
          <div className="p-3 rounded-2xl bg-gradient-to-br from-cyan-glow/15 to-violet-glow/10">
            <Shield className="h-10 w-10 text-cyan-glow" />
          </div>
          <div className="text-center md:text-start flex-1">
            <h3 className="text-xl font-bold mb-2">{l.privacyTitle}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{l.privacyDesc}</p>
          </div>
          <Link to="/sign-up-login">
            <button className="px-6 py-3 text-sm font-semibold rounded-xl border border-cyan-glow/30 bg-ice-card/10 backdrop-blur-2xl text-foreground transition-all duration-300 hover:border-cyan-glow/60 hover:shadow-[0_0_20px_oklch(0.78_0.18_220/0.2)] hover:scale-[1.03] cursor-pointer whitespace-nowrap">
              {l.registerNow}
            </button>
          </Link>
        </motion.div>
      </section>

      {/* ═══ PARTNER STRIP ═══ */}
      <PartnerStrip />

      {/* ═══ FOOTER — Elegant ═══ */}
      <footer className="relative z-10 py-10 px-6">
        {/* Ultra-thin separator */}
        <div className="max-w-3xl mx-auto mb-8">
          <div className="h-px bg-gradient-to-r from-transparent via-ice-border/30 to-transparent" />
        </div>
        <div className="max-w-5xl mx-auto flex flex-col items-center gap-5">
          <div className="flex items-center gap-2">
            <HnLogo className="h-5 w-5 opacity-70" />
            <span className="text-xs font-semibold bg-gradient-to-r from-cyan-glow/70 to-violet-glow/70 bg-clip-text text-transparent">hnChat</span>
          </div>
          <div className="flex items-center gap-5 text-xs text-muted-foreground/50">
            <Link to="/about" className="hover:text-foreground/70 transition-colors">{l.about}</Link>
            <Link to="/contact" className="hover:text-foreground/70 transition-colors">{l.contact}</Link>
            <Link to="/privacy" className="hover:text-foreground/70 transition-colors">{l.privacy}</Link>
            <Link to="/terms" className="hover:text-foreground/70 transition-colors">{l.terms}</Link>
          </div>
          <p className="text-[11px] text-muted-foreground/30 text-center tracking-wide">{l.copyright}</p>
        </div>
      </footer>
    </div>
  );
}
