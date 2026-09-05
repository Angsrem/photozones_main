import type { Metadata } from "next";
import { Geist, Geist_Mono, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "cyrillic"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin", "cyrillic"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://fotozona24.ru"),
  title: {
    default: "Аренда фотозон в Красноярске — ФотоЗона24 | Доставка и монтаж",
    template: "%s — ФотоЗона24 Красноярск",
  },
  description:
    "Аренда фотозон в Красноярске и пригороде: свадебные, детские, корпоративные, новогодние. Доставка, монтаж и демонтаж включены. Заявка — перезвоним за 15 минут.",
  keywords: [
    "аренда фотозоны Красноярск", "фотозона на свадьбу", "детские фотозоны",
    "новогодняя фотозона", "фотозона на выпускной", "корпоративная фотозона",
    "пресс-волл Красноярск", "фотозона в аренду",
  ],
  authors: [{ name: "ФотоЗона24" }],
  openGraph: {
    title: "Аренда фотозон в Красноярске — ФотоЗона24",
    description: "Свадебные, детские, корпоративные и сезонные фотозоны. Доставка и монтаж включены.",
    url: "https://fotozona24.ru",
    siteName: "ФотоЗона24",
    locale: "ru_RU",
    type: "website",
    images: [{ url: "/images/hero.png", width: 1344, height: 768 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Аренда фотозон в Красноярске — ФотоЗона24",
    description: "Свадебные, детские, корпоративные фотозоны. Доставка и монтаж включены.",
  },
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://mc.yandex.ru" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
        <SonnerToaster position="top-center" richColors />
      </body>
    </html>
  );
}
