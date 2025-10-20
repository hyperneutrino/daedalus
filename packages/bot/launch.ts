import { Client, Events, IntentsBitField } from "discord.js";

const Intents = IntentsBitField.Flags;

export async function launch(token: string): Promise<Client<true>> {
    const client = new Client({ intents: Intents.Guilds });
    const promise = new Promise<Client<true>>((res) => client.on(Events.ClientReady, res));
    await client.login(token);
    return await promise;
}
