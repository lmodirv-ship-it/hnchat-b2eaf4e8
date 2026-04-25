import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { CatalogGrid } from "@/components/catalog/CatalogGrid";
import { ShoppingCart } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/hnshop")({
  component: () => (
    <PageShell title="hnShop" subtitle="متجر hnChat الرسمي للاشتراكات والعملات والملصقات">
      <CatalogGrid
        type="shop_product"
        cardIcon={ShoppingCart}
        ctaLabel="شراء"
        accent="cyan"
        emptyText="لا توجد منتجات بعد"
        onAction={(item) => toast.info(`المدفوعات قريباً — ${item.title}`)}
      />
    </PageShell>
  ),
});
