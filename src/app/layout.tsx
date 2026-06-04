import type { Metadata } from "next";
import { Instrument_Serif, Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import PageViewTracker from "@/components/PageViewTracker";

// Hanya load font yang benar-benar dipakai — hapus Geist yang tidak digunakan
const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "TailorCraft — Seni Jahitan Sempurna",
  description:
    "Wujudkan busana impian Anda bersama TailorCraft. Material premium, presisi tingkat tinggi, dan layanan custom untuk setiap mahakarya.",
  keywords: ["tailoring", "jahit custom", "kain premium", "busana", "jas", "kebaya"],
  openGraph: {
    title: "TailorCraft — Seni Jahitan Sempurna",
    description: "Wujudkan busana impian Anda bersama TailorCraft.",
    type: "website",
    locale: "id_ID",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${instrumentSerif.variable} ${inter.variable} h-full antialiased`}
    >
      <head>
        {/* Preconnect ke domain gambar eksternal — kurangi latency */}
        <link rel="preconnect" href="https://images.unsplash.com" />
        <link rel="preconnect" href="https://randomuser.me" />
        <link rel="dns-prefetch" href="https://svgl.app" />
        <link rel="dns-prefetch" href="https://fonts.cdnfonts.com" />
      </head>
      <body className="min-h-full flex flex-col bg-[var(--background)] text-[var(--foreground)] font-sans pb-[80px] md:pb-0">
        <PageViewTracker />
        <Navbar />
        {children}
      </body>
    </html>
  );
}

