import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin", "latin-ext"], weight: ["400", "500", "600", "700"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "novaarlen",
  description: "Portfolio desktop of Nova Arlen: art direction, covers, key visuals and more. (Reconstruction with placeholder content.)",
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#ffffff" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
