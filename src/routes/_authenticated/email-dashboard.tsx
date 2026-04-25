import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { ComingSoon } from "@/components/ComingSoon";
import { Mail } from "lucide-react";

export const Route = createFileRoute("/_authenticated/email-dashboard")({
  component: () => (
    <PageShell title="Email Dashboard" subtitle="حملات البريد الإلكتروني وتحليلاتها">
      <ComingSoon
        icon={Mail}
        title="Email Dashboard 📧"
        description="أرسل نشرات بريدية، تتبّع المعدّلات، وأدر القوالب من مكان واحد."
        features={[
          "محرّر نشرات بسحب وإفلات",
          "معدّلات الفتح والنقر بالوقت الفعلي",
          "قوالب جاهزة قابلة للتخصيص",
          "حماية ضد البريد المزعج",
        ]}
      />
    </PageShell>
  ),
});
