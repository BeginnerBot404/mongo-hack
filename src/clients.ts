import { MongoClient } from "mongodb";
import OpenAI from "openai";
import { VoyageAIClient } from "voyageai";

// Bun auto-loads .env. A missing var doesn't crash on import; the client
// throws a clear error the first time it's used.
function missing<T extends object>(name: string): T {
  const fail = () => {
    throw new Error(`${name} is not set: copy .env.example to .env and fill it in`);
  };
  return new Proxy({} as T, { get: fail, apply: fail });
}

const env = process.env;

export const mongo: MongoClient = env.MONGODB_URI
  ? new MongoClient(env.MONGODB_URI)
  : missing<MongoClient>("MONGODB_URI");

export const db = env.MONGODB_URI
  ? mongo.db(env.MONGODB_DB || "hack")
  : missing<ReturnType<MongoClient["db"]>>("MONGODB_URI");

export const llm: OpenAI = env.OPENROUTER_API_KEY
  ? new OpenAI({ baseURL: "https://openrouter.ai/api/v1", apiKey: env.OPENROUTER_API_KEY })
  : missing<OpenAI>("OPENROUTER_API_KEY");

export const model = env.OPENROUTER_MODEL || "openrouter/auto";

export const voyage: VoyageAIClient = env.VOYAGE_API_KEY
  ? new VoyageAIClient({ apiKey: env.VOYAGE_API_KEY })
  : missing<VoyageAIClient>("VOYAGE_API_KEY");
