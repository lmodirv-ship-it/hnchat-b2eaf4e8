import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { CatalogGrid } from "@/components/catalog/CatalogGrid";
import { Store } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/app-store")({
  component: () => (
    <PageShell title="App Store" subtitle="تطبيقات وأدوات تثري تجربتك في hnChat">
      <CatalogGrid
        type="app"
        cardIcon={Store}
        ctaLabel="تثبيت"
        accent="cyan"
        emptyText="لا توجد تطبيقات بعد"
        onAction={(item) => toast.success(`تم بدء تثبيت ${item.title}`)}
      />
    </PageShell>
  ),
});
