import ar from "@/messages/ar.json"
import en from "@/messages/en.json"

const messages: Record<string, Record<string, any>> = { ar, en }

export function getMessage(locale: string, path: string): string {
  const keys = path.split(".")
  let value = messages[locale]
  if (!value) return path
  for (const key of keys) {
    value = value?.[key]
  }
  return typeof value === "string" ? value : path
}

export function useTranslation(locale: "ar" | "en") {
  return {
    t: (path: string) => getMessage(locale, path),
    locale,
    dir: locale === "ar" ? "rtl" : "ltr" as const,
  }
}

export type TranslationMessages = typeof ar
