// One MongoClient per server process, cached on globalThis so dev hot-reloads reuse it.
import { MongoClient, type Db } from "mongodb";

const g = globalThis as unknown as { __frMongo?: MongoClient };

export function mongo(): MongoClient {
  if (!g.__frMongo) {
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error("MONGODB_URI is not set (flight-recorder/.env.local should symlink ../.env)");
    g.__frMongo = new MongoClient(uri, { appName: "waypoints-flight-recorder", maxPoolSize: 20 });
  }
  return g.__frMongo;
}

/** `name` comes from ?db= (only waypoints / waypoints_<suffix> are allowed); default $WAYPOINTS_DB or "waypoints". */
export function waypointsDb(name?: string | null): Db {
  const pick = name && /^waypoints(_\w{1,40})?$/.test(name) ? name : process.env.WAYPOINTS_DB ?? "waypoints";
  return mongo().db(pick);
}
export const dbParam = (request: Request) => new URL(request.url).searchParams.get("db");
