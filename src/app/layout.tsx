import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const jetbrains = JetBrains_Mono({ variable: "--font-jetbrains", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Sentinel — institutional money flow",
  description:
    "Where institutional investors are moving money — 13F position shifts, insider buying clusters and short pressure, before the crowd arrives.",
};

export const viewport: Viewport = {
  themeColor: "#07070E",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrains.variable} h-full antialiased`}>
      <head>
        {/* Display font for the landing hero ("PODIUM Sharp" demo cut). */}
        <link
          rel="stylesheet"
          href="https://db.onlinewebfonts.com/c/8b75d9dcff6a48c35a46656192adf019?family=FSP+DEMO+-+PODIUM+Sharp+4.11"
        />
      </head>
      <body className="min-h-full font-sans bg-bg text-txt">{children}</body>
    </html>
  );
}
