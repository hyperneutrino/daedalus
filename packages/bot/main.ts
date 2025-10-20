import { ShardingManager } from "discord.js";
import { sendEmergency, sendOperational } from "../webhook/index.ts";

const manager = new ShardingManager("./shard.ts", { token: process.env.DISCORD_TOKEN });

manager.on("shardCreate", async (shard) => {
    await sendOperational(`launched shard ${shard.id}`);
});

await manager.spawn();

process.on("uncaughtException", (error) => sendEmergency("uncaught top-level error", error));
