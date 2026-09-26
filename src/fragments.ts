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

export const SETTINGS_FIELDS = ["prompt_fragments", "required_tools", "sentinel_threshold", "model"] as const;
export type SettingsField = (typeof SETTINGS_FIELDS)[number];

export interface HarnessSettings {
  prompt_fragments: FragmentId[];
  required_tools: AgentTool[];
  sentinel_threshold: number;
  model: HarnessModel;
}

export const SEED_SETTINGS: HarnessSettings = {
  prompt_fragments: ["checkpoint_every_test", "read_policies_first"],
  required_tools: ["checkpoint"],
  sentinel_threshold: 0.6,
  model: "z-ai/glm-5.3-flash",
};
