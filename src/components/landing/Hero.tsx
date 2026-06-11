"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Award, Bitcoin, X } from "lucide-react";

const NAV_LINKS = [
  { label: "Heatmap", href: "/dashboard" },
  { label: "Funds", href: "/funds" },
  { label: "Search", href: "/search" },
  { label: "Methodology", href: "/about" },
] as const;

const STATS = [
  { value: "25+", label: "Funds Tracked" },
  { value: "11", label: "Sectors Mapped" },
  { value: "3", label: "Signal Sources" },
] as const;

export function Hero() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <section className="hero-bg relative h-dvh w-full">
      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-5 sm:px-10 lg:px-16 lg:py-7">
        <Link
          href="/"
          className="font-podium text-2xl font-bold uppercase tracking-wider text-white sm:text-3xl"
        >
          SENTINEL
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="font-inter text-sm uppercase tracking-widest text-white/80 transition-colors hover:text-white"
            >
              {l.label}
            </Link>
          ))}
        </div>

        <Link
          href="/dashboard"
          className="hidden items-center gap-2 border border-white/30 px-6 py-3 text-xs uppercase tracking-widest text-white transition-colors hover:border-white/60 hover:bg-white/10 md:flex"
        >
          Launch App
          <ArrowUpRight className="h-4 w-4" />
        </Link>

        <button
          type="button"
          aria-label="Open menu"
          onClick={() => setMenuOpen(true)}
          className="space-y-1.5 md:hidden"
        >
          <div className="h-0.5 w-6 bg-white" />
          <div className="h-0.5 w-6 bg-white" />
          <div className="h-0.5 w-4 bg-white" />
        </button>
      </nav>

      {/* Mobile menu overlay */}
      <div
        className={`fixed inset-0 z-50 bg-black/95 backdrop-blur-sm transition-all duration-500 md:hidden ${
          menuOpen ? "visible opacity-100" : "invisible opacity-0"
        }`}
      >
        <div className="flex items-center justify-between px-6 py-5 sm:px-10">
          <span className="font-podium text-2xl font-bold uppercase tracking-wider text-white sm:text-3xl">
            SENTINEL
          </span>
          <button type="button" aria-label="Close menu" onClick={() => setMenuOpen(false)}>
            <X className="h-7 w-7 text-white" />
          </button>
        </div>
        <div className="flex h-[70%] flex-col items-center justify-center gap-8">
          {NAV_LINKS.map((l, i) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setMenuOpen(false)}
              className="font-podium text-4xl uppercase text-white sm:text-5xl"
              style={{
                transition: "opacity 0.5s ease, transform 0.5s ease",
                transitionDelay: `${i * 80 + 100}ms`,
                opacity: menuOpen ? 1 : 0,
                transform: menuOpen ? "translateY(0)" : "translateY(20px)",
              }}
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/dashboard"
            onClick={() => setMenuOpen(false)}
            className="mt-4 flex items-center gap-2 border border-white/30 px-6 py-3 text-xs uppercase tracking-widest text-white"
            style={{
              transition: "opacity 0.5s ease, transform 0.5s ease",
              transitionDelay: `${NAV_LINKS.length * 80 + 100}ms`,
              opacity: menuOpen ? 1 : 0,
              transform: menuOpen ? "translateY(0)" : "translateY(20px)",
            }}
          >
            Launch App
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Hero content */}
      <div className="relative z-10 flex h-[calc(100dvh-88px)] flex-col justify-center px-6 sm:px-10 lg:px-16">
        <div className="animate-fade-up mb-6 flex items-center gap-2 lg:mb-8">
          <Bitcoin className="h-4 w-4 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.7)]" />
          <span className="font-inter text-xs uppercase tracking-[0.3em] text-white/70 sm:text-sm">
            Institutional Money-Flow Intelligence
          </span>
        </div>

        <h1 className="animate-fade-up-delay-1 font-podium uppercase leading-[0.92] tracking-tight text-white">
          <span className="block text-[clamp(2.8rem,8vw,7rem)]">Follow.</span>
          <span className="block text-[clamp(2.8rem,8vw,7rem)]">The.</span>
          <span className="block text-[clamp(2.8rem,8vw,7rem)]">Money.</span>
        </h1>

        <p className="animate-fade-up-delay-2 mt-6 max-w-md font-inter text-sm leading-relaxed text-white/70 sm:text-base lg:mt-8">
          We surface institutional position shifts
          <br />
          before the crowd piles in — <span className="font-bold text-white">you see it first.</span>
        </p>

        <div className="animate-fade-up-delay-3 mt-8 flex flex-wrap items-center gap-4 sm:gap-6 lg:mt-10">
          <Link
            href="/dashboard"
            className="group flex items-center gap-2 bg-black px-5 py-3 text-[11px] uppercase tracking-widest text-white transition-colors hover:bg-neutral-900 sm:px-7 sm:py-4 sm:text-xs"
          >
            See The Flows
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
          <div className="hidden items-center gap-3 sm:flex">
            <Award className="h-8 w-8 text-white/50" />
            <div className="font-inter text-xs uppercase tracking-wider text-white/60">
              <p>SEC-Sourced</p>
              <p>Public Filings Data</p>
            </div>
          </div>
        </div>

        <div className="animate-fade-up-delay-4 mt-8 flex flex-wrap gap-6 sm:mt-10 sm:gap-12 lg:mt-14 lg:gap-16">
          {STATS.map((s) => (
            <div key={s.label}>
              <p className="font-inter text-2xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
                {s.value}
              </p>
              <p className="mt-1 text-[9px] uppercase tracking-widest text-white/50 sm:text-xs">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
