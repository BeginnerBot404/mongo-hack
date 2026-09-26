// Is a harness process running on this machine? kill -9 makes this false instantly (the CRASHED banner).
import { execFile } from "node:child_process";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const alive = await new Promise<boolean | null>((resolve) => {
    execFile("pgrep", ["-f", "demo/harness.ts"], (err, stdout) => {
      if (err && (err as NodeJS.ErrnoException).code === "ENOENT") return resolve(null);
      resolve(stdout.trim().length > 0);
    });
  });
  return Response.json({ alive, at: Date.now() }, { headers: { "Cache-Control": "no-store" } });
}
