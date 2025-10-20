import { Client } from "discord.js";
import { makeWorker } from "queues";
import { sendEmergency, sendOperational, sendWarning } from "../webhook/index.ts";
import { launch } from "./launch.ts";

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

process.on("uncaughtException", (error) => sendEmergency("uncaught top-level error", error));
