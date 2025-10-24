import z from "zod";

export const zs = {
    snowflake: z.string().regex(/^[1-9][0-9]{16,19}$/),
};

export type ShortGuild = {
    id: string;
    name: string;
    acronym: string;
    icon?: string;
    owner: boolean;
    permissions: string;
    features: string[];
    hasBot: boolean;
};
