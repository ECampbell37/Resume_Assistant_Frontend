// app/layout.tsx

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import NavBar from "@/components/NavBar";
import { Providers } from './providers';

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Resume Assistant",
  description: "AI-powered resume feedback and job matching",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#0b0f14] text-white font-sans transition-colors duration-300`}
      >
        <Providers>
          <NavBar />
          <main className="pt-12 min-h-screen">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
