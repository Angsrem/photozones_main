import type { Metadata } from "next";
import { Inter, Unbounded } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "cyrillic"],
  display: "swap",
});

const unbounded = Unbounded({
  variable: "--font-unbounded",
  subsets: ["latin", "cyrillic"],
  weight: ["500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://fotoarka.ru"),
  title: {
    default: "Аренда фотозон в Красноярске — Fotoarka | Доставка и монтаж",
    template: "%s — Fotoarka Красноярск",
  },
  description:
    "Аренда фотозон в Красноярске и пригороде: свадебные, детские, корпоративные, новогодние. Доставка, монтаж и демонтаж включены. Заявка — перезвоним за 15 минут.",
  keywords: [
    "аренда фотозоны Красноярск", "фотозона на свадьбу", "детские фотозоны",
    "новогодняя фотозона", "фотозона на выпускной", "корпоративная фотозона",
    "пресс-волл Красноярск", "фотозона в аренду",
  ],
  authors: [{ name: "Fotoarka" }],
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: "/favicon.svg",
  },
  manifest: "/site.webmanifest",
  openGraph: {
    title: "Аренда фотозон в Красноярске — Fotoarka",
    description: "Свадебные, детские, корпоративные и сезонные фотозоны. Доставка и монтаж включены.",
    url: "https://fotoarka.ru",
    siteName: "Fotoarka",
    locale: "ru_RU",
    type: "website",
    images: [{ url: "/images/hero.jpg", width: 1344, height: 768 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Аренда фотозон в Красноярске — Fotoarka",
    description: "Свадебные, детские, корпоративные фотозоны. Доставка и монтаж включены.",
  },
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru" suppressHydrationWarning className={`${inter.variable} ${unbounded.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://mc.yandex.ru" />
      </head>
      <body
        className="antialiased bg-background text-foreground"
      >
        {children}
        <Toaster />
        <SonnerToaster position="top-center" richColors />
      </body>
    </html>
  );
}
