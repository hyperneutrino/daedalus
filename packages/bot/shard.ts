import assert from "assert";
import { sendEmergency } from "../webhook/index.ts";
import { launch } from "./launch.ts";

const token = process.env.DISCORD_TOKEN;
assert(token, "set environment variable DISCORD_TOKEN");

await launch(token);

process.on("uncaughtException", (error) => sendEmergency("uncaught top-level error", error));
