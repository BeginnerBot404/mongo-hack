// Snapshot the live DB every 2 minutes (read-only). Started by `bun run resume`, stopped by `bun run pause`.
import { $ } from "bun";
for (;;) {
  await $`bun ${process.env.HOME}/waypoints-backups/snapshot.ts`.nothrow();
  await Bun.sleep(120_000);
}
