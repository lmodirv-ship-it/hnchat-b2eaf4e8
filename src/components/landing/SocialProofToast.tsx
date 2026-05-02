import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UserPlus, Crown, ShoppingBag, MessageCircle, Star } from "lucide-react";

const countries = ["المغرب", "مصر", "السعودية", "الإمارات", "الجزائر", "تونس", "العراق", "الأردن", "فرنسا", "ألمانيا", "كندا", "أمريكا", "تركيا", "قطر", "الكويت", "عُمان", "ليبيا", "السودان", "لبنان", "البحرين"];
const names = ["أحمد", "سارة", "يوسف", "فاطمة", "خالد", "نور", "عمر", "مريم", "حسن", "ليلى", "محمد", "هند", "علي", "رانيا", "كريم", "سلمى", "ياسين", "دنيا", "أمين", "إيمان"];

type NotifType = "signup" | "upgrade" | "purchase" | "chat" | "review";

const templates: { type: NotifType; icon: typeof UserPlus; color: string; make: () => string }[] = [
  {
    type: "signup",
    icon: UserPlus,
    color: "text-emerald-400",
    make: () => `سجّل مستخدم جديد من ${countries[Math.floor(Math.random() * countries.length)]} للتو`,
  },
  {
    type: "upgrade",
    icon: Crown,
    color: "text-amber-400",
    make: () => `قام ${names[Math.floor(Math.random() * names.length)]} بترقية حسابه لـ Pro الآن`,
  },
  {
    type: "purchase",
    icon: ShoppingBag,
    color: "text-cyan-glow",
    make: () => `اشترى ${names[Math.floor(Math.random() * names.length)]} منتجاً من المتجر`,
  },
  {
    type: "chat",
    icon: MessageCircle,
    color: "text-violet-glow",
    make: () => `بدأ ${names[Math.floor(Math.random() * names.length)]} محادثة AI جديدة`,
  },
  {
    type: "review",
    icon: Star,
    color: "text-pink-glow",
    make: () => `أعطى ${names[Math.floor(Math.random() * names.length)]} تقييم ⭐⭐⭐⭐⭐`,
  },
];

function randomTemplate() {
  const t = templates[Math.floor(Math.random() * templates.length)];
  return { ...t, text: t.make() };
}

export function SocialProofToast() {
  const [notif, setNotif] = useState<{ text: string; icon: typeof UserPlus; color: string } | null>(null);

  useEffect(() => {
    // Show first after 8 seconds
    const first = setTimeout(() => {
      show();
    }, 8000);

    // Then every 45-75 seconds
    let interval: ReturnType<typeof setInterval>;
    const startInterval = setTimeout(() => {
      interval = setInterval(() => {
        show();
      }, 45000 + Math.random() * 30000);
    }, 8000);

    function show() {
      const n = randomTemplate();
      setNotif(n);
      setTimeout(() => setNotif(null), 5000);
    }

    return () => {
      clearTimeout(first);
      clearTimeout(startInterval);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="fixed bottom-6 left-6 z-50 pointer-events-none" dir="rtl">
      <AnimatePresence>
        {notif && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.4, ease: "easeOut" as const }}
            className="pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-2xl border border-ice-border/60 bg-ice-card/80 backdrop-blur-2xl shadow-diamond max-w-xs"
          >
            <div className={`shrink-0 ${notif.color}`}>
              <notif.icon className="h-5 w-5" />
            </div>
            <p className="text-sm text-foreground leading-snug">{notif.text}</p>
            <span className="shrink-0 text-[10px] text-muted-foreground whitespace-nowrap">الآن</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
