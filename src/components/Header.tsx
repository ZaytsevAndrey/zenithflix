"use client";

import { useState, useCallback } from "react";
import Link from "next/link";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/#trending", label: "Trending" },
  { href: "/#for-you", label: "For You" },
  { href: "/#new-releases", label: "New Releases" },
  { href: "/#watch-history", label: "Watch History" },
];

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between border-b border-zinc-800 bg-zinc-950 px-4 py-3 md:px-8">
      <Link href="/" className="flex items-center">
        <span className="text-xl font-bold tracking-tight text-red-600">
          ZenithFlix
        </span>
      </Link>

      <nav className="hidden gap-6 text-sm text-zinc-300 md:flex">
        {navLinks.map(({ href, label }) => (
          <Link key={href} href={href} className="hover:text-white">
            {label}
          </Link>
        ))}
      </nav>

      <div className="flex items-center md:hidden">
        <button
          type="button"
          className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg border border-zinc-700 bg-zinc-800/80 text-white transition-colors hover:border-zinc-500 hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-zinc-950"
          onClick={() => setMenuOpen((o) => !o)}
          aria-expanded={menuOpen}
          aria-label="Menu"
        >
          <svg
            className="h-5 w-5 shrink-0"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden
          >
            {menuOpen ? (
              <path d="M18 6L6 18M6 6l12 12" />
            ) : (
              <>
                <path d="M4 6h16M4 12h16M4 18h16" />
              </>
            )}
          </svg>
        </button>
      </div>

      {menuOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/60 md:hidden"
            aria-hidden
            onClick={closeMenu}
          />
          <nav
            className="fixed right-0 top-0 z-50 flex h-full w-64 flex-col gap-1 border-l border-zinc-800 bg-zinc-900 p-4 pt-14 md:hidden"
            role="dialog"
            aria-label="Navigation menu"
          >
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="rounded-lg px-3 py-2 text-sm text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-white focus:bg-zinc-800 focus:text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-inset"
                onClick={closeMenu}
              >
                {label}
              </Link>
            ))}
          </nav>
        </>
      )}
    </header>
  );
}
