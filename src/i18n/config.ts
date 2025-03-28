export type Locale = (typeof locales)[number];

export const locales = ["en", "vi", "th", "km"] as const;
export const defaultLocale: Locale = "en";
