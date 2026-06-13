"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

interface LocaleState {
  locale: "ar" | "en"
  setLocale: (locale: "ar" | "en") => void
  dir: "rtl" | "ltr"
}

export const useLocaleStore = create<LocaleState>()(
  persist(
    (set) => ({
      locale: "ar",
      dir: "rtl",
      setLocale: (locale) =>
        set({
          locale,
          dir: locale === "ar" ? "rtl" : "ltr",
        }),
    }),
    { name: "ajirni-locale" }
  )
)
