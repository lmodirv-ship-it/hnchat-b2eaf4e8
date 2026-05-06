import { createFileRoute, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/user/$userId")({
  beforeLoad: async ({ params }) => {
    // Redirect to username-based profile
    const { data } = await supabase
      .from("profiles")
      .select("username")
      .eq("id", params.userId)
      .maybeSingle();
    if (data?.username) {
      throw redirect({ to: "/profile/$username", params: { username: data.username } });
    }
    throw redirect({ to: "/feed" });
  },
  component: () => null,
});
