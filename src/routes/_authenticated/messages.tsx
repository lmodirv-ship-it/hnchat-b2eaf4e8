import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ConversationList } from "@/components/messages/ConversationList";
import { ChatThread } from "@/components/messages/ChatThread";
import { NewConversationDialog } from "@/components/messages/NewConversationDialog";
import { MessageCircle, Search, Phone, Video, Info, PenSquare } from "lucide-react";
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
      <div className="flex flex-col h-[calc(100vh-56px)]">
        <div className="p-4 border-b border-[oklch(0.25_0.03_250/0.2)]">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-xl font-bold text-white">المحادثات</h1>
            <NewConversationDialog />
          </div>
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[oklch(0.45_0.02_250)]" />
            <Input
              placeholder="ابحث عن مستخدم أو محادثة..."
              className="pr-9 bg-[oklch(0.18_0.025_255)] border-[oklch(0.25_0.03_250/0.3)] rounded-xl text-sm"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          <ConversationList />
        </div>
      </div>
    );
  }

  // Desktop: premium split layout
  return (
    <div className="flex h-[calc(100vh-56px)]">
      {/* Conversations panel */}
      <div className="w-[360px] shrink-0 flex flex-col border-l border-[oklch(0.25_0.03_250/0.2)] bg-[oklch(0.13_0.025_255)]">
        {/* Header */}
        <div className="p-4 border-b border-[oklch(0.25_0.03_250/0.2)]">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-white">المحادثات</h2>
            <NewConversationDialog />
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[oklch(0.45_0.02_250)]" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث عن مستخدم أو محادثة..."
              className="pr-9 bg-[oklch(0.16_0.02_255)] border-[oklch(0.25_0.03_250/0.2)] rounded-xl h-9 text-sm text-white placeholder:text-[oklch(0.45_0.02_250)]"
            />
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-1 mt-3">
            <button className="px-4 py-1.5 rounded-lg text-xs font-medium bg-[oklch(0.30_0.08_230/0.4)] text-white transition-colors">
              الكل
            </button>
            <button className="px-4 py-1.5 rounded-lg text-xs font-medium text-[oklch(0.55_0.02_250)] hover:bg-[oklch(0.20_0.03_250/0.3)] transition-colors flex items-center gap-1.5">
              غير مقروءة
              <span className="bg-[oklch(0.45_0.15_260)] text-white text-[10px] font-bold min-w-[18px] h-[18px] flex items-center justify-center rounded-full px-1">5</span>
            </button>
            <button className="px-4 py-1.5 rounded-lg text-xs font-medium text-[oklch(0.55_0.02_250)] hover:bg-[oklch(0.20_0.03_250/0.3)] transition-colors">
              المفضلة
            </button>
          </div>
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto p-2">
          <ConversationList activeId={selectedId ?? undefined} onSelect={setSelectedId} />
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 min-w-0 flex flex-col bg-[oklch(0.14_0.025_258)]">
        {selectedId ? (
          <ChatThread conversationId={selectedId} compact />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="w-20 h-20 rounded-2xl bg-[oklch(0.20_0.04_255)] flex items-center justify-center mb-5">
              <MessageCircle className="w-10 h-10 text-[oklch(0.50_0.10_230)]" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">اختر محادثة</h3>
            <p className="text-sm text-[oklch(0.55_0.02_250)] max-w-xs">
              اختر محادثة من القائمة أو ابدأ محادثة جديدة للتواصل مع أصدقائك
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
