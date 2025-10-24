import { ReactIcon } from "#/components/ReactIcon";
import { onTextInput } from "#/utils";
import { actions } from "astro:actions";
import { useEffect, useState } from "react";
import type { ShortGuild } from "types";
import { fuzzy } from "utils";

export function Page() {
    const [guilds, setGuilds] = useState<ShortGuild[]>([]);
    const [error, setError] = useState("");
    const [loaded, setLoaded] = useState(false);
    const [query, setQuery] = useState("");

    async function reload() {
        setLoaded(false);

        try {
            const { data, error } = await actions.getUserGuilds();

            if (error) setError(`${error}`);
            else if (typeof data === "string") setError(data);
            else {
                setGuilds(data);
                localStorage.setItem("server-list", JSON.stringify(data));
            }
        } catch (error) {
            setError(`${error}`);
        }

        setLoaded(true);
    }

    useEffect(() => {
        const cache = localStorage.getItem("server-list");

        if (cache)
            try {
                setGuilds(JSON.parse(cache));
                setLoaded(true);
                return;
            } catch {}

        reload();
    }, []);

    return (
        <>
            <input type="text" className="stretch" value={query} onInput={onTextInput(setQuery)} placeholder="filter servers" />
            <button disabled={!loaded} className="btn primary" onClick={reload}>
                <ReactIcon icon="arrows-rotate" /> reload servers
            </button>
            {!loaded ? (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(320px, 100%), 1fr))", gap: "0.5rem", width: "100%" }}>
                    {new Array(12).fill(0).map((_, i) => (
                        <div className="panel" key={i} style={{ height: "calc(64px + 2rem)" }}></div>
                    ))}
                </div>
            ) : error ? (
                <b>{error}</b>
            ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(320px, 100%), 1fr))", gap: "0.5rem", width: "100%" }}>
                    {guilds.map((guild, i) => (
                        <a
                            href={`/manage/${guild.id}`}
                            key={i}
                            className="flex"
                            style={{ padding: 0, display: fuzzy(guild.name, query) ? undefined : "none", textDecoration: "none" }}
                        >
                            <div className="panel" style={{ width: "100%", padding: "1rem", backgroundColor: guild.hasBot ? undefined : "transparent" }}>
                                <div className="flex no-wrap" style={{ alignSelf: "stretch" }}>
                                    {guild.icon ? (
                                        <img src={`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`} alt={guild.name} width={64} height={64} />
                                    ) : (
                                        <span
                                            style={{
                                                width: 64,
                                                height: 64,
                                                display: "grid",
                                                alignItems: "center",
                                                justifyItems: "center",
                                                backgroundColor: "var(--guild-icon-background)",
                                                fontFamily: "Geo, sans-serif",
                                                fontSize: "16pt",
                                            }}
                                        >
                                            {guild.acronym}
                                        </span>
                                    )}
                                    <div style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
                                        <h3 style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{guild.name}</h3>
                                        <div className="flex">
                                            {guild.owner ? (
                                                <div className="badge primary">owner</div>
                                            ) : BigInt(guild.permissions) & 8n ? (
                                                <div className="badge primary">admin</div>
                                            ) : BigInt(guild.permissions) & 32n ? (
                                                <div className="badge primary">manager</div>
                                            ) : (
                                                <div className="badge danger">no permissions</div>
                                            )}
                                            {guild.features.includes("COMMUNITY") ? <div className="badge primary">community</div> : null}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </a>
                    ))}
                </div>
            )}
        </>
    );
}
