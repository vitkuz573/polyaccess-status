import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "PolyAccess Status",
  description: "Real-time status of PolyAccess products and services.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <div id="public-root" className="contents">
          {children}
        </div>
        <Toaster />
      </body>
    </html>
  );
}
