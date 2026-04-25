import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { ProductGrid } from "@/components/marketplace/ProductGrid";
import { NewProductDialog } from "@/components/marketplace/NewProductDialog";
import { ImportProductDialog } from "@/components/marketplace/ImportProductDialog";

export const Route = createFileRoute("/_authenticated/marketplace")({
  component: MarketplacePage,
});

function MarketplacePage() {
  const [refreshKey, setRefreshKey] = useState(0);
  return (
    <PageShell
      title="السوق"
      subtitle="اكتشف وبِع منتجات داخل المجتمع"
      action={
        <div className="flex gap-2">
          <ImportProductDialog onCreated={() => setRefreshKey((k) => k + 1)} />
          <NewProductDialog onCreated={() => setRefreshKey((k) => k + 1)} />
        </div>
      }
    >
      <ProductGrid refreshKey={refreshKey} />
    </PageShell>
  );
}
