import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "StationFlow",
  description: "Vaktplan og stasjonsdrift for bensinstasjoner"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="no">
      <body>{children}</body>
    </html>
  );
}
