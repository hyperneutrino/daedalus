import assert from "assert";
import { WebhookClient } from "discord.js";

const webhook = process.env.DISCORD_WEBHOOK;
assert(webhook, "set environment variable DISCORD_WEBHOOK");

const url = new URL(webhook);
if (!url.searchParams.has("wait")) url.searchParams.set("wait", "true");

const client = new WebhookClient({ url: url.toString() });

async function sendWebhookMessage(category: string, message: string, error?: Error) {
    const uuid = crypto.randomUUID();

    const content = `\`[${uuid}]\` <@&${process.env[`DISCORD_WEBHOOK_ROLE_${category.toUpperCase()}`]}> ${message}`;
    const errorFits = error?.stack ? content.length + error.stack.length + 9 <= 2000 : false;

    try {
        await client.send({
            content: error?.stack && errorFits ? `${content}\n\`\`\`\n${error.stack}\n\`\`\`` : content,
            files: error?.stack && !errorFits ? [{ name: "error.txt", attachment: Buffer.from(error.stack, "utf-8") }] : undefined,
        });
    } catch {
        console.log(`[${uuid}] [${category.toLowerCase()}] ${message}`);
        if (error?.stack) console.log(error.stack);
    }

    return uuid;
}

export async function sendOperational(message: string, error?: Error) {
    return await sendWebhookMessage("operational", message, error);
}

export async function sendWarning(message: string, error?: Error) {
    return await sendWebhookMessage("warning", message, error);
}

export async function sendEmergency(message: string, error?: Error) {
    return await sendWebhookMessage("emergency", message, error);
}
