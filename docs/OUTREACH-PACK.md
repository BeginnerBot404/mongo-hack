# Outreach task pack (15:25): an SDR agent that rebuilds its own harness

Final demo task. It **replaces the sales rubric as the default** (`--task sales` and `--task invoice` stay as they are). Focus: **statement 1, Recursive Harnessing**. The harness changes its own **rules, context policy, guardrails, tool access and reasoning mode** in response to failures on real work, each change gated, on trial, then kept or rolled back. Statement 2: a long work queue driven toward a measured goal. **The kill/resume beat is NOT part of the demo.**
Model: **GB10 only** (`DEMO_PROVIDER=gb10`, vLLM `glm53-flash`, about 30 tok/s, no key). **Never OpenRouter** for the harness. The sentinel's Jev advisor stays OFF.
Deadlines: code by **16:15**, a recorded run by **16:35**.

## Queue data (loaded by `bun run load:accounts`, idempotent)
- **Source:** Maven CRM `accounts.csv`, 85 accounts (public domain). Copy it to `data/accounts.csv` from the scratchpad `sales-data/`, and add attribution to `data/README.md`. Also copy `products.csv`.
- **Atlas** `waypoints.accounts`: `{ account, sector (fix typo "technolgy"), year_established, revenue_musd, employees, office_location, subsidiary_of, queue_index, status: "pending"|"done" }`.
- **The seller:** a fictional vendor selling the 7 products in `products.csv` (GTX/MG series hardware). The product list and prices go in the base prompt.

## The deterministic QA gate (`src/outreach/qa.ts`, no LLM)
`qa(draft: {subject, body}, account) → { pass: boolean, failures: {class, detail}[] }`. Classes:
- `invented-fact`: any number in the body (digits, `$`, `%`, `M`) that doesn't match a value in the account record or the product prices (allow ±1% and normal formatting), **or** a named location, year or parent company that isn't in the record.
- `missing-personalization`: the first sentence doesn't mention at least one of the account name, sector, office_location, or a record fact.
- `forbidden-promise`: /free|guarantee|no risk|discount|\d+% off|best price/i
- `placeholder-left`: /\[[^\]]+\]|\{[^}]+\}|<[^>]+>|lorem/i
- `too-long`: body over 120 words
- `missing-cta`: no question mark in the last 2 sentences, and no /call|chat|meet|demo|15 minutes|time/i
- `missing-subject`: empty subject, or subject over 60 characters

## Harness settings (`harness_config.settings`): add 3 fields to the existing 4 (validator + gate + enums)
- `context_sources`: subset of `["account_name", "account_summary", "account_record_full", "product_catalog"]`. **The seed is `["account_name", "product_catalog"]`**: lean on purpose, so the agent invents facts until the harness changes its own context policy.
- `granted_tools`: subset of `["outline_email", "precheck_email", "lookup_account"]`. The seed is `[]`. The harness exposes only the granted tools to the model.
- `reasoning`: `"off" | "on"`. The seed is `"off"`. It maps to vLLM `chat_template_kwargs: { enable_thinking: bool }`, and is the stand-in for a model change.
- Existing `required_tools`: can now include `precheck_email`, which the harness **enforces**: `submit_email` is refused (and logged) unless `precheck_email` was called on that exact draft.
- **Seed v1:** fragments `["read_policies_first"]`, required_tools `["checkpoint"]`, threshold 0.25, model `"gb10"`, context_sources as above, granted_tools `[]`, reasoning `"off"`.
- **The gate can never touch** the QA gate, the queue, the end state or the objective. The validator allows only these 7 settings fields.

## Task tools (`src/outreach/tools.ts`; the harness wraps them as local tools)
- `next_account({objective_id})` → the next pending account. **The harness builds its content from `context_sources`**: `account_name` gives just the name, `account_summary` adds sector and size band, `account_record_full` gives every field.
- `lookup_account({account})`, **only if granted** → the full record.
- `outline_email({account})`, **only if granted** → a deterministic 3-line skeleton: hook from a record fact, value from the matching product, CTA question.
- `precheck_email({subject, body, account})`, **only if granted or required** → runs `qa()` and returns the failures without submitting.
- `submit_email({objective_id, account, subject, body, agent})` → runs `qa()`. It saves the draft to `waypoints.drafts` as `{account, subject, body, qa: {pass, failures}, settings_version, attempt, agent, created_at}`. On pass the account is marked done. On fail the agent gets **one** retry for that account, and after two fails the account is marked done with `status: "failed"`. Returns the QA result.

## Bearings, end state, loop
- **Bearings:**
  - `qa_pass_rate`: rolling pass rate over the last 10 submissions, as a %
  - `accounts_done` (count, target = queue size)
- **End state (locked):** every account done **and** the whole-queue first-try pass rate is at least **80%**.
- **Demo queue size:** env `QUEUE_SIZE`, default **24** (GB10 is slow). Load all 85, but only the first `QUEUE_SIZE` by `queue_index` are pending.
- **Loop per account:** `next_account` → (granted tools) → `submit_email` → the harness **checkpoints after every submit** with bearings (it writes the checkpoint itself if the model skips it, and logs `skipped-checkpoint`) → on QA failure the **harness** calls `log_failure` once per failure class, with the detail as context.

## Sentinel: failure class → architectural change (deterministic, one probation at a time, queue the rest)
| Class | Change applied through the surgeon | Axis |
|---|---|---|
| missing-personalization | prompt_fragments + `open_with_record_fact` | rules |
| invented-fact | context_sources + `account_record_full` | context policy |
| forbidden-promise, placeholder-left | granted_tools + `precheck_email` **and** required_tools + `precheck_email` (one version) | guardrail |
| too-long, missing-cta, missing-subject | granted_tools + `outline_email` | tool access |
| stall (pass rate flat for 4 checkpoints) or the same class recurring after its fix was kept | reasoning `off → on` | reasoning mode |
| skipped-checkpoint, regression | as today | |

- **Probation:** 3 checkpoints. It's kept if the watched class's rate went down and the pass rate didn't drop; otherwise it's rolled back.
- **Verdict text** has before and after rates, e.g. "invented-fact: 5 in 8 drafts → 0 in 3; pass rate 38% → 67%. Kept."
- **New fragments:**
  - `open_with_record_fact`: "Open with one specific fact from the account record, stated exactly as written."
  - `plain_cta`: "End with one short question asking for a 15-minute call."

## Views
- **The rubric pane becomes a drafts pane** (`view:drafts`): the latest draft (subject + body), the QA verdict with failure classes in red, the running pass rate, and the settings version it was written under.
- **`view:prompt`** also shows the **tools the model can see**, the **context sources** and the **reasoning mode**, with diffs when they change. That's the "harness changing shape" pane.
- **The flight recorder story boxes:**
  1. the work: queue progress and pass rate
  2. what went wrong: the QA failure in words
  3. what the harness changed about itself, naming the axis ("gave itself a pre-send check tool — guardrail")
  4. did it work: before/after rate, kept or undone
