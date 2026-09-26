// stdout is the MCP channel. All logging goes to stderr.
export function log(...args: unknown[]): void {
  console.error("[waypoints]", ...args);
}
