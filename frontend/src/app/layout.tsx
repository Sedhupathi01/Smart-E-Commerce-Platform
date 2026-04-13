import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = {
  title: "Aura - Smart E-Commerce Platform",
  description: "Experience premium shopping with Aura. Fast, secure, and smart.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.variable} ${outfit.variable} font-sans bg-background text-foreground antialiased`}>
        <Navbar />
        <main className="min-h-screen">
          {children}
        </main>
        {/* Footer could go here */}
      </body>
    </html>
  );
}
