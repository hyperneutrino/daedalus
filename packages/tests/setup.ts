import { afterAll, beforeAll } from "bun:test";
import { listMongoCollections } from "database/db.ts";

process.env.MONGODB_PREFIX = "databasetestprefix-";

async function cleanupTestDatabase() {
    for (const collection of await listMongoCollections()) if (collection.collectionName.startsWith("databasetestprefix-")) await collection.drop();
}

beforeAll(cleanupTestDatabase);
afterAll(cleanupTestDatabase);
