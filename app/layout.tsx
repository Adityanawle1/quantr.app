import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono, Inter, DM_Serif_Display, Playfair_Display } from "next/font/google";
import "./globals.css";
import { QueryProviders } from "./providers";
import { ClientLayout } from "@/components/global/client-layout";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const dmSerifDisplay = DM_Serif_Display({
  variable: "--font-dm-serif",
  weight: "400",
  subsets: ["latin"],
});

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "QUANTR — Invest with Precision",
  description: "High-end financial research platform for India",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <body
        className={`${plusJakarta.variable} ${jetbrainsMono.variable} ${inter.variable} ${dmSerifDisplay.variable} ${playfairDisplay.variable} antialiased min-h-screen bg-background text-foreground flex flex-col font-sans`}
      >
        <QueryProviders>
          {children}
        </QueryProviders>
      </body>
    </html>
  );
}
