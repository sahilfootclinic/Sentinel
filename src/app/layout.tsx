import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { TopBar } from "@/components/TopBar";
import { TabBar } from "@/components/TabBar";
import { SampleBanner } from "@/components/SampleBanner";
import { getSnapshot } from "@/lib/data/store";

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

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const snap = await getSnapshot();
  return (
    <html lang="en" className={`${inter.variable} ${jetbrains.variable} h-full antialiased`}>
      <body className="min-h-full font-sans bg-bg text-txt">
        <div className="mx-auto flex min-h-dvh max-w-md flex-col">
          <TopBar generatedAt={snap.meta.generatedAt} />
          {snap.meta.source === "sample" && <SampleBanner />}
          <main className="flex-1 px-4 pb-24 pt-4">{children}</main>
          <TabBar />
        </div>
      </body>
    </html>
  );
}
