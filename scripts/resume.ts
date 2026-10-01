// bun run resume — continue the live run exactly where it paused (same batch series, playbook, bar, history).
// Starts the sentinel and the snapshot loop in the background (logs/), then runs the harness in the foreground.
// Never uses --fresh. Ctrl-C stops only the harness; use `bun run pause` to stop everything cleanly.
import { $ } from "bun";

const running = (await $`pgrep -f ${"demo/harness.ts|src/sentinel.ts"}`.nothrow().quiet().text()).trim();
if (running) {
  console.error(`already running (pids ${running.split("\n").join(", ")}) — run \`bun run pause\` first`);
  process.exit(1);
}

// Preflight: model server + console.
const gb10 = process.env.GB10_BASE_URL;
if (process.env.DEMO_PROVIDER === "gb10" && gb10) {
  const ok = await fetch(`${gb10.replace(/\/$/, "")}/models`, { signal: AbortSignal.timeout(5000) }).then((r) => r.ok).catch(() => false);
  if (!ok) {
    console.error("GB10 model server unreachable — check Tailscale / vLLM, then retry");
    process.exit(1);
  }
}
const consoleUp = await fetch("http://localhost:3100/api/alive", { signal: AbortSignal.timeout(3000) }).then((r) => r.ok).catch(() => false);
if (!consoleUp) console.warn("Console not running on :3100 — start it with: cd flight-recorder && bun run dev");

if (process.argv.includes("--check")) {
  console.log("✔ preflight ok · nothing started (--check)");
  process.exit(0);
}

const root = `${import.meta.dir}/..`;
const bg = (name: string, cmd: string[]) => {
  const log = Bun.file(`${root}/logs/${name}.log`);
  const p = Bun.spawn(cmd, { cwd: root, stdout: log, stderr: log, stdin: "ignore", env: process.env });
  p.unref();
  console.log(`▶ ${name} started (pid ${p.pid}) → logs/${name}.log`);
};
bg("sentinel", ["bun", "run", "src/sentinel.ts"]);
bg("snapshots", ["bun", "run", "scripts/snapshot-loop.ts"]);
await Bun.sleep(1500);

const workers = process.env.WORKERS ?? "3";
console.log(`▶ harness resuming · ${workers} workers · continuous\n`);
const h = Bun.spawn(["bun", "run", "demo/harness.ts", "--workers", workers, "--continuous"], { cwd: root, stdio: ["inherit", "inherit", "inherit"], env: process.env });
process.exit(await h.exited);
