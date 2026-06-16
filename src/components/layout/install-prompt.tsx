"use client"

import { useState, useEffect } from "react"
import { useLocaleStore } from "@/store/useLocaleStore"
import { X } from "lucide-react"

function isIOS() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent)
}

function isMobile() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [show, setShow] = useState(false)
  const [showGuide, setShowGuide] = useState(false)
  const { locale } = useLocaleStore()
  const iosDevice = isIOS()

  useEffect(() => {
    const dismissed = localStorage.getItem("install-dismissed")
    if (dismissed) return

    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShow(true)
    }
    window.addEventListener("beforeinstallprompt", handler)

    const timer = setTimeout(() => {
      if (!deferredPrompt && isMobile()) {
        setShow(true)
      }
    }, 5000)

    return () => {
      window.removeEventListener("beforeinstallprompt", handler)
      clearTimeout(timer)
    }
  }, [])

  const handleInstall = async () => {
    if (iosDevice) {
      setShowGuide(true)
      return
    }
    if (!deferredPrompt) {
      handleDismiss()
      return
    }
    deferredPrompt.prompt()
    const result = await deferredPrompt.userChoice
    if (result.outcome === "accepted") setShow(false)
    setDeferredPrompt(null)
  }

  const handleDismiss = () => {
    setShow(false)
    localStorage.setItem("install-dismissed", "true")
  }

  if (showGuide) {
    return (
      <div className="fixed inset-0 z-50 bg-black/60 flex items-end sm:items-center justify-center p-4" onClick={() => setShowGuide(false)}>
        <div className="bg-white rounded-3xl w-full max-w-sm p-6 space-y-5" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-primary">{locale === "ar" ? "تثبيت التطبيق" : "Install App"}</h3>
            <button onClick={() => setShowGuide(false)} className="p-1.5 rounded-xl hover:bg-gray-100"><X className="w-5 h-5" /></button>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center shrink-0 text-lg font-bold text-secondary">١</div>
              <p className="text-sm text-muted-foreground">{locale === "ar" ? "اضغط على زر المشاركة" : "Tap the Share button"}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center shrink-0 text-lg font-bold text-secondary">٢</div>
              <p className="text-sm text-muted-foreground">{locale === "ar" ? "مرر لليمين واختر" : "Scroll right and select"}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center shrink-0 text-lg font-bold text-secondary">٣</div>
              <p className="text-sm text-muted-foreground">{locale === "ar" ? "أضف إلى الشاشة الرئيسية" : "Add to Home Screen"}</p>
            </div>
          </div>
          <button onClick={() => { setShowGuide(false); handleDismiss() }} className="w-full py-3 rounded-2xl bg-secondary text-white font-medium text-sm">
            {locale === "ar" ? "تم" : "Done"}
          </button>
        </div>
      </div>
    )
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
        <button onClick={handleDismiss} className="shrink-0 p-2 rounded-xl hover:bg-gray-100 text-muted-foreground transition-all">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  )
}
