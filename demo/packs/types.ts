// A task pack: everything task-specific the Waypoints harness needs. The harness keeps the protocol
// (resume-first, settings, checkpoints with settings_version, taps, reloads, required_tools enforcement).
import type { StructuredToolInterface } from "@langchain/core/tools";

export type Bearing = { name: string; current: number };
export type Counters = Record<string, number>;

export interface PackCtx {
  agent: string;
  objectiveId: () => string | null;
  settingsVersion: () => number | undefined;
  /** Call a Waypoints MCP tool; returns parsed JSON (or {error}). */
  call: (name: string, args: Record<string, unknown>) => Promise<any>;
  /** Discipline counters for the current settings version. */
  stat: () => Counters;
  fresh: boolean;
  maxSteps: number;
}

export interface TaskPack {
  name: "sales" | "invoice";
  objective: { objective: string; bearings: { name: string; target: number; unit: string; current?: number }[]; waypoints: { title: string; done_when: string }[]; end_state: { description: string; bearing: string; target: number }; task?: string };
  /** Tracked bearing (drop detection). */
  bearing: string;
  basePrompt: string;
  tools: StructuredToolInterface[];
  /** true graph-turn budget (invoice) vs max proposals (sales). */
  recursionLimit: number;
  /** After resume: print the baseline and return extra kickoff text for the model. */
  init(ctx: PackCtx, resumed: any): Promise<string>;
  /** A measurement happened and no checkpoint has been written for it yet (required_tools: checkpoint). */
  owed: boolean;
  /** Measured bearings to stamp on every checkpoint (never the model's claim). */
  measured(): Bearing[] | null;
  /** Checkpoint body the harness writes when the model skipped it. */
  autoCheckpoint(): { state_summary: string; open_threads: string[]; next_action: string; bearings_current: Bearing[] };
  /** One line describing the skipped measurement (for log_failure skipped_checkpoint). */
  skippedWhat(): string;
  endStateLine(e: { description?: string; bearing: string; target: number }): string;
  argSummary(name: string, a: Record<string, any>): string | null;
  resultSummary(name: string, raw: string): string | null;
  /** Called for every tool result in the stream (local or MCP). */
  onToolResult?(name: string, raw: string): void;
  /** Stop the loop now (end state or step budget). */
  stop(): boolean;
  /** Short model-text filter: return the line to print (or null to suppress). */
  thought(text: string): string | null;
  discipline(v: number, x: Counters): string;
  /** After the loop (e.g. probation verification). */
  afterRun?(doCheckpoint: (args: any) => Promise<string>, reload: (why: string) => Promise<unknown>, status: () => string, version: () => number): Promise<void>;
  finish(): { ok: boolean; line: string; extra?: string[] };
}
