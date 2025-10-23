declare namespace App {
    interface Locals {
        user: { id: string; name: string; image: string } | null;
        guild: {
            id: string;
            name: string;
            acronym: string;
            owner: boolean;
            roles: {
                id: string;
                name: string;
                color: number;
                everyone: boolean;
                managed: boolean;
                higher: boolean;
                position: number;
                foreign: boolean;
                origin: string;
            }[];
            channels: {
                id: string;
                type: number;
                position: number;
                name: string;
                parent: string | null;
                readonly: boolean;
                foreign: boolean;
                origin: string;
            }[];
            emojis: { id: string; name: string; url: string; foreign: boolean; origin: string }[];
            stickers: { id: string; name: string; url: string; foreign: boolean; origin: string }[];
        } | null;
        guildLoadError: string;
    }
}
