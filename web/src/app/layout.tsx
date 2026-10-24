import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EcoCollect SJ | Municipal Waste Tracking & Administration",
  description: "Smart and Centralized Waste Collection, Tracking, and Scheduling System for San Jose de Buenavista, Antique",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#147D64",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 antialiased text-slate-800">
        {children}
      </body>
    </html>
  );
}
