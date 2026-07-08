"use client"

import { usePathname } from "next/navigation"
import { FaApple, FaGooglePlay } from "react-icons/fa6"
import { useLocaleStore } from "@/store/useLocaleStore"
import { useTranslation } from "@/lib/i18n"

export const APP_STORE_URL =
  "https://apps.apple.com/om/app/ajrni-plus-%D8%A3%D8%AC%D8%B1%D9%86%D9%8A-%D8%A8%D9%84%D8%B3/id6787429503"

/** Set when Google Play link is available */
export const GOOGLE_PLAY_URL = ""

const EXCLUDED_PREFIXES = ["/dashboard", "/admin", "/auth"]

function shouldShow(pathname: string) {
  return !EXCLUDED_PREFIXES.some((prefix) => pathname.startsWith(prefix))
}

const btnBase =
  "inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 active:scale-[0.98] px-5 py-2.5 text-sm rounded-xl"

export function AppDownloadSection() {
  const pathname = usePathname()
  const { locale } = useLocaleStore()
  const { t, dir } = useTranslation(locale)

  if (!shouldShow(pathname)) return null

  const mockupAlt =
    locale === "ar"
      ? "معاينة تطبيق أجرني بلس على الجوال"
      : "Ajrni Plus mobile app preview"

  return (
    <section
      dir={dir}
      aria-labelledby="app-download-title"
      className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 md:py-24"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12 items-center">
        <div className="space-y-6">
          <div>
            <h2
              id="app-download-title"
              className="text-2xl md:text-3xl font-bold text-primary mb-3"
            >
              {t("app_download.title")}
            </h2>
            <p className="text-muted-foreground leading-relaxed max-w-lg">
              {t("app_download.description")}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <a
              href={APP_STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={`${btnBase} bg-secondary text-white hover:bg-secondary/90`}
            >
              <FaApple className="h-5 w-5 shrink-0" />
              {t("app_download.app_store")}
            </a>

            {GOOGLE_PLAY_URL ? (
              <a
                href={GOOGLE_PLAY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className={`${btnBase} border-2 border-border bg-white hover:bg-muted text-primary`}
              >
                <FaGooglePlay className="h-5 w-5 shrink-0 text-secondary" />
                {t("app_download.google_play")}
              </a>
            ) : (
              <button
                type="button"
                disabled
                aria-disabled="true"
                title={t("app_download.google_play")}
                className={`${btnBase} border-2 border-border bg-white text-muted-foreground opacity-50 cursor-not-allowed`}
              >
                <FaGooglePlay className="h-5 w-5 shrink-0" />
                {t("app_download.google_play")}
              </button>
            )}
          </div>
        </div>

        <div className="flex justify-center lg:justify-end">
          <img
            src="/images/app/app-mockup.png"
            alt={mockupAlt}
            className="w-full max-w-[260px] sm:max-w-[320px] lg:max-w-[360px] h-auto object-contain"
            loading="lazy"
          />
        </div>
      </div>
    </section>
  )
}
