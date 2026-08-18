import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ShopWires — SMS loyalty for local shops",
  description: "Turn one-time buyers into regulars with automated SMS campaigns.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/logo.svg",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
