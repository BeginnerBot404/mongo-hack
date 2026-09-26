// Fixed prompt-fragment library. The model never writes prompt text: harness_config only
// selects fragment ids from this list. The harness (demo/) imports this read-only.

export interface Fragment {
  id: FragmentId;
  title: string;
  text: string;
}

export const FRAGMENT_IDS = [
  "checkpoint_every_test",
  "recall_before_edit",
  "verify_whole_suite",
  "one_change_per_edit",
  "read_policies_first",
  // sales task (docs/SALES-PACK.md)
  "min_support_15",
  "one_change_per_iteration",
  "checkpoint_every_eval",
  "check_schema_first",
  // outreach task (docs/OUTREACH-PACK.md)
  "open_with_record_fact",
  "plain_cta",
] as const;
export type FragmentId = (typeof FRAGMENT_IDS)[number];

export const FRAGMENTS: readonly Fragment[] = [
  {
    id: "checkpoint_every_test",
    title: "Checkpoint after every test run",
    text: "Call the checkpoint tool right after every test run, with the current pass count as the bearing value.",
  },
  {
    id: "recall_before_edit",
    title: "Recall before editing",
    text: "Before editing code, call recall for the failure class you are about to fix and read what happened last time.",
  },
  {
    id: "verify_whole_suite",
    title: "Verify the whole suite after a fix",
    text:
      "After a fix, run the whole test suite and compare the pass count with the previous run. " +
      "If any previously passing test now fails, revert or fix it before moving on.",
  },
  {
    id: "one_change_per_edit",
    title: "One bug per edit",
    text: "Fix one bug per edit. Do not bundle unrelated changes into a single edit.",
  },
  {
    id: "read_policies_first",
    title: "Restate policies first",
    text: "Before your first edit, restate the active policies from resume in one line each.",
  },
  {
    id: "min_support_15",
    title: "Only well-supported segments",
    text: "Only add a rule for a value with at least 15 train deals; check segment_stats first.",
  },
  {
    id: "one_change_per_iteration",
    title: "One rule change per proposal",
    text: "Change exactly one rule per proposal, so each change's effect is measurable.",
  },
  {
    id: "checkpoint_every_eval",
    title: "Checkpoint after every evaluation",
    text: "Checkpoint immediately after every propose_rubric, before anything else.",
  },
  {
    id: "check_schema_first",
    title: "Check the schema first",
    text: "Call describe_data before proposing; use only listed fields and values.",
  },
  {
    id: "open_with_record_fact",
    title: "Open with a record fact",
    text: "Open with one specific fact from the account record, stated exactly as written.",
  },
  {
    id: "plain_cta",
    title: "Plain call to action",
    text: "End with one short question asking for a 15-minute call.",
  },
];

export function getFragments(ids: readonly string[]): Fragment[] {
  return ids.map((id) => FRAGMENTS.find((f) => f.id === id)).filter((f): f is Fragment => f !== undefined);
}

export const MODELS = ["z-ai/glm-5.3-flash", "anthropic/claude-sonnet-5", "openai/gpt-5.5", "gb10"] as const;
export type HarnessModel = (typeof MODELS)[number];

/** Tool names the agent role exposes; required_tools must be a subset. */
export const AGENT_TOOLS = [
  "set_objective",
  "checkpoint",
  "resume",
  "log_decision",
  "log_failure",
  "recall",
  "get_settings",
  "list_policies",
] as const;
export type AgentTool = (typeof AGENT_TOOLS)[number];

/** required_tools may also name task tools the harness enforces (outreach: submit_email is refused unless precheck_email ran on that draft). */
export const REQUIRABLE_TOOLS = [...AGENT_TOOLS, "precheck_email"] as const;
export type RequirableTool = (typeof REQUIRABLE_TOOLS)[number];

/** Outreach context policy: what next_account shows the model (src/outreach/tools.ts accountView). Other tasks ignore it. */
export const CONTEXT_SOURCES = ["account_name", "account_summary", "account_record_full", "product_catalog"] as const;
export type ContextSource = (typeof CONTEXT_SOURCES)[number];
/** Outreach tool access: task tools the harness exposes to the model only when granted. Other tasks ignore it. */
export const GRANTABLE_TOOLS = ["outline_email", "precheck_email", "lookup_account"] as const;
export type GrantableTool = (typeof GRANTABLE_TOOLS)[number];
/** Reasoning mode → vLLM chat_template_kwargs.enable_thinking. */
export const REASONING_MODES = ["off", "on"] as const;
export type ReasoningMode = (typeof REASONING_MODES)[number];

export const SETTINGS_FIELDS = [
  "prompt_fragments",
  "required_tools",
  "sentinel_threshold",
  "model",
  "context_sources",
  "granted_tools",
  "reasoning",
] as const;
export type SettingsField = (typeof SETTINGS_FIELDS)[number];

export interface HarnessSettings {
  prompt_fragments: FragmentId[];
  required_tools: RequirableTool[];
  sentinel_threshold: number;
  model: HarnessModel;
  context_sources: ContextSource[];
  granted_tools: GrantableTool[];
  reasoning: ReasoningMode;
}

export const SEED_SETTINGS: HarnessSettings = {
  prompt_fragments: ["read_policies_first"], // lean: the sentinel adds fragments when the harness misbehaves
  required_tools: ["checkpoint"],
  sentinel_threshold: 0.25, // a lone regression (trend weight 0.3) must tap; similarity + recurrence raise it further
  model: "gb10", // outreach demo runs on GB10 only (docs/OUTREACH-PACK.md)
  context_sources: ["account_name", "product_catalog"], // lean on purpose: the agent invents facts until the harness widens it
  granted_tools: [],
  reasoning: "off",
};
