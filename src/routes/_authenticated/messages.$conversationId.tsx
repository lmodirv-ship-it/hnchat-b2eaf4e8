import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { ChatThread } from "@/components/messages/ChatThread";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export const Route = createFileRoute("/_authenticated/messages/$conversationId")({
  component: ConversationPage,
});

function ConversationPage() {
  const { conversationId } = Route.useParams();
  return (
    <PageShell
      title="محادثة"
      subtitle="رسائل لحظية"
      action={
        <Button asChild variant="ghost" size="sm">
          <Link to="/messages">
            <ArrowRight className="h-4 w-4 mr-1" /> رجوع
          </Link>
        </Button>
      }
    >
      <ChatThread conversationId={conversationId} />
    </PageShell>
  );
}
