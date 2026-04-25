import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { ComingSoon } from "@/components/ComingSoon";
import { ShoppingCart } from "lucide-react";

export const Route = createFileRoute("/_authenticated/hnshop")({
  component: () => (
    <PageShell title="hnShop" subtitle="متجر hnChat الرسمي للمنتجات الرقمية والاشتراكات">
      <ComingSoon
        icon={ShoppingCart}
        title="hnShop قادم بقوة 🛍️"
        description="منصة تسوّق متكاملة داخل hnChat تجمع المنتجات الرقمية، الاشتراكات المميّزة، والعملات الافتراضية في مكان واحد."
        features={[
          "اشتراكات Premium بميزات حصرية",
          "عملات hnChat لشراء الهدايا والملصقات",
          "خصومات يومية ومجموعات حصرية",
          "محفظة موحّدة عبر كل المنصة",
        ]}
      />
    </PageShell>
  ),
});
