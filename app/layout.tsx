import type { ReactNode } from "react";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ResilientGuard - Real-time Disaster Dashboard",
  description: "High-end Disaster Management System",
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-zinc-950 text-white antialiased">
        {children}
      </body>
    </html>
  );
}