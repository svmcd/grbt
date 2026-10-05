import type { Locale } from "./config";

export type Messages<T> = Record<Locale, T>;

// Every locale must have exactly the same keys (and function signatures) as `en`.
export function defineMessages<T>(messages: { en: T; de: NoInfer<T>; fr: NoInfer<T>; tr: NoInfer<T> }): Messages<T> {
    return messages;
}
