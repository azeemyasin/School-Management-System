// app/layout.tsx
import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import NoGrammarly from "@/components/no-grammarly";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "EduManage - School Management System",
  description: "Complete school management solution",
  generator: "v0.dev",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // Prevent hydration warnings if browser extensions mutate attributes
    <html lang="en" suppressHydrationWarning data-gramm="false">
      <body className={inter.className} suppressHydrationWarning data-gramm="false">
        {/* Ensure Grammarly doesn't attach to inputs/textareas after mount */}
        <NoGrammarly />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
