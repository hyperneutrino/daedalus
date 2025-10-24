import { createHTTPServer } from "@trpc/server/adapters/standalone";
import { filterGuildsByDefaultClient } from "database";
import { ShardingManager } from "discord.js";
import { zs, type ShortGuild } from "types";
import { numericEnv } from "utils";
import { sendEmergency, sendOperational } from "../webhook/index.ts";
import { proc, router } from "./trpc-main.ts";

const manager = new ShardingManager("./shard.ts", { token: process.env.DISCORD_TOKEN });

manager.on("shardCreate", async (shard) => {
    await sendOperational(`launched shard ${shard.id}`);
});

await manager.spawn();

const appRouter = router({
    getGuildsWithBot: proc.query(async () => {
        const guildsByShard = await manager.broadcastEval((client) => client.guilds.cache.map((guild) => ({ id: guild.id, acronym: guild.nameAcronym })));
        return await filterGuildsByDefaultClient(guildsByShard.flat());
    }),
    getAllGuildsForAdmin: proc.input(zs.snowflake).query(async ({ input: user }): Promise<ShortGuild[]> => {
        const guildsByShard = await manager.broadcastEval(
            (client, { user }) =>
                client.guilds.cache.map<ShortGuild>((guild) => ({
                    id: guild.id,
                    name: guild.name,
                    acronym: guild.nameAcronym,
                    icon: guild.icon ?? undefined,
                    owner: guild.ownerId === user,
                    permissions: guild.members.cache.get(user)?.permissions.bitfield.toString() ?? "0",
                    features: guild.features,
                    hasBot: true,
                })),
            { context: { user } },
        );

        return await filterGuildsByDefaultClient(guildsByShard.flat());
    }),
});

createHTTPServer({ router: appRouter }).listen(numericEnv("MAIN_BOT_TRPC_PORT"));

export type AppRouter = typeof appRouter;

process.on("uncaughtException", (error) => sendEmergency("uncaught top-level error", error));
