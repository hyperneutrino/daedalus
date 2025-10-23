export function env(name: string) {
    const value = process.env[name];
    if (!value) throw new Error(`set environment variable ${name}`);
    return value;
}
