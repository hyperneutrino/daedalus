import { getMongoCollection } from "../db.ts";

const collection = getMongoCollection<{ key: string; value: number }>("autoincrement");

export async function autoincrement(key: string) {
    const entry = await collection.findOneAndUpdate({ key }, { $inc: { value: 1 } }, { upsert: true });
    return entry ? entry.value + 1 : 1;
}

export async function getNextAutoincrementWithoutAdvancing(key: string) {
    const entry = await collection.findOne({ key });
    return entry ? entry.value + 1 : 1;
}
