import { createFileRoute, redirect } from "@tanstack/react-router";

// الصفحة الرئيسية: تحوّل إلى /feed (الـ Smart Feed الموحّد)
export const Route = createFileRoute("/")({
  beforeLoad: () => {
    throw redirect({ to: "/feed" });
  },
});
