import type { Metadata } from "next";
import { Sofia_Sans, Inter } from "next/font/google";
import "./globals.css";

const sofiaSans = Sofia_Sans({
  subsets: ["latin"],
  variable: "--font-sofia",
  weight: ["400", "500", "700"],
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "DengarDulu — Dengar Dulu, Jawab Kemudian",
  description:
    "AI safety copilot for Malaysian voice-note scams. Forward a suspicious WhatsApp voice note, get verdict + personalized verification question in 15 seconds. Powered by Gemini 2.5 Flash.",
  keywords: [
    "Malaysia",
    "scam",
    "deepfake",
    "voice",
    "WhatsApp",
    "Gemini",
    "AI",
    "fintech",
    "FinTech",
    "fraud",
  ],
  authors: [{ name: "DengarDulu Team" }],
  openGraph: {
    title: "DengarDulu — AI Voice-Scam Shield for Malaysia",
    description:
      "Forward a suspicious voice note. Get AI verdict + verification question in 15 seconds.",
    locale: "en_MY",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${sofiaSans.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
