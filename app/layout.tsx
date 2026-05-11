import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ylang Guest Vault",
  description: "Luxury hospitality guest intelligence and relationship platform",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="font-sans">
      <body>{children}</body>
    </html>
  );
}
