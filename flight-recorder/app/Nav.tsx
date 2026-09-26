"use client";
// Top nav: keeps ?db= (and nothing else) across routes.
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export function Logo({ size = 30 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <circle cx="16" cy="16" r="13" fill="none" stroke="var(--fg)" strokeWidth="1.5" opacity="0.35" />
      <path d="M16 3.5 L19.2 16 L16 28.5 L12.8 16 Z" fill="var(--brand)" />
      <path d="M16 28.5 L19.2 16 L12.8 16 Z" fill="var(--fg)" opacity="0.8" />
      <circle cx="16" cy="16" r="2.4" fill="var(--panel)" stroke="var(--fg)" strokeWidth="1.4" />
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
    ["/runs", "Runs"],
    ["/playbook", "Playbook"],
    ["/replay", "Replay"],
  ];
  const [dark, setDark] = useState(false);
  useEffect(() => setDark(document.documentElement.dataset.theme === "dark"), []);
  const flip = () => {
    const next = !dark;
    setDark(next);
    if (next) document.documentElement.dataset.theme = "dark";
    else delete document.documentElement.dataset.theme;
    try {
      localStorage.setItem("wp-theme", next ? "dark" : "light");
    } catch {}
  };
  const on = (h: string) => path === h || (h !== "/live" && path.startsWith(h + "/")) || (h === "/live" && path === "/");
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
        <button className="themetoggle" onClick={flip} title="toggle theme">
          {dark ? "light" : "dark"}
        </button>
      </div>
    </nav>
  );
}
