import { useLocale } from "next-intl";
import LocaleSwitcherSelect from "./locale-switcher-select";
import { LANGUAGES, SupportedLocale } from "@/constants/languages";

const LOCALE_OPTIONS: Array<{ value: SupportedLocale; label: string }> =
  Object.entries(LANGUAGES).map(([key]) => ({
    value: key as SupportedLocale,
    label: getFlagEmoji(key as SupportedLocale),
  }));

function getFlagEmoji(locale: SupportedLocale): string {
  const flags: Record<SupportedLocale, string> = {
    en: "🇬🇧",
    vi: "🇻🇳",
    km: "🇰🇭",
    th: "🇹🇭",
  };
  return flags[locale] || "";
}

export default function LocaleSwitcher() {
  const locale = useLocale() as SupportedLocale;

  return (
    <LocaleSwitcherSelect
      defaultValue={locale}
      items={LOCALE_OPTIONS}
      label={LANGUAGES[locale]}
    />
  );
}
