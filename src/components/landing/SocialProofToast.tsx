import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UserPlus, Crown, ShoppingBag, MessageCircle, Star } from "lucide-react";

const countries = [
  "Morocco", "Egypt", "Saudi Arabia", "UAE", "France", "Germany", "USA",
  "Canada", "Turkey", "Brazil", "Spain", "Japan", "India", "UK",
  "Russia", "Mexico", "Argentina", "South Korea", "Australia", "Italy",
  "Netherlands", "Sweden", "Portugal", "Poland", "Indonesia", "Nigeria",
  "South Africa", "Colombia", "Chile", "Thailand",
];

const names = [
  "Ahmed", "Sarah", "Youssef", "Fatima", "John", "Emma", "Carlos",
  "Maria", "Hans", "Sophie", "Yuki", "Priya", "Alex", "Lina",
  "Omar", "Mia", "Lucas", "Amira", "David", "Nour", "Chen",
  "Anna", "Karim", "Isabella", "Raj", "Elena", "Marco", "Aiko",
];

type NotifType = "signup" | "upgrade" | "purchase" | "chat" | "review";

const templates: { type: NotifType; icon: typeof UserPlus; color: string; make: () => string }[] = [
  {
    type: "signup",
    icon: UserPlus,
    color: "text-emerald-400",
    make: () => `New user from ${countries[Math.floor(Math.random() * countries.length)]} just signed up`,
  },
  {
    type: "upgrade",
    icon: Crown,
    color: "text-amber-400",
    make: () => `${names[Math.floor(Math.random() * names.length)]} upgraded to Pro`,
  },
  {
    type: "purchase",
    icon: ShoppingBag,
    color: "text-cyan-glow",
    make: () => `${names[Math.floor(Math.random() * names.length)]} bought a product from the marketplace`,
  },
  {
    type: "chat",
    icon: MessageCircle,
    color: "text-violet-glow",
    make: () => `${names[Math.floor(Math.random() * names.length)]} started a new AI chat`,
  },
  {
    type: "review",
    icon: Star,
    color: "text-pink-glow",
    make: () => `${names[Math.floor(Math.random() * names.length)]} gave a ⭐⭐⭐⭐⭐ review`,
  },
];

function randomTemplate() {
  const t = templates[Math.floor(Math.random() * templates.length)];
  return { ...t, text: t.make() };
}

export function SocialProofToast() {
  const [notif, setNotif] = useState<{ text: string; icon: typeof UserPlus; color: string } | null>(null);

  useEffect(() => {
    const first = setTimeout(() => { show(); }, 8000);

    let interval: ReturnType<typeof setInterval>;
    const startInterval = setTimeout(() => {
      interval = setInterval(() => { show(); }, 45000 + Math.random() * 30000);
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
    <div className="fixed bottom-6 left-6 z-50 pointer-events-none">
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
            <span className="shrink-0 text-[10px] text-muted-foreground whitespace-nowrap">Just now</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
