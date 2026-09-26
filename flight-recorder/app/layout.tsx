import type { ReactNode } from "react";
import "./globals.css";
import "./console.css";
import Nav from "./Nav";

export const metadata = { title: "Waypoints Console", icons: { icon: "/icon.svg" } };

// Light by default (projector); the nav toggle stores "dark" per viewer.
const THEME = `try{var t=localStorage.getItem("wp-theme");if(t==="dark")document.documentElement.dataset.theme="dark"}catch(e){}`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet" />
        <script dangerouslySetInnerHTML={{ __html: THEME }} />
      </head>
      <body>
        <Nav />
        {children}
      </body>
    </html>
  );
}
