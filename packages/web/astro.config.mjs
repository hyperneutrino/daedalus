import node from "@astrojs/node";
import icon from "astro-icon";
import { defineConfig } from "astro/config";

import react from "@astrojs/react";

export default defineConfig({
    output: "server",
    integrations: [
        icon({
            include: {
                "fa6-solid": [
                    "arrows-rotate",
                    "bars",
                    "book",
                    "chevron-left",
                    "chevron-right",
                    "crown",
                    "earth-americas",
                    "gear",
                    "handshake",
                    "moon",
                    "plus",
                    "screwdriver-wrench",
                    "sun",
                    "triangle-exclamation",
                    "xmark",
                ],
                "fa6-brands": ["discord"],
            },
        }),
        react(),
    ],
    adapter: node({ mode: "standalone" }),
});
