export const apps = [
    {
        name: "discord:main",
        cwd: "packages/bot",
        script: "bun --env-file=../../.env main.ts",
    },
    {
        name: "discord:customs",
        cwd: "packages/bot",
        script: "bun --env-file=../../.env customs.ts",
    },
    {
        name: "web",
        cwd: "packages/web",
        script: "bun --env-file=../../.env run preview",
    },
];
