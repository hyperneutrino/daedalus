import { getMongoCollection } from "../db.ts";

const collection = getMongoCollection<{ guild: string; token: string }>("tokens");

export async function filterGuildsByDefaultClient<T extends string | { id: string }>(guilds: T[]): Promise<T[]> {
    const entries = await collection.find().toArray();
    const hasCustomClient = new Set(entries.map((entry) => entry.guild));
    return guilds.filter((guild) => !hasCustomClient.has(typeof guild === "string" ? guild : guild.id));
}

export async function filterGuildsByCustomClientAndFlatten<T extends string | { id: string }>(guildsByBotEntries: [string, T[]][]): Promise<T[]> {
    const entries = await collection.find().toArray();
    const expected = new Map<string, Set<string>>();

    for (const entry of entries) {
        if (!expected.has(entry.token)) expected.set(entry.token, new Set());
        expected.get(entry.token)!.add(entry.guild);
    }

    return guildsByBotEntries.flatMap(([token, guilds]) => {
        const set = expected.get(token) ?? new Set();
        return guilds.filter((guild) => set.has(typeof guild === "string" ? guild : guild.id));
    });
}
