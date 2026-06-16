"use client"

import { useState, useEffect } from "react"
import { useLocaleStore } from "@/store/useLocaleStore"

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [show, setShow] = useState(false)
  const { locale } = useLocaleStore()

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShow(true)
    }
    window.addEventListener("beforeinstallprompt", handler)
    return () => window.removeEventListener("beforeinstallprompt", handler)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const result = await deferredPrompt.userChoice
    if (result.outcome === "accepted") setShow(false)
    setDeferredPrompt(null)
  }

  if (!show) return null

  return (
    <div className="fixed bottom-24 sm:bottom-8 left-1/2 -translate-x-1/2 z-50 w-[90vw] max-w-md">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xl p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center shrink-0">
          <svg className="w-5 h-5 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-primary">{locale === "ar" ? "ثبّت التطبيق" : "Install App"}</p>
          <p className="text-xs text-muted-foreground truncate">{locale === "ar" ? "أضف أجرني بلس لشاشتك الرئيسية" : "Add Ajrni Plus to your home screen"}</p>
        </div>
        <button onClick={handleInstall} className="shrink-0 px-4 py-2 rounded-xl bg-secondary text-white text-sm font-medium hover:bg-secondary/90 transition-all">
          {locale === "ar" ? "تثبيت" : "Install"}
        </button>
        <button onClick={() => setShow(false)} className="shrink-0 p-2 rounded-xl hover:bg-gray-100 text-muted-foreground transition-all">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  )
}
