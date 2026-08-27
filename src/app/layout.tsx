import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["600", "700"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: "#0A0A0F",
};

export const metadata: Metadata = {
  title: "VibeForge — AI Future Self Simulator",
  description:
    "See your future self before you get there. VibeForge uses AI to simulate 3 parallel futures based on your goals, then gives you an actionable plan to get there.",
  keywords: [
    "AI simulator",
    "future planning",
    "career planning",
    "goal setting",
    "life planning",
    "AI predictions",
  ],
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "VibeForge",
  },
  openGraph: {
    title: "VibeForge — AI Future Self Simulator",
    description:
      "See your future self before you get there. AI-powered parallel future simulations.",
    type: "website",
  },
};

import CosmicBackground from "@/components/three/CosmicBackground";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${inter.variable} antialiased`}
      style={{ colorScheme: "dark" }}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <body className="min-h-screen text-[var(--text-primary)] bg-transparent">
        <CosmicBackground />
        <div className="relative z-10">
          {children}
        </div>
      </body>
    </html>
  );
}
