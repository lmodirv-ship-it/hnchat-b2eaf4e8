import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { HnLogo } from "@/components/HnLogo";
import { ArrowLeft, Calendar, Clock, ArrowRight } from "lucide-react";

const blogPosts = [
  {
    id: "what-is-super-app",
    title: "What is a Super App? And Why hnChat Leads the Way",
    titleAr: "ما هو التطبيق الفائق؟ ولماذا hnChat يتصدر الطريق",
    excerpt: "Super Apps combine messaging, social media, payments, and more into one platform. Learn how hnChat is redefining the concept with AI-powered features.",
    excerptAr: "التطبيقات الفائقة تجمع المراسلة والتواصل الاجتماعي والمدفوعات في منصة واحدة. اكتشف كيف يعيد hnChat تعريف المفهوم بميزات الذكاء الاصطناعي.",
    date: "2026-04-28",
    readTime: "5 min",
    category: "Technology",
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80",
  },
  {
    id: "ai-chat-future",
    title: "How AI Chat is Changing Communication Forever",
    titleAr: "كيف يغير الذكاء الاصطناعي التواصل إلى الأبد",
    excerpt: "From GPT-5 to Gemini, AI assistants are becoming essential. Here's how hnChat integrates the best AI models for seamless conversations.",
    excerptAr: "من GPT-5 إلى Gemini، أصبحت مساعدات الذكاء الاصطناعي ضرورية. إليك كيف يدمج hnChat أفضل النماذج لمحادثات سلسة.",
    date: "2026-04-20",
    readTime: "4 min",
    category: "AI",
    image: "https://images.unsplash.com/photo-1655720828018-edd2daec9349?w=800&q=80",
  },
  {
    id: "crypto-trading-beginners",
    title: "Crypto Trading for Beginners: Start with hnChat",
    titleAr: "تداول العملات الرقمية للمبتدئين: ابدأ مع hnChat",
    excerpt: "New to crypto? Our built-in trading tools make it easy to buy, sell, and track cryptocurrencies without leaving the app.",
    excerptAr: "جديد في العملات الرقمية؟ أدوات التداول المدمجة لدينا تجعل من السهل الشراء والبيع والتتبع دون مغادرة التطبيق.",
    date: "2026-04-15",
    readTime: "6 min",
    category: "Crypto",
    image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&q=80",
  },
  {
    id: "privacy-first-messaging",
    title: "Why Privacy-First Messaging Matters in 2026",
    titleAr: "لماذا تهم الخصوصية أولاً في المراسلة عام 2026",
    excerpt: "End-to-end encryption, zero data selling. Learn why hnChat puts your privacy above everything else.",
    excerptAr: "تشفير من طرف إلى طرف، صفر بيع بيانات. اعرف لماذا يضع hnChat خصوصيتك فوق كل شيء.",
    date: "2026-04-10",
    readTime: "3 min",
    category: "Security",
    image: "https://images.unsplash.com/photo-1563986768609-322da13575f2?w=800&q=80",
  },
  {
    id: "marketplace-sell-online",
    title: "Sell Your Products Online Using hnChat Marketplace",
    titleAr: "بع منتجاتك عبر الإنترنت باستخدام سوق hnChat",
    excerpt: "No need for a separate store. hnChat Marketplace lets you list, sell, and manage products directly within the platform.",
    excerptAr: "لا حاجة لمتجر منفصل. سوق hnChat يتيح لك عرض وبيع وإدارة المنتجات مباشرة داخل المنصة.",
    date: "2026-04-05",
    readTime: "5 min",
    category: "Business",
    image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80",
  },
  {
    id: "voice-rooms-community",
    title: "Building Communities with Voice Rooms",
    titleAr: "بناء المجتمعات عبر غرف الصوت",
    excerpt: "Voice rooms bring real-time audio conversations to your community. Discover how to host events, discussions, and live sessions on hnChat.",
    excerptAr: "غرف الصوت تجلب المحادثات الصوتية الفورية لمجتمعك. اكتشف كيف تستضيف الأحداث والنقاشات والجلسات المباشرة على hnChat.",
    date: "2026-03-28",
    readTime: "4 min",
    category: "Community",
    image: "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=800&q=80",
  },
];

const categoryColors: Record<string, string> = {
  Technology: "from-cyan-glow to-blue-500",
  AI: "from-violet-glow to-purple-500",
  Crypto: "from-amber-400 to-orange-500",
  Security: "from-emerald-400 to-green-500",
  Business: "from-pink-glow to-rose-500",
  Community: "from-cyan-glow to-violet-glow",
};

export const Route = createFileRoute("/blog")({
  head: () => ({
    meta: [
      { title: "hnChat Blog — Latest News on AI, Crypto, and Super Apps" },
      { name: "description", content: "Stay updated with the latest articles on AI chat, crypto trading, privacy, community building, and more from the hnChat team." },
      { property: "og:title", content: "hnChat Blog — Latest News" },
      { property: "og:description", content: "Articles on AI, crypto, privacy, and super app technology." },
      { name: "robots", content: "index, follow" },
    ],
    links: [{ rel: "canonical", href: "https://hn-chat.com/blog" }],
  }),
  component: BlogPage,
});

function BlogPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/70 border-b border-ice-border/10">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <HnLogo className="h-5 w-5" />
            <span className="text-sm font-semibold">hnChat</span>
          </Link>
          <Link
            to="/sign-up-login"
            className="px-4 py-1.5 text-xs font-semibold rounded-full bg-gradient-to-r from-cyan-glow to-violet-glow text-white hover:shadow-lg hover:shadow-cyan-glow/20 transition-all"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative py-20 px-6 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-glow/5 via-transparent to-transparent" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 max-w-3xl mx-auto"
        >
          <span className="inline-block px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full border border-cyan-glow/30 text-cyan-glow mb-4">
            Blog
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">
            Insights & <span className="bg-gradient-to-r from-cyan-glow to-violet-glow bg-clip-text text-transparent">Updates</span>
          </h1>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
            Explore the latest in AI, crypto, privacy, and super app technology from the hnChat team.
          </p>
        </motion.div>
      </section>

      {/* Blog Grid */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogPosts.map((post, i) => (
            <motion.article
              key={post.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="group relative rounded-2xl border border-ice-border/10 bg-ice-card/30 backdrop-blur-sm overflow-hidden hover:border-cyan-glow/30 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-glow/5"
            >
              <div className="aspect-video overflow-hidden">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
              </div>
              <div className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-gradient-to-r ${categoryColors[post.category] || "from-cyan-glow to-violet-glow"} text-white`}>
                    {post.category}
                  </span>
                  <span className="flex items-center gap-1 text-[10px] text-muted-foreground/60">
                    <Calendar className="w-3 h-3" /> {post.date}
                  </span>
                  <span className="flex items-center gap-1 text-[10px] text-muted-foreground/60">
                    <Clock className="w-3 h-3" /> {post.readTime}
                  </span>
                </div>
                <h2 className="text-base font-bold leading-snug mb-2 group-hover:text-cyan-glow transition-colors">
                  {post.title}
                </h2>
                <p className="text-xs text-muted-foreground/70 leading-relaxed line-clamp-3">
                  {post.excerpt}
                </p>
                <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-cyan-glow opacity-0 group-hover:opacity-100 transition-opacity">
                  Read more <ArrowRight className="w-3 h-3" />
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-ice-border/10">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-[11px] text-muted-foreground/40">
          <div className="flex items-center gap-2">
            <HnLogo className="h-4 w-4 opacity-50" />
            <span>© 2026 hnChat. Design by Moulay Ismail El Hassani</span>
          </div>
          <Link to="/" className="hover:text-foreground/60 transition-colors">← Back to Home</Link>
        </div>
      </footer>
    </div>
  );
}
