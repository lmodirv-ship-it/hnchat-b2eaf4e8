import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const fetchSharedChat = createServerFn({ method: "GET" })
  .inputValidator((data: { shareId: string }) => data)
  .handler(async ({ data }) => {
    const { data: chat, error } = await supabaseAdmin
      .from("shared_chats")
      .select("id, share_id, title, messages, created_at, user_id")
      .eq("share_id", data.shareId)
      .maybeSingle();

    if (error || !chat) return null;

    const { data: author } = await supabaseAdmin
      .from("profiles")
      .select("username, full_name, avatar_url")
      .eq("id", chat.user_id)
      .maybeSingle();

    return {
      id: chat.id,
      share_id: chat.share_id,
      title: chat.title,
      messages: chat.messages as { role: string; content: string }[],
      created_at: chat.created_at,
      author: author ?? null,
    };
  });
