import { getMongoCollection } from "../db.ts";

const collection = getMongoCollection<{ guild: string; dashboardPermissions: DashboardPermissions }>("guild_settings");

type DashboardPermissions = { base: "owner" | "admin" | "manager"; allow: string[] };
export const defaultDashboardPermissions: DashboardPermissions = { base: "manager", allow: [] };

export async function getDashboardPermission(guild: string) {
    const entry = await collection.findOne({ guild });
    return entry?.dashboardPermissions ?? defaultDashboardPermissions;
}

export async function getDashboardPermissions(guilds: string[]) {
    const dashboardPermissionsMap = new Map<string, DashboardPermissions>();
    const entries = await collection.find({ guild: { $in: guilds } }).toArray();

    for (const entry of entries) dashboardPermissionsMap.set(entry.guild, entry.dashboardPermissions);
    for (const guild of guilds) if (!dashboardPermissionsMap.has(guild)) dashboardPermissionsMap.set(guild, defaultDashboardPermissions);

    return dashboardPermissionsMap;
}
