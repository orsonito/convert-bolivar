import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import RateTicker from "@/components/rate-ticker/rate-ticker";
import { getBcvRate } from "@/lib/bcv-rate";
import { getCopVesCrossRate } from "@/lib/cop-ves";
import "./globals.css";
import RegisterSW from "@/components/register-sw/register-sw";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  applicationName: "Convertir bolívares",
  title: "Convertir bolívares",
  description: "Conversión USD/EUR con tasa BCV y particulares",
  icons: {
    icon: [{ url: "/icon-192.png", sizes: "192x192", type: "image/png" }],
    apple: [{ url: "/icon-192.png", sizes: "192x192", type: "image/png" }],
  },
  appleWebApp: {
    capable: true,
    title: "Convertir bolívares",
    statusBarStyle: "black-translucent",
  },
};

/** Same green as PWA manifest / app icon. */
const BRAND_GREEN = "#15803d";

export const viewport: Viewport = {
  themeColor: BRAND_GREEN,
  colorScheme: "light dark",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [usd, eur, copCross] = await Promise.all([
    getBcvRate("usd"),
    getBcvRate("eur"),
    getCopVesCrossRate(),
  ]);

  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col pb-32">
        <RegisterSW />
        {children}
        <RateTicker usd={usd} eur={eur} copCross={copCross} />
      </body>
    </html>
  );
}
