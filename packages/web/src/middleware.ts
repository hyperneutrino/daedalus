import { defineMiddleware } from "astro:middleware";
import { env } from "utils";

export const onRequest = defineMiddleware(async function (context, next) {
    let access_token = context.cookies.get("discord_access_token")?.value;
    let refresh_token = context.cookies.get("discord_refresh_token")?.value;
    let expires_in = 0;

    let setTokens = false;

    if (refresh_token && !access_token) {
        const oauth2Request = await fetch(`${env("DISCORD_API")}/oauth2/token`, {
            method: "post",
            body: new URLSearchParams({
                client_id: env("DISCORD_CLIENT_ID"),
                client_secret: env("DISCORD_CLIENT_SECRET"),
                grant_type: "refresh_token",
                refresh_token,
            }),
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
        });

        if (oauth2Request.ok) {
            ({ access_token, refresh_token, expires_in } = (await oauth2Request.json()) as { access_token: string; refresh_token: string; expires_in: number });
            setTokens = true;
        }
    }

    const guild = context.url.pathname.match(/^\/manage\/\d+/) ? context.url.pathname.split("/")[2] : null;

    if (access_token) {
        const userRequest = await fetch(`${env("DISCORD_API")}/users/@me`, { headers: { Authorization: `Bearer ${access_token}` } });
        const { id, username, avatar } = (await userRequest.json()) as { id: string; username: string; avatar: string };

        context.locals.user = { id, image: `https://cdn.discordapp.com/avatars/${id}/${avatar}.png?size=64`, name: username };
    }

    if (setTokens) {
        context.cookies.set("discord_access_token", access_token ?? "");
        context.cookies.set("discord_refresh_token", refresh_token ?? "");
    }

    if (guild && context.locals.user) {
        context.locals.guildLoadError = "not implemented";
    }

    const response = await next();

    if (setTokens) {
        response.headers.set("Set-Cookie", `discord_access_token=${access_token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${expires_in}`);
        response.headers.set("Set-Cookie", `discord_refresh_token=${refresh_token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${30 * 24 * 60 * 60 * 1000}`);
    }

    return response;
});
