import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { PageShell } from "@/components/PageShell";
import { ConversationList } from "@/components/messages/ConversationList";
import { ChatThread } from "@/components/messages/ChatThread";
import { NewConversationDialog } from "@/components/messages/NewConversationDialog";
import { MessageCircle } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

export const Route = createFileRoute("/_authenticated/messages")({
  component: MessagesPage,
});

function MessagesPage() {
  const isMobile = useIsMobile();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  if (isMobile) {
    // Mobile: show list only (individual chat is a separate route)
    return (
      <PageShell
        title="الرسائل"
        subtitle="محادثات لحظية مع أصدقائك"
        action={<NewConversationDialog />}
      >
        <ConversationList />
      </PageShell>
    );
  }

  // Desktop: split-panel layout
  return (
    <PageShell
      title="الرسائل"
      subtitle="محادثات لحظية مع أصدقائك"
      action={<NewConversationDialog />}
    >
      <div className="flex gap-4 h-[calc(100vh-200px)] min-h-[520px]">
        {/* Left: Conversations */}
        <div className="w-[340px] shrink-0 overflow-y-auto rounded-2xl border border-border bg-card/40 backdrop-blur-sm p-3">
          <ConversationList activeId={selectedId ?? undefined} onSelect={setSelectedId} />
        </div>

        {/* Right: Chat */}
        <div className="flex-1 min-w-0">
          {selectedId ? (
            <ChatThread conversationId={selectedId} compact />
          ) : (
            <div className="h-full rounded-2xl border border-border bg-card/40 backdrop-blur-sm flex flex-col items-center justify-center text-center p-8">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <MessageCircle className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">اختر محادثة</h3>
              <p className="text-sm text-muted-foreground">اختر محادثة من القائمة أو ابدأ محادثة جديدة</p>
            </div>
          )}
        </div>
      </div>
    </PageShell>
  );
}
