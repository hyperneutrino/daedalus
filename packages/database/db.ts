import assert from "assert";
import { MongoClient, type CollectionOptions, type Document } from "mongodb";

const url = process.env.MONGODB_URI;
const username = process.env.MONGODB_USERNAME;
const password = process.env.MONGODB_PASSWORD;
assert(url && username && password, "set environment variables MONGODB_URI, MONGODB_USERNAME, and MONGODB_PASSWORD");

const client = new MongoClient(url, { auth: { username, password } });
await client.connect();

const db = client.db();

export function getMongoCollection<T extends Document>(name: string, options?: CollectionOptions) {
    return db.collection<T>(`${process.env.MONGODB_PREFIX ?? ""}${name}`, options);
}

export async function listMongoCollections() {
    return await db.collections();
}
