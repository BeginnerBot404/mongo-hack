"use client";
// Top nav: keeps ?db= (and nothing else) across routes.
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export function Logo({ size = 30 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <circle cx="16" cy="16" r="13" fill="none" stroke="var(--brand)" strokeWidth="2" opacity="0.55" />
      <path d="M16 3.5 L19.2 16 L16 28.5 L12.8 16 Z" fill="var(--brand)" />
      <path d="M16 3.5 L19.2 16 L12.8 16 Z" fill="#fff" opacity="0.9" />
      <circle cx="16" cy="16" r="2.4" fill="var(--bg)" stroke="var(--brand)" strokeWidth="1.6" />
    </svg>
  );
}

export default function Nav() {
  const path = usePathname();
  const [q, setQ] = useState("");
  useEffect(() => {
    const d = new URLSearchParams(window.location.search).get("db");
    setQ(d ? `?db=${encodeURIComponent(d)}` : "");
  }, [path]);
  const items: [string, string][] = [
    ["/live", "Live"],
    ["/replay", "Replay"],
    ["/runs", "Runs"],
  ];
  const on = (h: string) => path === h || (h === "/live" && path === "/");
  return (
    <nav className="shell">
      <Link href={`/live${q}`} className="mark">
        <Logo />
        <span className="wordmark">Waypoints</span>
        <span className="product">Console</span>
      </Link>
      <span className="motto">change the route, never the destination</span>
      <div className="navlinks">
        {items.map(([h, l]) => (
          <Link key={h} href={`${h}${q}`} className={on(h) ? "on" : ""}>
            {l}
          </Link>
        ))}
      </div>
    </nav>
  );
}
