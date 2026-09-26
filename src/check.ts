// Smoke test: `bun run check`. Each service is checked independently.
import { db, llm, model, mongo, voyage } from "./clients";

async function step(name: string, fn: () => Promise<string>) {
  try {
    console.log(`✔ ${name}: ${await fn()}`);
  } catch (err) {
    console.log(`✘ ${name}: ${err instanceof Error ? err.message : String(err)}`);
  }
}

await step("MongoDB", async () => {
  await db.command({ ping: 1 });
  const collections = await db.listCollections({}, { nameOnly: true }).toArray();
  return `ping ok, db "${db.databaseName}" has ${collections.length} collection(s)`;
});

await step("OpenRouter", async () => {
  const res = await llm.chat.completions.create({
    model,
    max_tokens: 10,
    messages: [{ role: "user", content: "Reply with: ok" }],
  });
  const reply = res.choices[0]?.message?.content?.trim() ?? "";
  return `requested ${model}, router picked ${res.model}, replied "${reply}"`;
});

await step("Voyage", async () => {
  const res = await voyage.embed({ input: ["hello"], model: "voyage-3.5" });
  const dim = res.data?.[0]?.embedding?.length;
  if (!dim) throw new Error("no embedding returned");
  return `voyage-3.5 embedding dimension ${dim}`;
});

if (process.env.MONGODB_URI) await mongo.close();
