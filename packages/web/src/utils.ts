import type { Dispatch, FormEvent, SetStateAction } from "react";

export function onTextInput(set: Dispatch<SetStateAction<string>>) {
    return (e: FormEvent<HTMLInputElement | HTMLTextAreaElement>) => set(e.currentTarget.value);
}
