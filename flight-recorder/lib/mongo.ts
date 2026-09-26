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

export function waypointsDb(): Db {
  return mongo().db(process.env.WAYPOINTS_DB ?? "waypoints");
}
