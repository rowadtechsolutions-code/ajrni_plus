"use client"

import { memo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Building2, MapPin, MessageCircle, Shield } from "lucide-react"
import { motion } from "framer-motion"
import { useLocaleStore } from "@/store/useLocaleStore"
import { useTranslation } from "@/lib/i18n"
import { getCountryByCode } from "@/lib/locations"
import type { OfficeType } from "@/types"

interface OfficeCardProps {
  office: OfficeType
  coverImage: string
  whatsAppHref: string
  index?: number
  eagerImage?: boolean
}

export const OfficeCard = memo(function OfficeCard({
  office,
  coverImage,
  whatsAppHref,
  index = 0,
  eagerImage = false,
}: OfficeCardProps) {
  const { locale } = useLocaleStore()
  const { t } = useTranslation(locale)
  const [coverFailed, setCoverFailed] = useState(false)
  const [logoFailed, setLogoFailed] = useState(false)
  const country = office.country ? getCountryByCode(office.country) : null
  const countryName = country
    ? locale === "ar"
      ? country.nameAr
      : country.nameEn
    : office.country
  const location = [office.city, countryName].filter(Boolean).join(", ")
  const officeName = office.office_name || (locale === "ar" ? "مكتب تأجير" : "Rental Office")

  return (
    <motion.article
      data-office-card={office.id}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.28 }}
      className="h-full min-w-0"
      dir={locale === "ar" ? "rtl" : "ltr"}
    >
      <div className="group flex h-full min-w-0 flex-col rounded-xl border border-gray-100 bg-white shadow-sm transition-[transform,box-shadow,border-color] duration-200 [@media(hover:hover)]:hover:-translate-y-1 [@media(hover:hover)]:hover:border-gray-200 [@media(hover:hover)]:hover:shadow-lg">
        <div className="relative aspect-[16/7] w-full overflow-hidden rounded-t-xl bg-muted">
          {!coverFailed && coverImage ? (
            <Image
              src={coverImage}
              alt={officeName}
              fill
              loading={eagerImage ? "eager" : "lazy"}
              fetchPriority={eagerImage ? "high" : "auto"}
              decoding="async"
              sizes="(max-width: 639px) calc(100vw - 2rem), (max-width: 1023px) 50vw, 33vw"
              className="object-cover"
              onError={() => setCoverFailed(true)}
            />
          ) : (
            <div className="flex size-full items-center justify-center bg-gradient-to-br from-slate-100 via-slate-50 to-slate-200 text-slate-400">
              <Building2 className="size-12" aria-hidden="true" />
            </div>
          )}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-black/5" />
          {office.is_active && (
            <span className="absolute start-3 top-3 inline-flex items-center gap-1 rounded-lg bg-secondary/90 px-2.5 py-1 text-[10px] font-semibold text-white shadow-sm backdrop-blur-sm">
              <Shield className="size-3" aria-hidden="true" />
              {t("offices_page.verified") || (locale === "ar" ? "موثق" : "Verified")}
            </span>
          )}
        </div>

        <div className="relative flex min-w-0 flex-1 flex-col gap-3 p-4 pt-9">
          <div className="absolute start-4 top-0 flex size-14 -translate-y-1/2 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-white text-secondary shadow-sm">
            {office.image && !logoFailed ? (
              <Image
                src={office.image}
                alt=""
                fill
                loading="lazy"
                decoding="async"
                sizes="56px"
                className="object-cover"
                onError={() => setLogoFailed(true)}
              />
            ) : (
              <span className="flex size-full items-center justify-center bg-gradient-to-br from-secondary/15 to-blue-600/15 text-base font-bold">
                {officeName[0] || "O"}
              </span>
            )}
          </div>

          <div className="min-w-0">
            <h3 className="line-clamp-2 min-h-6 text-base font-semibold leading-6 text-primary">
              {officeName}
            </h3>
            {location && (
              <p className="mt-0.5 flex min-w-0 items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="size-3 shrink-0" aria-hidden="true" />
                <span className="truncate">{location}</span>
              </p>
            )}
          </div>

          {office.city && (
            <div className="flex min-h-7 flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span className="inline-flex min-w-0 items-center gap-1 rounded-lg bg-muted px-2.5 py-1">
                <MapPin className="size-3.5 shrink-0 text-secondary" aria-hidden="true" />
                <span className="truncate">{office.city}</span>
              </span>
            </div>
          )}

          <div className="mt-auto flex min-w-0 items-center gap-2 pt-1">
            <Link
              href={`/offices/${office.id}`}
              className="inline-flex min-h-11 min-w-0 flex-1 items-center justify-center rounded-lg bg-secondary px-4 py-2.5 text-sm font-semibold text-white transition-colors [@media(hover:hover)]:hover:bg-secondary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2 active:scale-[0.99]"
            >
              {t("offices_page.view_office") || (locale === "ar" ? "عرض المكتب" : "View Office")}
            </Link>
            <a
              href={whatsAppHref}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={locale === "ar" ? `تواصل مع ${officeName} عبر واتساب` : `Contact ${officeName} on WhatsApp`}
              className="inline-flex size-11 shrink-0 items-center justify-center rounded-lg bg-green-50 text-green-600 transition-colors [@media(hover:hover)]:hover:bg-green-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 active:scale-95"
            >
              <MessageCircle className="size-4" aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
    </motion.article>
  )
})
