import type { ReactNode } from "react";
import "./globals.css";
import "./console.css";
import Nav from "./Nav";

export const metadata = { title: "Waypoints Console", icons: { icon: "/icon.svg" } };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Nav />
        {children}
      </body>
    </html>
  );
}
