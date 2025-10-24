import { createTRPCClient, httpBatchLink } from "@trpc/client";

import { numericEnv } from "utils";
import type { AppRouter as CustomsBotTRPCRouter } from "./customs.ts";
import type { AppRouter as MainBotTRPCRouter } from "./main.ts";

export const mainTRPCClient = createTRPCClient<MainBotTRPCRouter>({
    links: [httpBatchLink({ url: `http://localhost:${numericEnv("MAIN_BOT_TRPC_PORT")}` })],
});

export const customsTRPCClient = createTRPCClient<CustomsBotTRPCRouter>({
    links: [httpBatchLink({ url: `http://localhost:${numericEnv("CUSTOMS_BOT_TRPC_PORT")}` })],
});
