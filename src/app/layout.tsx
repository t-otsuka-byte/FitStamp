import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google"; // Assuming these are the default fonts
import "./globals.css";
import { Header } from "@/components/layout/Header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FitStamp - 運動習慣トラッカー",
  description: "毎日の運動習慣をスタンプで記録しよう。",
  appleWebApp: {
    title: "FitStamp",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: "#f97316",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <Header />
        <main className="flex-1">
          {children}
        </main>
      </body>
    </html>
  );
}
