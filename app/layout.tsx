import type { Metadata } from "next";
import { Playfair_Display, Inter, Nunito } from "next/font/google";
import "./globals.css";
import { alpha } from "framer-motion";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Smart Neurons Preschool | by Wow Kids – Bhopal",
    template: "%s | Smart Neurons Preschool",
  },
  description:
    "Premium preschool in Bhopal where little minds bloom. Playgroup to Senior KG with expert teachers, safe environment, and holistic play-based learning. Admissions open.",
  keywords: [
    "preschool Bhopal",
    "playschool Bhopal",
    "Smart Neurons",
    "Wow Kids",
    "kindergarten Bhopal",
    "Jatkhedi school",
  ],
  openGraph: {
    title: "Smart Neurons Preschool by Wow Kids",
    description: "Where little minds bloom – premium preschool in Bhopal, MP.",
    url: "https://smartneurons.in",
    siteName: "Smart Neurons Preschool",
    locale: "en_IN",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${inter.variable} ${nunito.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-warm-100">
        {children}
      </body>
    </html>
  );
}
