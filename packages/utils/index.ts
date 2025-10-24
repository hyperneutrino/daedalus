export function env(name: string) {
    const value = process.env[name];
    if (!value) throw new Error(`set environment variable ${name}`);
    return value;
}

export function numericEnv(name: string) {
    const value = parseInt(env(name));
    if (isNaN(value)) throw new Error(`environment variable ${name} needs to be a number`);
    return value;
}

export function fuzzy(string: string, query: string) {
    if (!query) return true;

    query = query.toLowerCase();
    string = string.toLowerCase();

    let index = 0;

    for (const char of string) {
        if (char === query.charAt(index)) index++;
        if (index >= query.length) return true;
    }

    return false;
}
