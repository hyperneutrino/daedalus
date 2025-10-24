import { createHTTPServer } from "@trpc/server/adapters/standalone";
import { filterGuildsByCustomClientAndFlatten } from "database";
import { Client } from "discord.js";
import { makeWorker } from "queues";
import { zs, type ShortGuild } from "types";
import { numericEnv } from "utils";
import { sendEmergency, sendOperational, sendWarning } from "../webhook/index.ts";
import { launch } from "./launch.ts";
import { proc, router } from "./trpc-customs.ts";

const clients = new Map<string, Client<true>>();

makeWorker("clients", async ({ data: { action, token } }) => {
    const censored = `\`${token.slice(0, 5)}...${token.slice(-5)}\``;

    if (action === "start") {
        if (clients.has(token)) return;

        launch(token)
            .then((client) => {
                clients.set(token, client);
                sendOperational(`launched client \`${client.user.tag}\` with token ${censored}`);
            })
            .catch((error) => sendEmergency(`failed to start client with token ${censored}`, error));
    } else if (action === "stop") {
        const client = clients.get(token);
        if (!client) return;

        await client
            .destroy()
            .then(() => sendOperational(`stopped client \`${client.user.tag}\` with token ${censored}`))
            .catch((error) => sendEmergency(`failed to stop client ${client.user.tag} with token ${censored}`, error));

        clients.delete(token);
    } else if (action === "restart") {
        const client = clients.get(token);

        if (client)
            await client
                .destroy()
                .then(() => {
                    sendOperational(`stopped client \`${client.user.tag}\` (restarting) with token ${censored}`);
                    clients.delete(token);
                })
                .catch((error) => sendWarning(`failed to stop client (restarting) with token ${censored}`, error));

        if (!clients.has(token))
            launch(token)
                .then((client) => {
                    clients.set(token, client);
                    sendOperational(`restarted client ${client.user.tag} with token ${censored}`);
                })
                .catch((error) => sendEmergency(`failed to restart client with token ${censored}`, error));
    }
});

const appRouter = router({
    getGuildsWithBot: proc.query(async () => {
        const guildsByBotEntries = clients
            .values()
            .toArray()
            .map<[string, { id: string; acronym: string }[]]>((client) => [
                client.token,
                client.guilds.cache.map((guild) => ({ id: guild.id, acronym: guild.nameAcronym })),
            ]);

        return await filterGuildsByCustomClientAndFlatten(guildsByBotEntries);
    }),
    getAllGuildsForAdmin: proc.input(zs.snowflake).query(async ({ input: user }): Promise<ShortGuild[]> => {
        const guildsByBotEntries = clients
            .values()
            .toArray()
            .map<[string, ShortGuild[]]>((client) => [
                client.token,
                client.guilds.cache.map<ShortGuild>((guild) => ({
                    id: guild.id,
                    name: guild.name,
                    acronym: guild.nameAcronym,
                    icon: guild.iconURL({ forceStatic: true, extension: "png", size: 256 }) ?? undefined,
                    owner: guild.ownerId === user,
                    permissions: guild.members.cache.get(user)?.permissions.bitfield.toString() ?? "0",
                    features: guild.features,
                    hasBot: true,
                })),
            ]);

        return await filterGuildsByCustomClientAndFlatten(guildsByBotEntries);
    }),
});

createHTTPServer({ router: appRouter }).listen(numericEnv("CUSTOMS_BOT_TRPC_PORT"));

export type AppRouter = typeof appRouter;

process.on("uncaughtException", (error) => sendEmergency("uncaught top-level error", error));
