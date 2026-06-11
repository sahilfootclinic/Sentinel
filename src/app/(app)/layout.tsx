import { TopBar } from "@/components/TopBar";
import { TabBar } from "@/components/TabBar";
import { SampleBanner } from "@/components/SampleBanner";
import { getSnapshot } from "@/lib/data/store";

/** Phone-column chrome for the app screens; the landing page at / opts out. */
export default async function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const snap = await getSnapshot();
  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col">
      <TopBar generatedAt={snap.meta.generatedAt} />
      {snap.meta.source === "sample" && <SampleBanner />}
      <main className="flex-1 px-4 pb-24 pt-4">{children}</main>
      <TabBar />
    </div>
  );
}
