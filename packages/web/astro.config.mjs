import node from "@astrojs/node";
import icon from "astro-icon";
import { defineConfig } from "astro/config";

export default defineConfig({
    output: "server",
    integrations: [
        icon({
            include: {
                "fa6-solid": ["bars", "book", "crown", "handshake", "moon", "plus", "screwdriver-wrench", "sun", "xmark"],
                "fa6-brands": ["discord"],
            },
        }),
    ],
    adapter: node({ mode: "standalone" }),
});
