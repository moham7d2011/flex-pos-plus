import { createFileRoute } from "@tanstack/react-router";
import { FlexBossPOS } from "@/components/flex-boss-pos";

export const Route = createFileRoute("/")({
  component: FlexBossPOS,
  head: () => ({
    meta: [
      { title: "فليكس بوس | نظام الكاشير المطور وإدارة المنتجات" },
      {
        name: "description",
        content:
          "إدارة الطاولات، القوائم، الطلبات والدفع من شاشة واحدة بتصميم احترافي.",
      },
    ],
  }),
});
