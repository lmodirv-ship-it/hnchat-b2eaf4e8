import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ConversationList } from "@/components/messages/ConversationList";
import { ChatThread } from "@/components/messages/ChatThread";
import { NewConversationDialog } from "@/components/messages/NewConversationDialog";
import { MessageCircle, Search } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/_authenticated/messages")({
  component: MessagesPage,
});

function MessagesPage() {
  const isMobile = useIsMobile();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  if (isMobile) {
    return (
      <div className="flex flex-col h-full">
        <div className="p-3 border-b border-[oklch(1_0_0/0.06)]">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-lg font-bold text-white">المحادثات</h1>
            <NewConversationDialog />
          </div>
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[oklch(0.40_0.02_250)]" />
            <Input
              placeholder="ابحث عن مستخدم أو محادثة..."
              className="pr-8 h-8 bg-[oklch(0.14_0.02_258)] border-[oklch(1_0_0/0.08)] rounded-lg text-[13px]"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          <ConversationList />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* Conversations panel — like Discord's channel/DM list */}
      <div className="w-[320px] shrink-0 flex flex-col border-l border-[oklch(1_0_0/0.06)] bg-[oklch(0.11_0.02_258)]">
        <div className="p-3 shrink-0">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-[15px] font-bold text-white">المحادثات</h2>
            <NewConversationDialog />
          </div>

          <div className="relative">
            <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[oklch(0.40_0.02_250)]" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث عن مستخدم أو محادثة..."
              className="pr-8 h-8 bg-[oklch(0.08_0.015_258)] border-[oklch(1_0_0/0.06)] rounded-lg text-[12px] text-white placeholder:text-[oklch(0.40_0.02_250)]"
            />
          </div>

          {/* Filter tabs */}
          <div className="flex items-center gap-0.5 mt-2">
            <button className="px-3 py-1 rounded-md text-[11px] font-medium bg-[oklch(0.22_0.05_230/0.5)] text-white transition-colors">
              الكل
            </button>
            <button className="px-3 py-1 rounded-md text-[11px] font-medium text-[oklch(0.50_0.02_250)] hover:bg-[oklch(1_0_0/0.04)] transition-colors flex items-center gap-1">
              غير مقروءة
              <span className="bg-[oklch(0.50_0.18_260)] text-white text-[9px] font-bold min-w-[16px] h-4 flex items-center justify-center rounded-full px-1">5</span>
            </button>
            <button className="px-3 py-1 rounded-md text-[11px] font-medium text-[oklch(0.50_0.02_250)] hover:bg-[oklch(1_0_0/0.04)] transition-colors">
              المفضلة
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-1.5 pb-1">
          <ConversationList activeId={selectedId ?? undefined} onSelect={setSelectedId} />
        </div>
      </div>

      {/* Main chat area */}
      <div className="flex-1 min-w-0 flex flex-col bg-[oklch(0.12_0.025_258)]">
        {selectedId ? (
          <ChatThread conversationId={selectedId} compact />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="w-16 h-16 rounded-2xl bg-[oklch(0.16_0.03_258)] border border-[oklch(1_0_0/0.06)] flex items-center justify-center mb-4">
              <MessageCircle className="w-8 h-8 text-[oklch(0.45_0.10_230)]" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1.5">اختر محادثة</h3>
            <p className="text-[13px] text-[oklch(0.48_0.02_250)] max-w-[260px] leading-relaxed">
              اختر محادثة من القائمة أو ابدأ محادثة جديدة للتواصل مع أصدقائك
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
