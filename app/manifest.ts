import type { MetadataRoute } from "next";

/** Matches the green in `scripts/generate-pwa-icons.mjs` (icon base tone). */
const BRAND_GREEN = "#15803d";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Convertir bolívares",
    short_name: "Convertir",
    description: "Conversión USD/EUR con tasa BCV y particulares",
    start_url: "/home",
    scope: "/",
    display: "standalone",
    background_color: BRAND_GREEN,
    theme_color: BRAND_GREEN,
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
