import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { CatalogGrid } from "@/components/catalog/CatalogGrid";
import { Zap } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/ads-promo")({
  component: AdsPromoPage,
});

function AdsPromoPage() {
  return (
    <PageShell
      title="Ads & Promo"
      subtitle="قوالب إعلانية جاهزة لإطلاق حملات بنقرة واحدة"
      action={
        <Button asChild size="sm" variant="outline">
          <Link to="/ads-manager">إدارة الحملات ←</Link>
        </Button>
      }
    >
      <CatalogGrid
        type="ad_template"
        cardIcon={Zap}
        ctaLabel="استخدم القالب"
        accent="pink"
        emptyText="لا توجد قوالب بعد"
        onAction={(item) => toast.success(`جاري إنشاء حملة من قالب: ${item.title}`)}
      />
    </PageShell>
  );
}
