import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono, Inter } from "next/font/google";
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
    <html lang="en" className="dark scroll-smooth" suppressHydrationWarning>
      <body
        className={`${plusJakarta.variable} ${jetbrainsMono.variable} ${inter.variable} antialiased min-h-screen bg-background text-foreground flex flex-col font-jakarta`}
      >
        <QueryProviders>
          {children}
        </QueryProviders>
      </body>
    </html>
  );
}
