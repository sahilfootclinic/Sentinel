export function SampleBanner() {
  return (
    <div className="border-b border-violet/40 bg-violet/10 px-4 py-2 text-center">
      <p className="font-mono text-[0.65rem] uppercase tracking-widest text-violet-300">
        Sample data — run <span className="text-txt">npm run seed</span> to load live EDGAR
        filings
      </p>
    </div>
  );
}
