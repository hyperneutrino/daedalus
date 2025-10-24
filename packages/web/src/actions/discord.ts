import { defineAction } from "astro:actions";
import { customsTRPCClient, mainTRPCClient } from "bot";
import { defaultDashboardPermissions, getDashboardPermissions, isAdmin } from "database";
import type { ShortGuild } from "types";
import { env } from "utils";

function key(server: { hasBot: boolean; owner: boolean; permissions: string; features: string[] }) {
    return [
        server.hasBot,
        server.owner,
        (BigInt(server.permissions) & 0x8n) > 0n,
        (BigInt(server.permissions) & 0x20n) > 0n,
        server.features.includes("COMMUNITY"),
    ]
        .map<number>((x) => (x ? 0 : 1))
        .reduce((x, y) => x * 2 + y);
}

export default {
    getUserGuilds: defineAction({
        async handler(_, context) {
            const user = context.locals.user;
            const token = context.cookies.get("discord_access_token")?.value;

            if (!token || !user) return "your login has expired — please reload this page";

            if (await isAdmin(user.id)) {
                return [...(await mainTRPCClient.getAllGuildsForAdmin.query(user.id)), ...(await customsTRPCClient.getAllGuildsForAdmin.query(user.id))].sort(
                    (a, b) => key(a) - key(b) || a.name.localeCompare(b.name),
                );
            }

            const request = await fetch(`${env("DISCORD_API")}/users/@me/guilds`, { headers: { Authorization: `Bearer ${token}` } });
            if (!request.ok) return "request to discord API failed — please try again";

            const guilds: ShortGuild[] = (
                (await request.json()) as { id: string; name: string; icon?: string; owner: boolean; permissions: string; features: string[] }[]
            ).map((guild) => ({
                ...guild,
                acronym: [...guild.name.matchAll(/\w+('s)?|./g)]
                    .map((x) => x[0][0])
                    .join("")
                    .replaceAll(/\s+/g, ""),
                hasBot: false,
            }));

            const ids = guilds.map((guild) => guild.id);
            const dashboardPermissionsMap = await getDashboardPermissions(ids);

            const filtered = guilds.filter(({ id, owner, permissions }) => {
                const { base, allow } = dashboardPermissionsMap.get(id) ?? defaultDashboardPermissions;
                if (allow.includes(user.id)) return true;

                if (base === "owner") return owner;
                if (base === "admin") return !!(BigInt(permissions) & 0x8n);
                if (base === "manager") return !!(BigInt(permissions) & 0x20n);
            });

            const fetchedGuilds = [...(await mainTRPCClient.getGuildsWithBot.query()), ...(await customsTRPCClient.getGuildsWithBot.query())];
            const guildsWithBot = new Map(fetchedGuilds.map(({ id, acronym }) => [id, acronym]));

            for (const guild of filtered) {
                guild.hasBot = guildsWithBot.has(guild.id);
                if (guild.hasBot) guild.acronym = guildsWithBot.get(guild.id) ?? guild.acronym;
            }

            return filtered.sort((a, b) => key(a) - key(b) || a.name.localeCompare(b.name));
        },
    }),
};
