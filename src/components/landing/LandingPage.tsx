import { Link, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { lovable } from "@/integrations/lovable/index";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { HnLogo } from "@/components/HnLogo";
import { VisitorCounter } from "@/components/layout/VisitorCounter";
import { SocialProofToast } from "@/components/landing/SocialProofToast";
import { FloatingParticles } from "@/components/landing/FloatingParticles";
import { PartnerStrip } from "@/components/landing/PartnerStrip";
import { PhoneMockup } from "@/components/landing/PhoneMockup";
import { BlogSection } from "@/components/landing/BlogSection";
import { ChannelVideosSection } from "@/components/landing/ChannelVideosSection";
import { AdSenseUnit } from "@/components/ads/AdSenseUnit";


import { useState, useEffect, useRef } from "react";
import {
  MessageCircle, Bot, ShoppingBag, TrendingUp, Mic, Video,
  Sparkles, Shield, Globe, Zap, ArrowLeft, Send,
  Search, Moon, Bell, Star, Users, Users2, Settings, Heart, FileText, Rocket, Code2, Mountain,
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
   COMPONENT — Redesigned to match HN-Chat reference
   ═══════════════════════════════════════════════════════════ */
// (icons imported at top)

const navLabels: Record<Lang, { home: string; articles: string; chat: string; members: string; reels: string; aiTools: string; more: string }> = {
  ar: { home: "الرئيسية", articles: "المقالات", chat: "الدردشة", members: "الأعضاء", reels: "Reels", aiTools: "أدوات AI", more: "المزيد" },
  en: { home: "Home", articles: "Articles", chat: "Chat", members: "Members", reels: "Reels", aiTools: "AI Tools", more: "More" },
  fr: { home: "Accueil", articles: "Articles", chat: "Chat", members: "Membres", reels: "Reels", aiTools: "Outils IA", more: "Plus" },
  es: { home: "Inicio", articles: "Artículos", chat: "Chat", members: "Miembros", reels: "Reels", aiTools: "IA", more: "Más" },
  de: { home: "Start", articles: "Artikel", chat: "Chat", members: "Mitglieder", reels: "Reels", aiTools: "KI-Tools", more: "Mehr" },
  tr: { home: "Ana", articles: "Makaleler", chat: "Sohbet", members: "Üyeler", reels: "Reels", aiTools: "AI Araçları", more: "Daha" },
  pt: { home: "Início", articles: "Artigos", chat: "Chat", members: "Membros", reels: "Reels", aiTools: "Ferramentas IA", more: "Mais" },
  zh: { home: "首页", articles: "文章", chat: "聊天", members: "成员", reels: "Reels", aiTools: "AI 工具", more: "更多" },
  ru: { home: "Главная", articles: "Статьи", chat: "Чат", members: "Участники", reels: "Reels", aiTools: "ИИ", more: "Ещё" },
};

const sidebarLabels: Record<Lang, string[]> = {
  ar: ["الدردشة العامة", "المفضلة", "الرسائل", "الأصدقاء", "المجموعات", "الإشعارات", "الإعدادات"],
  en: ["Public Chat", "Favorites", "Messages", "Friends", "Groups", "Notifications", "Settings"],
  fr: ["Chat Public", "Favoris", "Messages", "Amis", "Groupes", "Notifications", "Paramètres"],
  es: ["Chat Público", "Favoritos", "Mensajes", "Amigos", "Grupos", "Notificaciones", "Ajustes"],
  de: ["Öffentlich", "Favoriten", "Nachrichten", "Freunde", "Gruppen", "Benachrichtigungen", "Einstellungen"],
  tr: ["Genel", "Favoriler", "Mesajlar", "Arkadaşlar", "Gruplar", "Bildirimler", "Ayarlar"],
  pt: ["Chat Público", "Favoritos", "Mensagens", "Amigos", "Grupos", "Notificações", "Configurações"],
  zh: ["公共聊天", "收藏", "消息", "好友", "群组", "通知", "设置"],
  ru: ["Общий чат", "Избранное", "Сообщения", "Друзья", "Группы", "Уведомления", "Настройки"],
};

const heroStatsData: Record<Lang, { value: string; label: string }[]> = {
  ar: [{ value: "+2.5K", label: "عضو نشط" }, { value: "+15K", label: "رسالة يومياً" }, { value: "+120", label: "مقال منشور" }, { value: "256", label: "متصل الآن" }],
  en: [{ value: "+2.5K", label: "Active Members" }, { value: "+15K", label: "Daily Messages" }, { value: "+120", label: "Published Articles" }, { value: "256", label: "Online Now" }],
  fr: [{ value: "+2.5K", label: "Membres actifs" }, { value: "+15K", label: "Messages/jour" }, { value: "+120", label: "Articles publiés" }, { value: "256", label: "En ligne" }],
  es: [{ value: "+2.5K", label: "Miembros activos" }, { value: "+15K", label: "Mensajes/día" }, { value: "+120", label: "Artículos" }, { value: "256", label: "En línea" }],
  de: [{ value: "+2.5K", label: "Aktive Mitglieder" }, { value: "+15K", label: "Nachrichten/Tag" }, { value: "+120", label: "Artikel" }, { value: "256", label: "Online" }],
  tr: [{ value: "+2.5K", label: "Aktif Üye" }, { value: "+15K", label: "Mesaj/gün" }, { value: "+120", label: "Makale" }, { value: "256", label: "Çevrimiçi" }],
  pt: [{ value: "+2.5K", label: "Membros ativos" }, { value: "+15K", label: "Mensagens/dia" }, { value: "+120", label: "Artigos" }, { value: "256", label: "Online" }],
  zh: [{ value: "+2.5K", label: "活跃会员" }, { value: "+15K", label: "每日消息" }, { value: "+120", label: "已发布文章" }, { value: "256", label: "在线" }],
  ru: [{ value: "+2.5K", label: "Активных" }, { value: "+15K", label: "Сообщений/день" }, { value: "+120", label: "Статей" }, { value: "256", label: "Онлайн" }],
};

const heroLabels: Record<Lang, { welcome: string; tagline: string; startNow: string; joinChat: string; discoverContent: string; discoverSub: string; viewAll: string; onlineNow: string; chatTitle: string; typeMessage: string; }> = {
  ar: { welcome: "مرحبا بك في", tagline: "منصة متكاملة تجمع بين الدردشة، المحتوى، الذكاء الاصطناعي وتواصل الأعضاء في مجتمع واحد.", startNow: "🚀 إبدأ الآن", joinChat: "انضم إلى الدردشة", discoverContent: "اكتشف محتوى مميز", discoverSub: "مقالات حصرية وأدوات ذكية لتطوير معرفتك", viewAll: "عرض الكل", onlineNow: "المتصلون الآن", chatTitle: "الدردشة العامة", typeMessage: "اكتب رسالة..." },
  en: { welcome: "Welcome to", tagline: "An all-in-one platform combining chat, content, AI, and member networking in a single community.", startNow: "🚀 Start Now", joinChat: "Join Chat", discoverContent: "Discover Premium Content", discoverSub: "Exclusive articles & smart tools to expand your knowledge", viewAll: "View All", onlineNow: "Online Now", chatTitle: "Public Chat", typeMessage: "Type a message..." },
  fr: { welcome: "Bienvenue sur", tagline: "Une plateforme intégrée combinant chat, contenu, IA et mise en relation des membres.", startNow: "🚀 Commencer", joinChat: "Rejoindre le chat", discoverContent: "Découvrez du contenu premium", discoverSub: "Articles exclusifs et outils intelligents", viewAll: "Voir tout", onlineNow: "En ligne", chatTitle: "Chat public", typeMessage: "Écrivez un message..." },
  es: { welcome: "Bienvenido a", tagline: "Una plataforma integral que combina chat, contenido, IA y networking.", startNow: "🚀 Empezar", joinChat: "Unirse al chat", discoverContent: "Descubre contenido premium", discoverSub: "Artículos exclusivos y herramientas inteligentes", viewAll: "Ver todo", onlineNow: "En línea", chatTitle: "Chat público", typeMessage: "Escribe un mensaje..." },
  de: { welcome: "Willkommen bei", tagline: "Eine All-in-One-Plattform für Chat, Inhalte, KI und Mitglieder-Networking.", startNow: "🚀 Loslegen", joinChat: "Chat beitreten", discoverContent: "Entdecke Premium-Inhalte", discoverSub: "Exklusive Artikel und smarte Tools", viewAll: "Alle ansehen", onlineNow: "Online", chatTitle: "Öffentlicher Chat", typeMessage: "Nachricht schreiben..." },
  tr: { welcome: "Hoş geldin", tagline: "Sohbet, içerik, AI ve üye ağını birleştiren entegre platform.", startNow: "🚀 Başla", joinChat: "Sohbete katıl", discoverContent: "Premium içerik keşfet", discoverSub: "Özel makaleler ve akıllı araçlar", viewAll: "Tümünü gör", onlineNow: "Çevrimiçi", chatTitle: "Genel Sohbet", typeMessage: "Mesaj yaz..." },
  pt: { welcome: "Bem-vindo ao", tagline: "Plataforma integrada de chat, conteúdo, IA e networking de membros.", startNow: "🚀 Começar", joinChat: "Entrar no chat", discoverContent: "Descubra conteúdo premium", discoverSub: "Artigos exclusivos e ferramentas inteligentes", viewAll: "Ver tudo", onlineNow: "Online", chatTitle: "Chat Público", typeMessage: "Digite uma mensagem..." },
  zh: { welcome: "欢迎来到", tagline: "集聊天、内容、AI 和成员社交于一体的综合平台。", startNow: "🚀 立即开始", joinChat: "加入聊天", discoverContent: "发现精选内容", discoverSub: "独家文章和智能工具", viewAll: "查看全部", onlineNow: "在线", chatTitle: "公共聊天", typeMessage: "输入消息..." },
  ru: { welcome: "Добро пожаловать в", tagline: "Универсальная платформа: чат, контент, ИИ и нетворкинг.", startNow: "🚀 Начать", joinChat: "Присоединиться", discoverContent: "Откройте премиум-контент", discoverSub: "Эксклюзивные статьи и умные инструменты", viewAll: "Все", onlineNow: "Онлайн", chatTitle: "Общий чат", typeMessage: "Введите сообщение..." },
};

const fakeChatMessages = [
  { user: "Omar", time: "10:21 ص", msg: "مرحبا بالجميع! كيف حالكم اليوم؟ 👋", avatar: "👨", self: false },
  { user: "Sarah", time: "10:22 ص", msg: "مرحبا عمر! أنا بخير شكراً ❤️", avatar: "👩", self: false },
  { user: "Ahmed", time: "10:23 ص", msg: "صباح الخير للجميع 🌟", avatar: "🧑", self: false },
  { user: "You", time: "10:24 ص", msg: "🎉 أهلاً وسهلاً بالجميع في منصة hn-chat.com", avatar: "🧑‍💼", self: true },
];

const onlineUsers = [
  { name: "Omar", color: "from-violet-500 to-purple-600" },
  { name: "Sarah", color: "from-pink-500 to-rose-600" },
  { name: "Ahmed", color: "from-cyan-500 to-blue-600" },
  { name: "Lina", color: "from-amber-500 to-orange-600" },
  { name: "Mohamed", color: "from-emerald-500 to-green-600" },
  { name: "Aya", color: "from-fuchsia-500 to-pink-600" },
  { name: "Yassine", color: "from-indigo-500 to-violet-600" },
];

const blogPosts: Record<Lang, { tag: string; title: string; desc: string; date: string; reads: string; views: string; gradient: string; icon: any }[]> = {
  ar: [
    { tag: "الذكاء الاصطناعي", title: "أفضل أدوات الذكاء الاصطناعي في 2024", desc: "اكتشف أقوى أدوات الذكاء الاصطناعي التي تساعدك في العمل والدراسة وزيادة الإنتاجية.", date: "07 مايو 2024", reads: "5 دقائق", views: "1.2K مشاهدة", gradient: "from-cyan-600 via-blue-700 to-indigo-800", icon: Sparkles },
    { tag: "ريادة الأعمال", title: "10 خطوات لبناء مشروع ناجح من الصفر", desc: "دليل شامل لبناء مشروعك الخاص وتحقيق النجاح في عالم الأعمال.", date: "06 مايو 2024", reads: "8 دقائق", views: "990 مشاهدة", gradient: "from-orange-600 via-red-700 to-pink-800", icon: Rocket },
    { tag: "البرمجة", title: "تعلم البرمجة من البداية حتى الاحتراف", desc: "خطة تعليمية متكاملة لتعلم البرمجة وتطوير مهاراتك خطوة بخطوة.", date: "05 مايو 2024", reads: "12 دقيقة", views: "12K مشاهدة", gradient: "from-slate-700 via-slate-800 to-slate-900", icon: Code2 },
    { tag: "التطوير الذاتي", title: "7 عادات يومية ستغير حياتك بالكامل", desc: "عادات بسيطة إذا التزمت بها ستغير حياتك نحو الأفضل.", date: "04 مايو 2024", reads: "6 دقائق", views: "1.1K مشاهدة", gradient: "from-amber-600 via-orange-700 to-rose-800", icon: Mountain },
  ],
  en: [
    { tag: "AI", title: "Best AI Tools in 2024", desc: "Discover the most powerful AI tools to boost your work and productivity.", date: "May 07, 2024", reads: "5 min", views: "1.2K views", gradient: "from-cyan-600 via-blue-700 to-indigo-800", icon: Sparkles },
    { tag: "Business", title: "10 Steps to Build a Successful Startup", desc: "Complete guide to building your own business from scratch.", date: "May 06, 2024", reads: "8 min", views: "990 views", gradient: "from-orange-600 via-red-700 to-pink-800", icon: Rocket },
    { tag: "Coding", title: "Learn Programming from Zero to Pro", desc: "Comprehensive plan to master programming step by step.", date: "May 05, 2024", reads: "12 min", views: "12K views", gradient: "from-slate-700 via-slate-800 to-slate-900", icon: Code2 },
    { tag: "Self-Growth", title: "7 Daily Habits That Will Change Your Life", desc: "Simple habits that will transform your life for the better.", date: "May 04, 2024", reads: "6 min", views: "1.1K views", gradient: "from-amber-600 via-orange-700 to-rose-800", icon: Mountain },
  ],
  fr: [
    { tag: "IA", title: "Meilleurs outils d'IA en 2024", desc: "Découvrez les outils d'IA les plus puissants.", date: "07 mai 2024", reads: "5 min", views: "1.2K vues", gradient: "from-cyan-600 via-blue-700 to-indigo-800", icon: Sparkles },
    { tag: "Business", title: "10 étapes pour créer une startup", desc: "Guide complet pour bâtir votre entreprise.", date: "06 mai 2024", reads: "8 min", views: "990 vues", gradient: "from-orange-600 via-red-700 to-pink-800", icon: Rocket },
    { tag: "Code", title: "Apprenez à coder de zéro", desc: "Plan complet pour maîtriser la programmation.", date: "05 mai 2024", reads: "12 min", views: "12K vues", gradient: "from-slate-700 via-slate-800 to-slate-900", icon: Code2 },
    { tag: "Dév. perso", title: "7 habitudes qui changeront votre vie", desc: "Des habitudes simples qui transformeront votre vie.", date: "04 mai 2024", reads: "6 min", views: "1.1K vues", gradient: "from-amber-600 via-orange-700 to-rose-800", icon: Mountain },
  ],
  es: [
    { tag: "IA", title: "Mejores herramientas de IA 2024", desc: "Descubre las herramientas de IA más potentes.", date: "07 may 2024", reads: "5 min", views: "1.2K vistas", gradient: "from-cyan-600 via-blue-700 to-indigo-800", icon: Sparkles },
    { tag: "Negocios", title: "10 pasos para crear una startup", desc: "Guía completa para construir tu negocio.", date: "06 may 2024", reads: "8 min", views: "990 vistas", gradient: "from-orange-600 via-red-700 to-pink-800", icon: Rocket },
    { tag: "Código", title: "Aprende programación desde cero", desc: "Plan completo para dominar la programación.", date: "05 may 2024", reads: "12 min", views: "12K vistas", gradient: "from-slate-700 via-slate-800 to-slate-900", icon: Code2 },
    { tag: "Crecimiento", title: "7 hábitos que cambiarán tu vida", desc: "Hábitos simples que transformarán tu vida.", date: "04 may 2024", reads: "6 min", views: "1.1K vistas", gradient: "from-amber-600 via-orange-700 to-rose-800", icon: Mountain },
  ],
  de: [
    { tag: "KI", title: "Beste KI-Tools 2024", desc: "Entdecke die mächtigsten KI-Tools.", date: "07. Mai 2024", reads: "5 Min", views: "1.2K Aufrufe", gradient: "from-cyan-600 via-blue-700 to-indigo-800", icon: Sparkles },
    { tag: "Business", title: "10 Schritte zum Startup-Erfolg", desc: "Kompletter Leitfaden zum Aufbau deines Unternehmens.", date: "06. Mai 2024", reads: "8 Min", views: "990 Aufrufe", gradient: "from-orange-600 via-red-700 to-pink-800", icon: Rocket },
    { tag: "Code", title: "Programmieren von 0 auf Profi", desc: "Kompletter Plan zum Programmieren lernen.", date: "05. Mai 2024", reads: "12 Min", views: "12K Aufrufe", gradient: "from-slate-700 via-slate-800 to-slate-900", icon: Code2 },
    { tag: "Wachstum", title: "7 Gewohnheiten die dein Leben verändern", desc: "Einfache Gewohnheiten für ein besseres Leben.", date: "04. Mai 2024", reads: "6 Min", views: "1.1K Aufrufe", gradient: "from-amber-600 via-orange-700 to-rose-800", icon: Mountain },
  ],
  tr: [
    { tag: "AI", title: "2024'ün En İyi AI Araçları", desc: "En güçlü AI araçlarını keşfedin.", date: "07 Mayıs 2024", reads: "5 dk", views: "1.2K görüntüleme", gradient: "from-cyan-600 via-blue-700 to-indigo-800", icon: Sparkles },
    { tag: "İş", title: "Sıfırdan Başarılı Startup Kurma", desc: "Kendi işinizi kurmak için tam rehber.", date: "06 Mayıs 2024", reads: "8 dk", views: "990 görüntüleme", gradient: "from-orange-600 via-red-700 to-pink-800", icon: Rocket },
    { tag: "Kod", title: "Sıfırdan Profesyonel Programlama", desc: "Programlamayı öğrenmek için kapsamlı plan.", date: "05 Mayıs 2024", reads: "12 dk", views: "12K görüntüleme", gradient: "from-slate-700 via-slate-800 to-slate-900", icon: Code2 },
    { tag: "Gelişim", title: "Hayatınızı Değiştirecek 7 Alışkanlık", desc: "Hayatınızı dönüştürecek basit alışkanlıklar.", date: "04 Mayıs 2024", reads: "6 dk", views: "1.1K görüntüleme", gradient: "from-amber-600 via-orange-700 to-rose-800", icon: Mountain },
  ],
  pt: [
    { tag: "IA", title: "Melhores ferramentas de IA 2024", desc: "Descubra as ferramentas de IA mais potentes.", date: "07 mai 2024", reads: "5 min", views: "1.2K vistas", gradient: "from-cyan-600 via-blue-700 to-indigo-800", icon: Sparkles },
    { tag: "Negócios", title: "10 passos para criar uma startup", desc: "Guia completo para construir seu negócio.", date: "06 mai 2024", reads: "8 min", views: "990 vistas", gradient: "from-orange-600 via-red-700 to-pink-800", icon: Rocket },
    { tag: "Código", title: "Aprenda programação do zero ao pro", desc: "Plano completo para dominar programação.", date: "05 mai 2024", reads: "12 min", views: "12K vistas", gradient: "from-slate-700 via-slate-800 to-slate-900", icon: Code2 },
    { tag: "Crescimento", title: "7 hábitos que mudarão sua vida", desc: "Hábitos simples que transformarão sua vida.", date: "04 mai 2024", reads: "6 min", views: "1.1K vistas", gradient: "from-amber-600 via-orange-700 to-rose-800", icon: Mountain },
  ],
  zh: [
    { tag: "AI", title: "2024 年最佳 AI 工具", desc: "探索最强大的 AI 工具。", date: "2024年5月7日", reads: "5 分钟", views: "1.2K 浏览", gradient: "from-cyan-600 via-blue-700 to-indigo-800", icon: Sparkles },
    { tag: "商业", title: "从零打造成功创业的 10 步", desc: "构建自己业务的完整指南。", date: "2024年5月6日", reads: "8 分钟", views: "990 浏览", gradient: "from-orange-600 via-red-700 to-pink-800", icon: Rocket },
    { tag: "编程", title: "从零到精通学编程", desc: "掌握编程的完整计划。", date: "2024年5月5日", reads: "12 分钟", views: "12K 浏览", gradient: "from-slate-700 via-slate-800 to-slate-900", icon: Code2 },
    { tag: "成长", title: "改变人生的 7 个习惯", desc: "改变生活的简单习惯。", date: "2024年5月4日", reads: "6 分钟", views: "1.1K 浏览", gradient: "from-amber-600 via-orange-700 to-rose-800", icon: Mountain },
  ],
  ru: [
    { tag: "ИИ", title: "Лучшие ИИ-инструменты 2024", desc: "Откройте самые мощные ИИ-инструменты.", date: "07 мая 2024", reads: "5 мин", views: "1.2K просмотров", gradient: "from-cyan-600 via-blue-700 to-indigo-800", icon: Sparkles },
    { tag: "Бизнес", title: "10 шагов к успешному стартапу", desc: "Полное руководство по созданию бизнеса.", date: "06 мая 2024", reads: "8 мин", views: "990 просмотров", gradient: "from-orange-600 via-red-700 to-pink-800", icon: Rocket },
    { tag: "Код", title: "От нуля до профи в программировании", desc: "Полный план изучения программирования.", date: "05 мая 2024", reads: "12 мин", views: "12K просмотров", gradient: "from-slate-700 via-slate-800 to-slate-900", icon: Code2 },
    { tag: "Рост", title: "7 привычек, которые изменят жизнь", desc: "Простые привычки для лучшей жизни.", date: "04 мая 2024", reads: "6 мин", views: "1.1K просмотров", gradient: "from-amber-600 via-orange-700 to-rose-800", icon: Mountain },
  ],
};

const footerStatsData: Record<Lang, { value: string; label: string; icon: any; color: string }[]> = {
  ar: [
    { value: "+2.5K", label: "عضو نشط", icon: Users, color: "from-violet-500 to-purple-600" },
    { value: "+15K", label: "رسالة يومياً", icon: MessageCircle, color: "from-pink-500 to-rose-600" },
    { value: "+120", label: "مقال منشور", icon: FileText, color: "from-violet-500 to-indigo-600" },
    { value: "+50", label: "مجموعة نشطة", icon: Users2, color: "from-amber-500 to-orange-600" },
    { value: "99.9%", label: "وقت التشغيل", icon: Shield, color: "from-emerald-500 to-green-600" },
  ],
  en: [
    { value: "+2.5K", label: "Active Members", icon: Users, color: "from-violet-500 to-purple-600" },
    { value: "+15K", label: "Daily Messages", icon: MessageCircle, color: "from-pink-500 to-rose-600" },
    { value: "+120", label: "Articles", icon: FileText, color: "from-violet-500 to-indigo-600" },
    { value: "+50", label: "Active Groups", icon: Users2, color: "from-amber-500 to-orange-600" },
    { value: "99.9%", label: "Uptime", icon: Shield, color: "from-emerald-500 to-green-600" },
  ],
  fr: [
    { value: "+2.5K", label: "Membres actifs", icon: Users, color: "from-violet-500 to-purple-600" },
    { value: "+15K", label: "Messages/jour", icon: MessageCircle, color: "from-pink-500 to-rose-600" },
    { value: "+120", label: "Articles", icon: FileText, color: "from-violet-500 to-indigo-600" },
    { value: "+50", label: "Groupes actifs", icon: Users2, color: "from-amber-500 to-orange-600" },
    { value: "99.9%", label: "Disponibilité", icon: Shield, color: "from-emerald-500 to-green-600" },
  ],
  es: [
    { value: "+2.5K", label: "Miembros activos", icon: Users, color: "from-violet-500 to-purple-600" },
    { value: "+15K", label: "Mensajes/día", icon: MessageCircle, color: "from-pink-500 to-rose-600" },
    { value: "+120", label: "Artículos", icon: FileText, color: "from-violet-500 to-indigo-600" },
    { value: "+50", label: "Grupos activos", icon: Users2, color: "from-amber-500 to-orange-600" },
    { value: "99.9%", label: "Disponibilidad", icon: Shield, color: "from-emerald-500 to-green-600" },
  ],
  de: [
    { value: "+2.5K", label: "Aktive Mitglieder", icon: Users, color: "from-violet-500 to-purple-600" },
    { value: "+15K", label: "Nachrichten/Tag", icon: MessageCircle, color: "from-pink-500 to-rose-600" },
    { value: "+120", label: "Artikel", icon: FileText, color: "from-violet-500 to-indigo-600" },
    { value: "+50", label: "Aktive Gruppen", icon: Users2, color: "from-amber-500 to-orange-600" },
    { value: "99.9%", label: "Verfügbarkeit", icon: Shield, color: "from-emerald-500 to-green-600" },
  ],
  tr: [
    { value: "+2.5K", label: "Aktif Üye", icon: Users, color: "from-violet-500 to-purple-600" },
    { value: "+15K", label: "Mesaj/gün", icon: MessageCircle, color: "from-pink-500 to-rose-600" },
    { value: "+120", label: "Makale", icon: FileText, color: "from-violet-500 to-indigo-600" },
    { value: "+50", label: "Aktif Grup", icon: Users2, color: "from-amber-500 to-orange-600" },
    { value: "99.9%", label: "Çalışma", icon: Shield, color: "from-emerald-500 to-green-600" },
  ],
  pt: [
    { value: "+2.5K", label: "Membros ativos", icon: Users, color: "from-violet-500 to-purple-600" },
    { value: "+15K", label: "Mensagens/dia", icon: MessageCircle, color: "from-pink-500 to-rose-600" },
    { value: "+120", label: "Artigos", icon: FileText, color: "from-violet-500 to-indigo-600" },
    { value: "+50", label: "Grupos ativos", icon: Users2, color: "from-amber-500 to-orange-600" },
    { value: "99.9%", label: "Disponibilidade", icon: Shield, color: "from-emerald-500 to-green-600" },
  ],
  zh: [
    { value: "+2.5K", label: "活跃会员", icon: Users, color: "from-violet-500 to-purple-600" },
    { value: "+15K", label: "每日消息", icon: MessageCircle, color: "from-pink-500 to-rose-600" },
    { value: "+120", label: "文章", icon: FileText, color: "from-violet-500 to-indigo-600" },
    { value: "+50", label: "活跃群组", icon: Users2, color: "from-amber-500 to-orange-600" },
    { value: "99.9%", label: "运行时间", icon: Shield, color: "from-emerald-500 to-green-600" },
  ],
  ru: [
    { value: "+2.5K", label: "Активных", icon: Users, color: "from-violet-500 to-purple-600" },
    { value: "+15K", label: "Сообщений/день", icon: MessageCircle, color: "from-pink-500 to-rose-600" },
    { value: "+120", label: "Статей", icon: FileText, color: "from-violet-500 to-indigo-600" },
    { value: "+50", label: "Групп", icon: Users2, color: "from-amber-500 to-orange-600" },
    { value: "99.9%", label: "Доступность", icon: Shield, color: "from-emerald-500 to-green-600" },
  ],
};

export function LandingPage() {
  const [lang, setLang] = useState<Lang>("ar");
  const [mounted, setMounted] = useState(false);
  const [guestBusy, setGuestBusy] = useState(false);
  const navigate = useNavigate();
  const l = t[lang];
  const nav = navLabels[lang];
  const sb = sidebarLabels[lang];
  const hl = heroLabels[lang];
  const stats = heroStatsData[lang];
  const posts = blogPosts[lang];
  const fStats = footerStatsData[lang];

  useEffect(() => { setMounted(true); setLang(detectLang()); }, []);

  async function handleGuestEntry() {
    if (guestBusy) return;
    setGuestBusy(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate({ to: "/feed" });
        return;
      }
      const { error } = await supabase.auth.signInAnonymously();
      if (error) throw error;
      toast.success("مرحباً بك! تم منحك معرفاً مؤقتاً");
      navigate({ to: "/feed" });
    } catch (e: any) {
      toast.error(e?.message || "تعذر الدخول كزائر");
    } finally {
      setGuestBusy(false);
    }
  }

  const isRTL = lang === "ar";
  const init = mounted ? "hidden" as const : undefined;
  const enter = mounted ? "visible" as const : undefined;

  const sidebarIcons = [MessageCircle, Star, Send, Users, Users2, Bell, Settings];

  return (
    <div className="min-h-screen text-foreground overflow-x-hidden relative" dir={isRTL ? "rtl" : "ltr"} style={{ background: "radial-gradient(ellipse at top, oklch(0.14 0.05 270) 0%, oklch(0.08 0.04 265) 50%, oklch(0.06 0.03 260) 100%)" }}>
      <SocialProofToast />

      {/* Background orbs */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-[700px] w-[700px] rounded-full blur-[160px]" style={{ background: "radial-gradient(circle, oklch(0.55 0.25 295 / 0.35) 0%, transparent 70%)", animation: "meshFloat1 25s ease-in-out infinite" }} />
        <div className="absolute top-1/3 -left-40 h-[600px] w-[600px] rounded-full blur-[140px]" style={{ background: "radial-gradient(circle, oklch(0.50 0.22 270 / 0.3) 0%, transparent 70%)", animation: "meshFloat2 30s ease-in-out infinite" }} />
        <div className="absolute bottom-0 left-1/3 h-[500px] w-[500px] rounded-full blur-[130px]" style={{ background: "radial-gradient(circle, oklch(0.55 0.20 310 / 0.25) 0%, transparent 70%)", animation: "meshFloat3 22s ease-in-out infinite" }} />
      </div>

      <FloatingParticles />

      {/* ═══ HEADER ═══ */}
      <header className="relative z-30 border-b border-violet-500/10 backdrop-blur-2xl" style={{ background: "oklch(0.10 0.04 270 / 0.6)" }}>
        <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/feed" className="flex items-center gap-2.5 shrink-0">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-[0_0_20px_oklch(0.55_0.25_295/0.5)]">
              <MessageCircle className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-extrabold bg-gradient-to-r from-violet-300 via-fuchsia-300 to-violet-400 bg-clip-text text-transparent">HN-Chat</span>
          </Link>

          {/* Nav pills */}
          <nav className="hidden lg:flex items-center gap-1">
            {[
              { label: nav.home, to: "/", active: true },
              { label: nav.articles, to: "/blog" },
              { label: nav.chat, to: "/sign-up-login" },
              { label: nav.members, to: "/sign-up-login" },
              { label: nav.reels, to: "/sign-up-login" },
              { label: nav.aiTools, to: "/tools" },
              { label: nav.more, to: "/about" },
            ].map((item, i) => (
              <Link key={i} to={item.to} className={`relative px-4 py-2 text-sm font-semibold rounded-lg transition-all ${item.active ? "text-violet-300" : "text-foreground/70 hover:text-foreground hover:bg-white/5"}`}>
                {item.label}
                {item.active && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-8 bg-gradient-to-r from-violet-400 to-fuchsia-400 rounded-full" />}
              </Link>
            ))}
          </nav>

          {/* Icon actions */}
          <div className="flex items-center gap-2 shrink-0">
            <button className="h-9 w-9 rounded-full flex items-center justify-center text-foreground/70 hover:text-foreground hover:bg-white/5 transition-all" aria-label="Search">
              <Search className="h-4 w-4" />
            </button>
            <button className="h-9 w-9 rounded-full flex items-center justify-center text-foreground/70 hover:text-foreground hover:bg-white/5 transition-all" aria-label="Theme">
              <Moon className="h-4 w-4" />
            </button>
            <button className="h-9 w-9 rounded-full flex items-center justify-center text-foreground/70 hover:text-foreground hover:bg-white/5 transition-all relative" aria-label="Notifications">
              <Bell className="h-4 w-4" />
              <span className="absolute top-1.5 right-1.5 h-4 w-4 rounded-full bg-gradient-to-br from-pink-500 to-rose-600 text-[9px] font-bold text-white flex items-center justify-center">3</span>
            </button>
            {/* Lang dropdown */}
            <div className="relative group">
              <button className="h-9 px-3 rounded-full flex items-center gap-1.5 text-xs font-semibold bg-white/5 hover:bg-white/10 text-foreground/80 transition-all">
                <Globe className="h-3.5 w-3.5" /> {lang.toUpperCase()}
              </button>
              <div className="absolute top-full mt-1 end-0 min-w-[140px] rounded-xl border border-white/10 backdrop-blur-2xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 overflow-hidden" style={{ background: "oklch(0.10 0.04 270 / 0.95)" }}>
                {(Object.keys(t) as Lang[]).map((code) => (
                  <button key={code} onClick={() => setLang(code)} className={`w-full text-start px-3 py-2 text-xs font-medium transition-all ${lang === code ? "bg-violet-500/20 text-violet-200" : "text-muted-foreground hover:text-foreground hover:bg-white/5"}`}>{langLabels[code]}</button>
                ))}
              </div>
            </div>
            <Link to="/sign-up-login" className="flex items-center gap-2 ps-1 pe-3 py-1 rounded-full bg-white/5 hover:bg-white/10 transition-all">
              <div className="h-7 w-7 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-[10px] font-bold text-white">HN</div>
              <ArrowLeft className={`h-3.5 w-3.5 text-foreground/60 ${isRTL ? "" : "rotate-180"}`} />
            </Link>
          </div>
        </div>
      </header>

      {/* ═══ HERO ═══ */}
      <section className="relative z-10 max-w-[1400px] mx-auto px-6 pt-12 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.15fr] gap-10 items-center">
          {/* Hero Text */}
          <div className="text-center lg:text-start">
            <motion.h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-5" initial={init} animate={enter} variants={fadeUp} custom={0}>
              <span className="block text-foreground/90">{hl.welcome}</span>
              <span className="block mt-2 text-7xl lg:text-8xl font-black bg-gradient-to-r from-violet-400 via-fuchsia-400 to-violet-300 bg-clip-text text-transparent" style={{ textShadow: "0 0 60px oklch(0.55 0.25 295 / 0.5)" }}>HN-Chat</span>
            </motion.h1>
            <motion.p className="text-base lg:text-lg text-foreground/60 leading-relaxed max-w-md mx-auto lg:mx-0 mb-8" initial={init} animate={enter} variants={fadeUp} custom={1}>
              {hl.tagline}
            </motion.p>
            <motion.div className="flex flex-wrap gap-3 justify-center lg:justify-start mb-8" initial={init} animate={enter} variants={fadeUp} custom={2}>
              <button onClick={handleGuestEntry} disabled={guestBusy} className="px-7 py-3 text-sm font-bold rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-[0_8px_30px_oklch(0.65_0.18_180/0.4)] hover:shadow-[0_12px_40px_oklch(0.65_0.18_180/0.6)] hover:scale-105 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-60">
                <Zap className="h-4 w-4" /> {guestBusy ? "..." : "دخول مباشر"}
              </button>
              <button onClick={handleGuestEntry} disabled={guestBusy} className="px-7 py-3 text-sm font-bold rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-[0_8px_30px_oklch(0.55_0.25_295/0.4)] hover:shadow-[0_12px_40px_oklch(0.55_0.25_295/0.6)] hover:scale-105 active:scale-95 transition-all disabled:opacity-60">{hl.startNow}</button>
              <Link to="/sign-up-login">
                <button className="px-7 py-3 text-sm font-bold rounded-xl border border-violet-500/40 bg-white/5 backdrop-blur-xl text-foreground hover:bg-white/10 hover:border-violet-400/60 transition-all flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" /> {hl.joinChat}
                </button>
              </Link>
            </motion.div>

            {/* Stats row */}
            <motion.div className="grid grid-cols-2 sm:grid-cols-4 gap-3" initial={init} animate={enter} variants={fadeUp} custom={3}>
              {stats.map((s, i) => {
                const StatIcon = [Users, MessageCircle, FileText, Bot][i];
                return (
                  <div key={i} className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-white/10 bg-white/[0.03] backdrop-blur-xl">
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-500/30 to-purple-600/30 flex items-center justify-center shrink-0">
                      <StatIcon className="h-3.5 w-3.5 text-violet-300" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-foreground">{s.value}</div>
                      <div className="text-[10px] text-foreground/50 truncate">{s.label}</div>
                    </div>
                  </div>
                );
              })}
            </motion.div>
          </div>

          {/* Chat App Preview Card */}
          <motion.div className="relative" initial={mounted ? { opacity: 0, y: 30 } : undefined} animate={mounted ? { opacity: 1, y: 0 } : undefined} transition={{ delay: 0.3, duration: 0.8 }}>
            <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-violet-500/20 via-fuchsia-500/10 to-transparent blur-2xl" />
            <div className="relative rounded-2xl border border-violet-500/20 backdrop-blur-2xl overflow-hidden shadow-[0_30px_80px_oklch(0_0_0/0.5)]" style={{ background: "linear-gradient(135deg, oklch(0.12 0.04 275 / 0.85) 0%, oklch(0.10 0.04 270 / 0.85) 100%)" }}>
              <div className="grid grid-cols-[180px_1fr_180px] min-h-[460px]">
                {/* Sidebar */}
                <div className="border-e border-white/5 p-3" style={{ background: "oklch(0.08 0.03 270 / 0.5)" }}>
                  <div className="text-xs font-bold text-foreground/80 mb-3 px-2">HN Chat</div>
                  <div className="flex flex-col gap-1">
                    {sb.map((label, i) => {
                      const SIcon = sidebarIcons[i];
                      const active = i === 0;
                      return (
                        <button key={i} className={`flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-medium transition-all ${active ? "bg-gradient-to-r from-violet-500/30 to-purple-600/20 text-violet-200 border border-violet-500/30" : "text-foreground/60 hover:bg-white/5 hover:text-foreground"}`}>
                          <SIcon className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate">{label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Chat */}
                <div className="flex flex-col">
                  <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
                    <div>
                      <div className="text-sm font-bold">{hl.chatTitle}</div>
                      <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 mt-0.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        {hl.onlineNow}
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 px-4 py-3 flex flex-col gap-3 overflow-hidden">
                    {fakeChatMessages.map((m, i) => (
                      <div key={i} className={`flex items-start gap-2 ${m.self ? "flex-row-reverse" : ""}`}>
                        <div className={`h-7 w-7 rounded-full bg-gradient-to-br ${m.self ? "from-violet-500 to-purple-600" : "from-slate-500 to-slate-700"} flex items-center justify-center text-xs shrink-0`}>{m.avatar}</div>
                        <div className="min-w-0 max-w-[75%]">
                          <div className={`flex items-center gap-2 mb-1 text-[10px] ${m.self ? "flex-row-reverse" : ""}`}>
                            <span className="font-bold text-foreground/80">{m.user}</span>
                            <span className="text-foreground/40">{m.time}</span>
                          </div>
                          <div className={`px-3 py-2 rounded-2xl text-xs leading-relaxed ${m.self ? "bg-gradient-to-br from-violet-600 to-purple-700 text-white rounded-tr-sm" : "bg-white/[0.06] text-foreground/90 rounded-tl-sm border border-white/5"}`}>
                            {m.msg}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="px-4 py-3 border-t border-white/5 flex items-center gap-2">
                    <input readOnly placeholder={hl.typeMessage} className="flex-1 bg-white/5 border border-white/10 rounded-full px-3 py-1.5 text-xs placeholder:text-foreground/40 focus:outline-none" />
                    <button className="h-8 w-8 rounded-full bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center text-white">
                      <Send className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Online users */}
                <div className="border-s border-white/5 p-3" style={{ background: "oklch(0.08 0.03 270 / 0.4)" }}>
                  <div className="flex items-center justify-between mb-3 px-1">
                    <span className="text-xs font-bold text-foreground/80">{hl.onlineNow}</span>
                    <button className="text-[10px] text-violet-300">{hl.viewAll}</button>
                  </div>
                  <div className="flex flex-col gap-2">
                    {onlineUsers.map((u, i) => (
                      <div key={i} className="flex items-center gap-2 px-1.5 py-1.5 rounded-lg hover:bg-white/5 transition-all">
                        <div className="relative shrink-0">
                          <div className={`h-7 w-7 rounded-full bg-gradient-to-br ${u.color} flex items-center justify-center text-[10px] font-bold text-white`}>{u.name[0]}</div>
                          <span className="absolute -bottom-0.5 -end-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 border-2 border-[oklch(0.10_0.04_270)]" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-[11px] font-semibold text-foreground/90 truncate">{u.name}</div>
                          <div className="text-[9px] text-foreground/40">{hl.onlineNow}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══ DISCOVER CONTENT (Blog cards) ═══ */}
      <section className="relative z-10 max-w-[1400px] mx-auto px-6 py-16">
        <motion.div className="text-center mb-10" initial={init} whileInView={enter} viewport={{ once: true }} variants={fadeUp} custom={0}>
          <h2 className="text-3xl lg:text-4xl font-bold mb-2 flex items-center justify-center gap-2">
            <Sparkles className="h-6 w-6 text-violet-400" />
            <span>{hl.discoverContent}</span>
          </h2>
          <p className="text-sm text-foreground/50">{hl.discoverSub}</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {posts.map((p, i) => {
            const PIcon = p.icon;
            return (
              <motion.article
                key={i}
                className="group rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl overflow-hidden hover:border-violet-500/40 hover:scale-[1.02] transition-all cursor-pointer"
                initial={init} whileInView={enter} viewport={{ once: true }} variants={fadeUp} custom={i * 0.4}
              >
                <div className={`relative h-40 bg-gradient-to-br ${p.gradient} overflow-hidden flex items-center justify-center`}>
                  <PIcon className="h-16 w-16 text-white/20 absolute" />
                  <span className="absolute top-3 start-3 px-2.5 py-1 text-[10px] font-bold rounded-full bg-black/40 backdrop-blur-md text-white border border-white/20">{p.tag}</span>
                </div>
                <div className="p-4">
                  <h3 className="text-base font-bold text-foreground mb-2 line-clamp-2 group-hover:text-violet-300 transition-colors">{p.title}</h3>
                  <p className="text-xs text-foreground/50 line-clamp-2 mb-3 leading-relaxed">{p.desc}</p>
                  <div className="flex items-center justify-between text-[10px] text-foreground/40 pt-3 border-t border-white/5">
                    <span>{p.date}</span>
                    <span>{p.reads}</span>
                    <span className="flex items-center gap-1">
                      <span className="h-1 w-1 rounded-full bg-foreground/40" />
                      {p.views}
                    </span>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>
      </section>

      {/* ═══ FOOTER STATS BAR ═══ */}
      <section className="relative z-10 max-w-[1400px] mx-auto px-6 pb-12">
        <motion.div className="rounded-2xl border border-white/10 backdrop-blur-2xl p-6 lg:p-8" style={{ background: "oklch(0.10 0.04 270 / 0.5)" }} initial={init} whileInView={enter} viewport={{ once: true }} variants={fadeUp} custom={0}>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {fStats.map((s, i) => {
              const SIcon = s.icon;
              return (
                <div key={i} className="flex items-center gap-3 justify-center">
                  <div>
                    <div className="text-2xl lg:text-3xl font-black bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">{s.value}</div>
                    <div className="text-xs text-foreground/50 mt-0.5">{s.label}</div>
                  </div>
                  <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center shadow-lg`}>
                    <SIcon className="h-5 w-5 text-white" />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </section>

      {/* ═══ CHANNEL VIDEOS (imported) ═══ */}
      <ChannelVideosSection lang={lang} />

      {/* ═══ BLOG SECTION (existing) ═══ */}
      <BlogSection lang={lang} />

      {/* ═══ AD UNIT ═══ */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pb-10">
        <AdSenseUnit className="rounded-2xl overflow-hidden" />
      </section>

      <PartnerStrip />

      {/* ═══ FOOTER ═══ */}
      <footer className="relative z-10 py-10 px-6 border-t border-white/5">
        <div className="max-w-5xl mx-auto flex flex-col items-center gap-5">
          <div className="flex items-center gap-2">
            <HnLogo className="h-5 w-5 opacity-70" />
            <span className="text-xs font-semibold bg-gradient-to-r from-violet-300 to-fuchsia-300 bg-clip-text text-transparent">HN-Chat</span>
          </div>
          <div className="flex items-center gap-5 text-xs text-foreground/40 flex-wrap justify-center">
            <Link to="/about" className="hover:text-foreground/70 transition-colors">{l.about}</Link>
            <Link to="/blog" className="hover:text-foreground/70 transition-colors">Blog</Link>
            <Link to="/contact" className="hover:text-foreground/70 transition-colors">{l.contact}</Link>
            <Link to="/privacy" className="hover:text-foreground/70 transition-colors">{l.privacy}</Link>
            <Link to="/terms" className="hover:text-foreground/70 transition-colors">{l.terms}</Link>
          </div>
          <p className="text-[11px] text-foreground/30 text-center tracking-wide">{l.copyright}</p>
        </div>
      </footer>
    </div>
  );
}
