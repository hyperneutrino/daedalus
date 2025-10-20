import { expect, test } from "bun:test";
import { autoincrement, getNextAutoincrementWithoutAdvancing } from "database";

test("autoincrement on a fresh sequence returns 1", async () => {
    const value = await autoincrement("fresh-sequence-with-no-value");
    expect(value).toBe(1);
});

test("autoincrement on a sequence increases the number", async () => {
    const value = await autoincrement("sequence-to-increment-twice");
    expect(value).toBe(1);

    const next = await autoincrement("sequence-to-increment-twice");
    expect(next).toBe(2);
});

test("autoincrement can view the current value without advancing", async () => {
    const value = await getNextAutoincrementWithoutAdvancing("sequence-to-peek");
    expect(value).toBe(1);

    const advanced = await autoincrement("sequence-to-peek");
    expect(advanced).toBe(1);

    const peek = await getNextAutoincrementWithoutAdvancing("sequence-to-peek");
    expect(peek).toBe(2);
});
