// Mirror of src/fragments.ts (fixed prompt-fragment library; read-only copy for the console).
export const FRAGMENTS: { id: string; title: string; text: string }[] = [
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
export const fragment = (id: string) => FRAGMENTS.find((f) => f.id === id);
