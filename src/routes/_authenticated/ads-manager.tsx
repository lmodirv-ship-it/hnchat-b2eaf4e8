import { createFileRoute } from "@tanstack/react-router";
import { AdsManager } from "@/components/ads/AdsManager";

export const Route = createFileRoute("/_authenticated/ads-manager")({
  component: () => (
    <div className="container max-w-6xl mx-auto px-4 py-6">
      <AdsManager />
    </div>
  ),
});
