"use client"

import { createContext, useContext, useEffect } from "react"
import { useLocaleStore } from "@/store/useLocaleStore"

const LocaleContext = createContext<ReturnType<typeof useLocaleStore> | null>(
  null
)

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const store = useLocaleStore()

  useEffect(() => {
    document.documentElement.dir = store.dir
    document.documentElement.lang = store.locale
  }, [store.dir, store.locale])

  return (
    <LocaleContext.Provider value={store}>{children}</LocaleContext.Provider>
  )
}

export function useLocale() {
  const context = useContext(LocaleContext)
  if (!context) throw new Error("useLocale must be used within LocaleProvider")
  return context
}
