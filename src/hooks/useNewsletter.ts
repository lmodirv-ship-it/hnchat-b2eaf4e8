import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useNewsletter() {
  const [loading, setLoading] = useState(false);

  const subscribe = async (email: string, source = "website") => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("newsletter_subscribers")
        .insert({ email, source });
      if (error) {
        if (error.code === "23505") {
          toast.info("أنت مشترك بالفعل! 📬");
        } else {
          throw error;
        }
      } else {
        toast.success("تم الاشتراك بنجاح! 🎉");
      }
      return true;
    } catch {
      toast.error("حدث خطأ، حاول مرة أخرى");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { subscribe, loading };
}
