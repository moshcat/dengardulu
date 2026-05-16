import type { Metadata } from "next";
import { Sofia_Sans, Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
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
  manifest: "/manifest.json",
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
    siteName: "DengarDulu",
    locale: "en_MY",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "DengarDulu — AI Voice-Scam Shield for Malaysia",
    description:
      "Forward a suspicious voice note. Get AI verdict + verification question in 15 seconds.",
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
      <body className="min-h-full flex flex-col font-sans">
        <script
          dangerouslySetInnerHTML={{
            __html: `if('serviceWorker' in navigator){navigator.serviceWorker.register('/sw.js')}`,
          }}
        />
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[200] focus:rounded-full focus:bg-[var(--color-ink)] focus:text-[var(--color-canvas)] focus:px-6 focus:py-3 focus:text-sm focus:font-medium"
        >
          Skip to content
        </a>
        <TooltipProvider>
          {children}
        </TooltipProvider>
        <Toaster position="bottom-center" />
      </body>
    </html>
  );
}
