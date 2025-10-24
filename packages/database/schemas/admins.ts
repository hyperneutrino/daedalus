import { getMongoCollection } from "../db.ts";

const collection = getMongoCollection<{ user: string }>("admins");

export async function isAdmin(user: string) {
    return !!(await collection.findOne({ user }));
}

export async function addAdmin(user: string) {
    const { upsertedCount } = await collection.updateOne({ user }, { $set: {} }, { upsert: true });
    return upsertedCount > 0;
}

export async function removeAdmin(user: string) {
    const { deletedCount } = await collection.deleteOne({ user });
    return deletedCount > 0;
}
