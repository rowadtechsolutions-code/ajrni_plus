"use client"

import { FaApple, FaGooglePlay } from "react-icons/fa6"
import { useLocaleStore } from "@/store/useLocaleStore"

export const APP_STORE_URL =
  "https://apps.apple.com/om/app/ajrni-plus-%D8%A3%D8%AC%D8%B1%D9%86%D9%8A-%D8%A8%D9%84%D8%B3/id6787429503"

/** Set when Google Play link is available */
export const GOOGLE_PLAY_URL = ""

export function AppDownloadSection() {
  const { locale } = useLocaleStore()
  const dir = locale === "ar" ? "rtl" : "ltr"

  const title = locale === "ar" ? "حمّل تطبيق أجرني بلس" : "Download Ajrni Plus App"
  const description = locale === "ar" ? "استأجر سيارتك بسهولة من مكاتب موثوقة في الخليج." : "Rent your car easily from trusted offices across the Gulf."
  const appStoreText = locale === "ar" ? "App Store" : "App Store"
  const googlePlayText = locale === "ar" ? "Google Play" : "Google Play"
  const comingSoonText = locale === "ar" ? "قريباً" : "Coming Soon"
  const mockupAlt = locale === "ar" ? "معاينة تطبيق أجرني بلس" : "Ajrni Plus app preview"

  return (
    <section
      dir={dir}
      className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 md:py-24"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12 items-center">
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-primary mb-3">
              {title}
            </h2>
            <p className="text-muted-foreground leading-relaxed max-w-lg">
              {description}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <a
              href={APP_STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 active:scale-[0.98] px-5 py-2.5 text-sm rounded-xl bg-secondary text-white hover:bg-secondary/90 shadow-lg shadow-secondary/20"
            >
              <FaApple className="h-5 w-5 shrink-0" />
              {appStoreText}
            </a>

            {GOOGLE_PLAY_URL ? (
              <a
                href={GOOGLE_PLAY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 active:scale-[0.98] px-5 py-2.5 text-sm rounded-xl border-2 border-border bg-white hover:bg-muted text-primary"
              >
                <FaGooglePlay className="h-5 w-5 shrink-0 text-secondary" />
                {googlePlayText}
              </a>
            ) : (
              <button
                type="button"
                disabled
                className="inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 px-5 py-2.5 text-sm rounded-xl border-2 border-border bg-white text-muted-foreground opacity-50 cursor-not-allowed"
              >
                <FaGooglePlay className="h-5 w-5 shrink-0" />
                {googlePlayText}
                <span className="text-xs">({comingSoonText})</span>
              </button>
            )}
          </div>
        </div>

        <div className="flex justify-center lg:justify-end">
          <img
            src="/images/app/app-mockup.png"
            alt={mockupAlt}
            className="w-full max-w-[280px] sm:max-w-[320px] lg:max-w-[360px] h-auto object-contain"
            loading="lazy"
          />
        </div>
      </div>
    </section>
  )
}
