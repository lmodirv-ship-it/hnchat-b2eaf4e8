import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { ConversationList } from "@/components/messages/ConversationList";
import { NewConversationDialog } from "@/components/messages/NewConversationDialog";

export const Route = createFileRoute("/_authenticated/messages")({
  component: MessagesPage,
});

function MessagesPage() {
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
