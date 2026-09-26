# Hackathon Stack Quick-Ref (bun + TS)

Verified 2026-09-26 against official docs + npm tarballs. Versions: `mongodb@7.6.0`, `openai@7.23.0`, `voyageai@0.4.0`,
`@langchain/langgraph@1.4.18`, `@langchain/openai@1.5.13`, `@langchain/langgraph-checkpoint-mongodb@1.4.1`, `@strands-agents/sdk@1.19.0`.
Anything marked **UNVERIFIED** was not confirmed in docs/source.
```bash
bun add mongodb openai voyageai @langchain/langgraph @langchain/openai @langchain/core @langchain/langgraph-checkpoint-mongodb zod
```

## 1. OpenRouter (via `openai` SDK)

Docs: https://openrouter.ai/docs/guides/routing/routers/auto-router · .../routers/fusion-router · .../routers/pareto-router ·
https://openrouter.ai/docs/guides/routing/model-fallbacks · https://openrouter.ai/docs/guides/routing/provider-selection ·
https://openrouter.ai/docs/guides/guides/usage-accounting · https://openrouter.ai/docs/api/api-reference/generations/get-request-&-usage-metadata-for-a-generation

| Model id | What it does | Per-request config (plugin id) |
|---|---|---|
| `openrouter/auto` | Picks a model per prompt. Router is free; you pay the chosen model's rate. Sticky across turns (by `session_id` or message fingerprint) while that model stays a top pick. | `auto-router`: `allowed_models`, `excluded_models` (wildcards like `anthropic/*`), `cost_tier`: `low` (default-ish) / `medium` / `high` / `xhigh` / `max` |
| `openrouter/auto-beta` | Early-access version of auto. Same features, beta quality. | **Plugin id must be `auto-beta-router`** |
| `openrouter/fusion` | A panel of 1–8 models answers in parallel (with web search/fetch), then a judge model combines them. About 4–5× the cost of one call with the default 3-model panel, and slow. | `fusion`: `preset` (e.g. `"general-fast"`), `analysis_models`, `model` (the judge), `max_tool_calls` (default 4) |
| `openrouter/pareto-code` | Picks a strong coding model that meets your minimum coding score. | `pareto-router`: `min_coding_score` (0–1) |

**Raw HTTP / `openai` SDK uses snake_case** (`allowed_models`). camelCase (`allowedModels`) is only for OpenRouter's own `@openrouter/sdk`.
```ts
import OpenAI from "openai";

export const or = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

// OpenRouter-only fields aren't in openai's types. Spread them in, since spreads skip TS excess-property checks.
const orExtra = {
  plugins: [{ id: "auto-router", allowed_models: ["anthropic/*", "openai/gpt-5*"], cost_tier: "medium" }],
  // session_id: "user-123",  // optional: keeps auto-router sticky for this conversation
};

const res = await or.chat.completions.create({
  model: "openrouter/auto",
  messages: [{ role: "user", content: "Summarize RAG in one line" }],
  ...orExtra,
});

console.log(res.model);          // <- the model that ACTUALLY answered, e.g. "anthropic/claude-sonnet-4.5"
console.log(res.id);             // generation id, e.g. "gen-..."
console.log(res.usage);          // prompt_tokens, completion_tokens, + OpenRouter extras below
console.log((res.usage as any).cost); // credits charged for this call
```
Fusion / Pareto:
```ts
await or.chat.completions.create({ model: "openrouter/fusion", messages, ...{ plugins: [{ id: "fusion", preset: "general-fast" }] } });
await or.chat.completions.create({ model: "openrouter/pareto-code", messages, ...{ plugins: [{ id: "pareto-router", min_coding_score: 0.8 }] } });
```
For Fusion, `res.model` is the model that produced the answer, not the alias. Check the generation stats' `router` field to confirm the call went through Fusion.

**Usage accounting:** full usage now comes back on every call. `usage: { include: true }` and `stream_options.include_usage` are deprecated and do nothing.
Extra `usage` fields: `cost`, `is_byok`, `prompt_tokens_details.{cached_tokens, cache_write_tokens, audio_tokens}`, `cost_details.upstream_inference_cost` (BYOK only).

**Generation stats endpoint** (after the call; use `res.id`):
```ts
const r = await fetch(`https://openrouter.ai/api/v1/generation?id=${res.id}`, {
  headers: { Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}` },
});
const { data } = await r.json();
// data.model, data.provider_name, data.router, data.total_cost, data.tokens_prompt, data.tokens_completion,
// data.native_tokens_prompt/completion/reasoning/cached, data.latency, data.generation_time, data.finish_reason
```
UNVERIFIED: stats may take a moment to show up right after the call. Retry on 404.

**Model fallbacks:** if the primary model errors, OpenRouter tries the next model in `models`. You're billed for the one that answered, and it's the one in `res.model`.
```ts
await or.chat.completions.create({
  model: "anthropic/claude-sonnet-4.5",
  messages,
  ...{ models: ["openai/gpt-5.1", "google/gemini-2.5-flash"] },
});
```
**Provider routing** (the `provider` object; same model, choose which host serves it):
```ts
...{ provider: {
  order: ["anthropic", "openai"],   // try these providers first, in order
  allow_fallbacks: true,            // default true
  only: [], ignore: [],             // allow / deny lists of provider slugs
  sort: "throughput",               // "price" | "throughput" | "latency"
  data_collection: "deny",          // skip providers that may store your data
  require_parameters: true,         // only providers that support every param you sent (e.g. tools)
  // max_price: { prompt: 1, completion: 2 }  // shape UNVERIFIED
} }
```
Shortcuts: `model: "x/y:nitro"` means fastest throughput. `:floor` means cheapest price.

## 2. MongoDB Atlas Vector Search (node driver)

Docs: https://www.mongodb.com/docs/vector-search/indexes/vector-search-type/ ·
https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage/ ·
https://www.mongodb.com/docs/vector-search/crud-embeddings/automated-embedding/ · .../automated-embedding/models/

### Classic index (you embed with Voyage yourself)

```ts
import { MongoClient } from "mongodb";
const client = new MongoClient(process.env.MONGODB_URI!);
const col = client.db("app").collection("docs");

await col.createSearchIndex({            // returns index name
  name: "vector_index",
  type: "vectorSearch",
  definition: {
    fields: [
      { type: "vector", path: "embedding", numDimensions: 1024, similarity: "cosine" }, // optional: quantization "scalar"|"binary", indexingMethod "hnsw"|"flat"
      { type: "filter", path: "category" },   // every field used in `filter` MUST be indexed as type "filter"
      { type: "filter", path: "year" },
    ],
  },
});

// Build is async. Poll until it's queryable before running queries (docs: "may take up to a minute").
async function waitForIndex(name: string) {
  for (;;) {
    const [idx] = await col.listSearchIndexes(name).toArray();
    if (idx?.queryable) return;          // also: idx.status === "READY"
    await Bun.sleep(5000);
  }
}
await waitForIndex("vector_index");

const results = await col.aggregate([
  {
    $vectorSearch: {
      index: "vector_index",
      path: "embedding",
      queryVector: qVec,                 // number[] from voyage (input_type "query")
      numCandidates: 100,                // recommended: >= 20x limit
      limit: 5,
      filter: { $and: [{ category: "news" }, { year: { $gte: 2020 } }] }, // $eq/$in/$gte/$lte/$and/$or... on "filter" fields
    },
  },
  { $project: { _id: 0, text: 1, score: { $meta: "vectorSearchScore" } } },
]).toArray();
```

### Automated Embedding (Atlas embeds text itself with Voyage). **Public Preview, not GA**

Index definition (the text field is typed `autoEmbed`, **not** `vector`; no `numDimensions` needed):
```ts
await col.createSearchIndex({
  name: "autoembed_index",
  type: "vectorSearch",
  definition: {
    fields: [
      { type: "autoEmbed", modality: "text", path: "text", model: "voyage-4" }, // optional: similarity, indexingMethod
      { type: "filter", path: "category" },
    ],
  },
});

// Query with raw text. Atlas embeds it.
await col.aggregate([
  { $vectorSearch: {
      index: "autoembed_index",
      path: "text",
      query: { text: "cheap flights to tokyo" },
      // model: "voyage-4-large",   // optional query-time model (docs example uses it; voyage-4 family shares one embedding space)
      numCandidates: 100, limit: 5,
      filter: { category: "travel" },
  } },
  { $project: { _id: 0, text: 1, score: { $meta: "vectorSearchScore" } } },
]).toArray();
```
- Models: `voyage-4-lite` ($0.02/1M tok), `voyage-4` (recommended, $0.06), `voyage-4-large` ($0.12), `voyage-code-4` ($0.12). 200M free tokens per model per org, one-time.
- **Does it work on a free/sandbox (M0) cluster?** Yes. The docs publish M0 rate limits, and the quick start tells you to create an M0. **But an M0 with no payment method is limited to 3 requests/min and 2,000 tokens/min per model, and that covers `$vectorSearch` queries too.** Add a payment method to the org (or use Flex/dedicated) to get 2,000 RPM and 3M–16M TPM. Dedicated M10+ must have storage auto-scaling enabled.
- Tip from the docs: **insert your data BEFORE creating the index.** The first build's embedding isn't rate-limited; later inserts and updates are.
- Preview only, so the syntax may change. Not for production.

### Gotchas
- Index limits: **3 search+vector indexes total on M0 (free)**, 10 on Flex.
- A new index isn't queryable right away. Querying too early returns empty results or errors, so poll `listSearchIndexes` for `queryable`.
- Search indexes sync asynchronously (via `mongot`), so a doc you just inserted may not show up in results for a few seconds. UNVERIFIED exact lag.
- Editing an index rebuilds it. Queries keep using the old definition until the rebuild finishes.
- `$vectorSearch` must be the **first** pipeline stage. It can't go inside `$lookup` sub-pipelines or `$facet`.
- The LangGraph Mongo checkpointer depends on `mongodb@^6.21`. With `mongodb@7` you may get TS type mismatches on `MongoClient`. Cast it, or pin `mongodb@6`. UNVERIFIED whether it actually breaks.

## 3. Voyage (`voyageai` npm)

Docs: https://docs.voyageai.com/docs/embeddings · https://docs.voyageai.com/docs/reranker · https://www.mongodb.com/docs/voyageai/management/api-keys/

| Embedding model | Default dim | Allowed `outputDimension` | Context |
|---|---|---|---|
| `voyage-4-large` / `voyage-4` / `voyage-4-lite` | 1024 | 256, 512, 1024, 2048 | 32k |
| `voyage-code-4` | 1024 | 256, 512, 1024, 2048 | 32k |

All voyage-4 embeddings are compatible with each other, e.g. index with `voyage-4-large` and query with `voyage-4-lite`.
Rerankers: `rerank-2.5`, `rerank-2.5-lite` (GA); `rerank-3`, `rerank-3-lite` (preview). All have 32k context.
```ts
import { VoyageAIClient } from "voyageai";
const voyage = new VoyageAIClient({ apiKey: process.env.VOYAGE_API_KEY });
// Key made in the Atlas UI instead of dashboard.voyageai.com? Those keys call ai.mongodb.com, so set
// baseUrl: "https://ai.mongodb.com/v1"   // client option exists; exact path UNVERIFIED

const docs = await voyage.embed({
  input: ["doc one", "doc two"],       // up to 128 texts per call
  model: "voyage-4",
  inputType: "document",               // SDK uses camelCase: inputType, outputDimension, outputDtype
  // outputDimension: 1024,
});
const docVecs = docs.data!.map((d) => d.embedding!);   // number[][]; docs.usage?.totalTokens

const q = await voyage.embed({ input: "user question", model: "voyage-4", inputType: "query" });
const qVec = q.data![0].embedding!;

const rr = await voyage.rerank({
  query: "user question",
  documents: ["doc one", "doc two"],
  model: "rerank-2.5",
  topK: 3,
  returnDocuments: true,
});
rr.data!.forEach((r) => console.log(r.index, r.relevanceScore, r.document));
```
`inputType` adds a hidden prefix to each input: "Represent the query for retrieving supporting documents: " or "Represent the document for retrieval: ". **Always use `query` for searches and `document` for stored text.**
Match `numDimensions` in the Mongo index to `outputDimension` (1024 by default).

## 4. LangGraph.js + OpenRouter + Mongo checkpointer + LangSmith

Docs: https://docs.langchain.com/oss/javascript/langgraph/quickstart · https://docs.langchain.com/oss/javascript/integrations/chat/openai ·
https://www.npmjs.com/package/@langchain/langgraph-checkpoint-mongodb · https://docs.langchain.com/langsmith/trace-with-langgraph
```ts
import { ChatOpenAI } from "@langchain/openai";
import { tool } from "@langchain/core/tools";
import { HumanMessage } from "@langchain/core/messages";
import { StateGraph, MessagesAnnotation, START, END } from "@langchain/langgraph";
import { ToolNode, toolsCondition } from "@langchain/langgraph/prebuilt";
import { MongoDBSaver } from "@langchain/langgraph-checkpoint-mongodb";
import { MongoClient } from "mongodb";
import * as z from "zod";

const llm = new ChatOpenAI({
  model: "openrouter/auto",            // or any OpenRouter slug, e.g. "anthropic/claude-sonnet-4.5"
  apiKey: process.env.OPENROUTER_API_KEY,
  configuration: { baseURL: "https://openrouter.ai/api/v1" },
  // modelKwargs: { plugins: [...] }  // pass OpenRouter extras. UNVERIFIED that these pass through unchanged
});

const search = tool(async ({ q }) => `results for ${q}`, {
  name: "search",
  description: "Search the knowledge base",
  schema: z.object({ q: z.string() }),
});
const tools = [search];
const model = llm.bindTools(tools);

const graph = new StateGraph(MessagesAnnotation)
  .addNode("agent", async (s) => ({ messages: [await model.invoke(s.messages)] }))
  .addNode("tools", new ToolNode(tools))
  .addEdge(START, "agent")
  .addConditionalEdges("agent", toolsCondition, ["tools", END])  // goes to "tools" if the reply has tool_calls, else END
  .addEdge("tools", "agent");

const mongo = new MongoClient(process.env.MONGODB_URI!);
const checkpointer = new MongoDBSaver({ client: mongo, dbName: "agent" }); // also: checkpointCollectionName ("checkpoints"),
await checkpointer.setup();                                               //   checkpointWritesCollectionName, ttl (seconds)
const app = graph.compile({ checkpointer });

const out = await app.invoke(
  { messages: [new HumanMessage("search for vector db news")] },
  { configurable: { thread_id: "user-1" } },     // thread_id is required when a checkpointer is set
);
const last = out.messages.at(-1)!;
console.log(last.text, last.response_metadata?.model_name); // model_name = model OpenRouter actually used (UNVERIFIED mapping)
```
- The official quickstart now uses `StateSchema` + `MessagesValue` + `GraphNode`. `MessagesAnnotation` (above) is still exported and is shorter.
- Alternative: `@langchain/openrouter` (v0.4.13) has a native `ChatOpenRouter({ model })` that reads `OPENROUTER_API_KEY`. Not tested here.
- Also exported: `MongoDBStore` (long-term memory store) from the same checkpointer package.

LangSmith tracing (just env vars, no code):
```bash
LANGSMITH_TRACING=true
LANGSMITH_API_KEY=lsv2_...
LANGSMITH_PROJECT=hackathon          # optional
LANGCHAIN_CALLBACKS_BACKGROUND=true  # long-running server; set false for serverless
# LANGSMITH_ENDPOINT=...             # only for non-US region, no trailing slash
```

## 5. AWS Strands Agents: TypeScript?

Docs: https://www.npmjs.com/package/@strands-agents/sdk · https://strandsagents.com

**Yes.** `@strands-agents/sdk` is the official TS SDK (v1.19.0, first published Nov 2025, needs Node 22+). It's a model-agnostic agent loop:
`new Agent({ model, tools, systemPrompt })`, with multi-agent `Graph`/`Swarm`. Model providers: Bedrock (the default, needs AWS creds),
OpenAI, Anthropic, Google, and Vercel AI SDK. **OpenRouter should work** through `OpenAIModel({ api: "chat", modelId, apiKey, clientConfig: { baseURL: "https://openrouter.ai/api/v1" } })`.
`clientConfig` is the OpenAI SDK's `ClientOptions`; I confirmed that in the typings but didn't make a live call (UNVERIFIED end to end).
I found no MongoDB checkpointer in the README. **Verdict: skip.** LangGraph already covers the agent loop plus Mongo persistence plus LangSmith. Only use Strands if a sponsor/judge requires AWS or Bedrock.
```ts
import { Agent } from "@strands-agents/sdk";
import { OpenAIModel } from "@strands-agents/sdk/models/openai";
const agent = new Agent({ model: new OpenAIModel({ api: "chat", modelId: "openrouter/auto",
  apiKey: process.env.OPENROUTER_API_KEY, clientConfig: { baseURL: "https://openrouter.ai/api/v1" } }) });
console.log(await agent.invoke("hi"));
```
