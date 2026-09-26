// ▶ Start run / ■ Stop from /live. Local dev only: requires ALLOW_RUN=1, refuses when a harness is already running.
import { execFile, spawn } from "node:child_process";
import path from "node:path";
import { dbParam } from "@/lib/mongo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const allowed = () => process.env.ALLOW_RUN === "1";
const running = () =>
  new Promise<boolean>((resolve) => execFile("pgrep", ["-f", "demo/harness.ts"], (_e, out) => resolve(String(out ?? "").trim().length > 0)));

export async function GET() {
  return Response.json({ allowed: allowed() }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  if (!allowed()) return Response.json({ ok: false, message: "runs disabled (ALLOW_RUN != 1)" }, { status: 403 });
  const { action } = (await request.json().catch(() => ({}))) as { action?: string };
  if (action === "stop") {
    await new Promise((r) => execFile("pkill", ["-TERM", "-f", "demo/harness.ts"], () => r(null)));
    return Response.json({ ok: true, message: "SIGTERM sent" });
  }
  if (action !== "start") return Response.json({ ok: false, message: "action must be start|stop" }, { status: 400 });
  if (await running()) return Response.json({ ok: false, message: "a harness is already running" }, { status: 409 });
  const db = dbParam(request);
  const env = { ...process.env, ...(db && /^waypoints(_\w{1,40})?$/.test(db) ? { WAYPOINTS_DB: db } : {}) };
  const child = spawn("bun", ["run", "harness", "--fresh"], { cwd: path.resolve(process.cwd(), ".."), env, detached: true, stdio: "ignore" });
  child.unref();
  return Response.json({ ok: true, message: `started pid ${child.pid}` });
}
