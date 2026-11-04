import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Batchly — Purchase & Shipment Tracker",
    short_name: "Batchly",
    description:
      "Track group orders, direct seller purchases, payments, shipping progress, and outstanding balances in one place.",
    // Signed-out installs land on the landing page, which forwards them to login.
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#f7f6f3",
    theme_color: "#f7f6f3",
    categories: ["productivity", "shopping"],
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
