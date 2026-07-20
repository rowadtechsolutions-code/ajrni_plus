"use client"

import { useState, useCallback, useEffect, useMemo } from "react"
import Image from "next/image"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  CarFront,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Fuel,
  Gauge,
  Heart,
  Loader2,
  MapPin,
  MessageCircle,
  Palette,
  Phone,
  Share2,
  Users,
  X,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useLocaleStore } from "@/store/useLocaleStore"
import { useFavoriteStore } from "@/store/useFavoriteStore"
import { useAuthStore } from "@/store/useAuthStore"
import { useTranslation } from "@/lib/i18n"
import { carService } from "@/lib/supabase/services"
import { cn, getCurrencyByCountry, openWhatsAppReservation } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CurrencyAmount } from "@/components/shared/currency-symbol"
import type { CarType } from "@/types"

const FALLBACK_IMAGE = "__car-details-fallback__"

export default function CarDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { locale } = useLocaleStore()
  const { t } = useTranslation(locale)
  const favoriteIds = useFavoriteStore((state) => state.ids)
  const toggleFavorite = useFavoriteStore((state) => state.toggleFavorite)
  const favoriteLoading = useFavoriteStore((state) => state.loading)
  const profile = useAuthStore((state) => state.profile)
  const user = useAuthStore((state) => state.user)
  const authLoading = useAuthStore((state) => state.loading)

  const { data: car, isLoading } = useQuery({
    queryKey: ["car", id],
    queryFn: () => carService.getById(id),
    enabled: !!id,
  })

  const [selectedImage, setSelectedImage] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set())
  const [failedOfficeImage, setFailedOfficeImage] = useState(false)
  const [favoritePending, setFavoritePending] = useState(false)
  const wishlisted = car ? favoriteIds.includes(car.id) : false
  const favoriteBusy = authLoading || favoriteLoading || favoritePending

  const validImages = useMemo(() => {
    if (!car) return [FALLBACK_IMAGE]
    const currentCar = car as CarType
    const raw = [
      ...(Array.isArray(currentCar.images) ? currentCar.images : []),
      ...(currentCar.image ? [currentCar.image] : []),
    ]
    const unique = Array.from(new Set(raw.filter((url): url is string => Boolean(url && url.trim()))))
    return unique.length > 0 ? unique : [FALLBACK_IMAGE]
  }, [car])

  const goNext = useCallback(() => {
    setLightboxIndex((previous) => (previous + 1) % validImages.length)
  }, [validImages.length])

  const goPrev = useCallback(() => {
    setLightboxIndex((previous) => (previous - 1 + validImages.length) % validImages.length)
  }, [validImages.length])

  const handleFavorite = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation()
    if (favoriteBusy) return
    if (!user?.id) {
      router.push("/auth/login")
      return
    }

    setFavoritePending(true)
    try {
      await toggleFavorite(user.id, id)
    } finally {
      setFavoritePending(false)
    }
  }

  useEffect(() => {
    if (!lightboxOpen) return
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setLightboxOpen(false)
      if (event.key === "ArrowRight") goNext()
      if (event.key === "ArrowLeft") goPrev()
    }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [lightboxOpen, goNext, goPrev])

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-7xl animate-pulse px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
        <div className="mb-4 h-5 w-40 rounded bg-muted" />
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.65fr)_minmax(300px,0.85fr)] xl:gap-8">
          <div className="space-y-5">
            <div className="aspect-[16/10] rounded-xl bg-muted" />
            <div className="h-28 rounded-xl bg-muted" />
            <div className="h-52 rounded-xl bg-muted" />
          </div>
          <div className="h-96 rounded-xl bg-muted" />
        </div>
      </div>
    )
  }

  if (!car) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center sm:px-6 lg:px-8">
        <p className="text-muted-foreground">{locale === "ar" ? "السيارة غير موجودة" : "Car not found"}</p>
        <Link href="/cars" className="mt-2 inline-block text-secondary hover:underline">{locale === "ar" ? "عودة للسيارات" : "Back to cars"}</Link>
      </div>
    )
  }

  const currentCar = car as CarType
  const office = currentCar.office
  const currency = getCurrencyByCountry(office?.country)
  const selectedImageUrl = validImages[selectedImage] || FALLBACK_IMAGE
  const selectedImageFailed = selectedImageUrl === FALLBACK_IMAGE || failedImages.has(selectedImageUrl)
  const carSubtitle = [currentCar.brand, currentCar.model, currentCar.year].filter(Boolean).join(" · ")
  const rentalUnit = currentCar.rental_type === "monthly"
    ? locale === "ar" ? "/ شهر" : "/ month"
    : `/ ${t("cars.per_day")}`
  const specifications = [
    { icon: Users, label: locale === "ar" ? "المقاعد" : "Seats", value: currentCar.seats ? `${currentCar.seats}` : "-" },
    { icon: Gauge, label: locale === "ar" ? "القير" : "Transmission", value: currentCar.transmission === "AUTOMATIC" ? t("cars.automatic") : currentCar.transmission === "MANUAL" ? t("cars.manual") : "-" },
    { icon: Fuel, label: locale === "ar" ? "الوقود" : "Fuel", value: currentCar.fuel_type === "GASOLINE" ? (locale === "ar" ? "بنزين" : "Gasoline") : currentCar.fuel_type === "DIESEL" ? (locale === "ar" ? "ديزل" : "Diesel") : currentCar.fuel_type === "ELECTRIC" ? (locale === "ar" ? "كهرباء" : "Electric") : currentCar.fuel_type === "HYBRID" ? (locale === "ar" ? "هايبرد" : "Hybrid") : "-" },
    { icon: Calendar, label: locale === "ar" ? "السنة" : "Year", value: currentCar.year?.toString() || "-" },
    { icon: Palette, label: locale === "ar" ? "اللون" : "Color", value: currentCar.color || "-" },
    { icon: Clock3, label: locale === "ar" ? "نوع التأجير" : "Rental Type", value: currentCar.rental_type === "monthly" ? (locale === "ar" ? "شهري" : "Monthly") : (locale === "ar" ? "يومي" : "Daily") },
  ]

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
      <Link href="/cars" className="mb-4 inline-flex min-h-11 items-center gap-1.5 rounded-lg px-1 text-sm text-muted-foreground transition-colors [@media(hover:hover)]:hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2">
        <ArrowLeft className="size-4" aria-hidden="true" />
        {locale === "ar" ? "عودة للنتائج" : "Back to results"}
      </Link>

      <div className="grid min-w-0 items-start gap-5 lg:grid-cols-[minmax(0,1.65fr)_minmax(300px,0.85fr)] xl:gap-8">
        <section aria-label={locale === "ar" ? "صور السيارة" : "Car images"} className="min-w-0 space-y-3 lg:col-start-1">
          <div data-car-details-gallery className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-muted">
            <button
              type="button"
              aria-label={locale === "ar" ? `فتح صورة ${currentCar.name}` : `Open ${currentCar.name} image`}
              onClick={() => { setLightboxIndex(selectedImage); setLightboxOpen(true) }}
              className="absolute inset-0 z-0 block size-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-secondary"
            >
              {selectedImageFailed ? (
                <span className="flex size-full items-center justify-center bg-gradient-to-br from-slate-100 via-slate-50 to-slate-200 text-slate-400">
                  <CarFront className="size-16" aria-hidden="true" />
                </span>
              ) : (
                <Image
                  src={selectedImageUrl}
                  alt={currentCar.name}
                  fill
                  loading="eager"
                  fetchPriority="high"
                  sizes="(max-width: 1023px) calc(100vw - 2rem), (max-width: 1279px) 62vw, 760px"
                  className="object-cover"
                  onError={() => setFailedImages((previous) => new Set(previous).add(selectedImageUrl))}
                />
              )}
              <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-black/5" />
            </button>

            <div className="absolute end-3 top-3 z-20 flex items-center gap-2">
              <button
                type="button"
                onClick={handleFavorite}
                aria-label={wishlisted ? (locale === "ar" ? "إزالة من المفضلة" : "Remove from favorites") : (locale === "ar" ? "إضافة إلى المفضلة" : "Add to favorites")}
                aria-pressed={wishlisted}
                aria-busy={favoriteBusy}
                disabled={favoriteBusy}
                className="inline-flex size-11 items-center justify-center rounded-full border border-white/70 bg-white/90 text-slate-600 shadow-sm backdrop-blur-sm transition-[transform,background-color,box-shadow] [@media(hover:hover)]:hover:scale-105 [@media(hover:hover)]:hover:bg-white [@media(hover:hover)]:hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2 active:scale-95 disabled:cursor-wait disabled:opacity-75"
              >
                {favoriteBusy ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <Heart className={cn("size-4.5", wishlisted && "fill-error text-error")} aria-hidden="true" />}
              </button>
              <button
                type="button"
                aria-label={locale === "ar" ? "مشاركة السيارة" : "Share car"}
                onClick={async (event) => {
                  event.stopPropagation()
                  const url = window.location.href
                  if (navigator.share) {
                    try { await navigator.share({ title: currentCar.name, url }) } catch {}
                  } else {
                    try {
                      await navigator.clipboard.writeText(url)
                      alert(locale === "ar" ? "تم نسخ الرابط" : "Link copied")
                    } catch {
                      const input = document.createElement("input")
                      input.value = url
                      document.body.appendChild(input)
                      input.select()
                      document.execCommand("copy")
                      document.body.removeChild(input)
                      alert(locale === "ar" ? "تم نسخ الرابط" : "Link copied")
                    }
                  }
                }}
                className="inline-flex size-11 items-center justify-center rounded-full border border-white/70 bg-white/90 text-slate-600 shadow-sm backdrop-blur-sm transition-[transform,background-color,box-shadow] [@media(hover:hover)]:hover:scale-105 [@media(hover:hover)]:hover:bg-white [@media(hover:hover)]:hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2 active:scale-95"
              >
                <Share2 className="size-4.5" aria-hidden="true" />
              </button>
            </div>
          </div>

          {validImages.length > 1 && (
            <div data-car-thumbnails className="flex max-w-full gap-2 overflow-x-auto pb-2 pt-0.5" aria-label={locale === "ar" ? "الصور المصغرة" : "Thumbnails"}>
              {validImages.map((imageUrl, imageIndex) => {
                const imageFailed = imageUrl === FALLBACK_IMAGE || failedImages.has(imageUrl)
                return (
                  <button
                    key={`${imageUrl}-${imageIndex}`}
                    type="button"
                    aria-label={locale === "ar" ? `فتح الصورة ${imageIndex + 1}` : `Open image ${imageIndex + 1}`}
                    aria-current={selectedImage === imageIndex ? "true" : undefined}
                    onClick={() => { setSelectedImage(imageIndex); setLightboxIndex(imageIndex); setLightboxOpen(true) }}
                    className={cn(
                      "relative aspect-[3/2] w-24 shrink-0 overflow-hidden rounded-lg border-2 bg-muted transition-[border-color,opacity,box-shadow] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2",
                      selectedImage === imageIndex ? "border-secondary ring-2 ring-secondary/20" : "border-gray-200 opacity-75 [@media(hover:hover)]:hover:opacity-100"
                    )}
                  >
                    {imageFailed ? (
                      <span className="flex size-full items-center justify-center text-slate-400"><CarFront className="size-6" aria-hidden="true" /></span>
                    ) : (
                      <Image src={imageUrl} alt="" fill loading="lazy" sizes="96px" className="object-cover" onError={() => setFailedImages((previous) => new Set(previous).add(imageUrl))} />
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </section>

        <section aria-labelledby="car-title" className="min-w-0 rounded-t-xl border border-b-0 border-gray-100 bg-white p-4 pb-2 shadow-sm md:rounded-xl md:border-b md:p-5 lg:col-start-1">
          <div className="flex min-w-0 flex-wrap items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h1 id="car-title" className="text-[clamp(1.5rem,4vw,2rem)] font-bold leading-tight text-primary">{currentCar.name}</h1>
              {carSubtitle && <p className="mt-1 truncate text-sm text-muted-foreground">{carSubtitle}</p>}
            </div>
            {currentCar.status === "available" ? (
              <Badge variant="success">{locale === "ar" ? "متاح" : "Available"}</Badge>
            ) : currentCar.status === "rented" ? (
              <Badge variant="warning">{locale === "ar" ? "مؤجرة" : "Rented"}</Badge>
            ) : currentCar.status === "maintenance" ? (
              <Badge variant="error">{locale === "ar" ? "صيانة" : "Maintenance"}</Badge>
            ) : null}
          </div>
        </section>

        <aside className="contents md:block md:min-w-0 lg:col-start-2 lg:row-start-1 lg:row-span-3 lg:sticky lg:top-24">
          <div data-booking-card className="contents md:block md:rounded-xl md:border md:border-gray-100 md:bg-white md:p-5 md:shadow-sm">
            <div className="-mt-5 flex min-w-0 items-end justify-between gap-3 rounded-b-xl border border-t-0 border-gray-100 bg-white px-4 pb-4 pt-1 shadow-sm md:mt-0 md:rounded-none md:border-x-0 md:border-t-0 md:bg-transparent md:px-0 md:pt-0 md:shadow-none">
              <div className="min-w-0">
                <p className="text-xs font-medium text-muted-foreground">{locale === "ar" ? "سعر التأجير" : "Rental price"}</p>
                <p className="mt-1 whitespace-nowrap text-[clamp(1.5rem,5vw,2rem)] font-bold leading-none text-secondary">
                  <CurrencyAmount amount={Number(currentCar.price || 0)} currency={currency.code} size="detail" />
                </p>
              </div>
              <span className="shrink-0 text-sm text-muted-foreground">{rentalUnit}</span>
            </div>

            {office && (
              <div className="order-last min-w-0 rounded-xl border border-gray-100 bg-white p-4 shadow-sm md:order-none md:rounded-none md:border-0 md:bg-transparent md:p-0 md:pt-4 md:shadow-none">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="relative flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-gradient-to-br from-secondary/15 to-blue-600/15 text-base font-bold text-secondary shadow-sm">
                    {office.image && !failedOfficeImage ? (
                      <Image src={office.image} alt="" fill loading="lazy" sizes="56px" className="object-cover" onError={() => setFailedOfficeImage(true)} />
                    ) : (
                      office.office_name?.[0] || "O"
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <Link href={`/offices/${office.id}`} className="block truncate font-semibold text-primary transition-colors [@media(hover:hover)]:hover:text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2">
                      {office.office_name || (locale === "ar" ? "المكتب" : "Office")}
                    </Link>
                    <p className="mt-0.5 flex min-w-0 items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="size-3 shrink-0" aria-hidden="true" />
                      <span className="truncate">{[office.city, office.country].filter(Boolean).join(", ") || "-"}</span>
                    </p>
                  </div>
                </div>

                {office.bio && <p dir="auto" className="mt-4 text-sm leading-6 text-muted-foreground line-clamp-2 overflow-hidden text-start">{office.bio}</p>}

                <div className="mt-4 grid grid-cols-2 gap-2">
                  <Link href={`/offices/${office.id}`} className="inline-flex min-h-11 items-center justify-center rounded-lg border border-gray-200 px-3 text-sm font-medium text-primary transition-colors [@media(hover:hover)]:hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2">
                    {locale === "ar" ? "عرض المكتب" : "View Office"}
                  </Link>
                  <a href={`tel:${office.phone_number}`} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-gray-200 px-3 text-sm font-medium text-primary transition-colors [@media(hover:hover)]:hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2">
                    <Phone className="size-4" aria-hidden="true" />{t("car_details.call")}
                  </a>
                </div>
                <Button
                  data-reserve-button
                  className="mt-2 flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-success px-6 py-3 text-sm font-semibold text-white transition-colors [@media(hover:hover)]:hover:bg-success/90 focus-visible:ring-2 focus-visible:ring-success focus-visible:ring-offset-2"
                  onClick={() => {
                    const userPhone = profile?.phone_number || ""
                    openWhatsAppReservation(currentCar, userPhone)
                  }}
                >
                  <MessageCircle className="size-4" aria-hidden="true" />{locale === "ar" ? "احجز الآن" : "Reserve Now"}
                </Button>
              </div>
            )}
          </div>
        </aside>

        <section aria-labelledby="specifications-title" className="min-w-0 rounded-xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5 lg:col-start-1">
          <h2 id="specifications-title" className="mb-4 text-lg font-semibold text-primary">{t("car_details.specs")}</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {specifications.map((specification) => (
              <div key={specification.label} className="flex min-w-0 items-center gap-3 rounded-lg bg-muted p-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white text-secondary shadow-sm">
                  <specification.icon className="size-4.5" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-xs text-muted-foreground">{specification.label}</p>
                  <p className="truncate text-sm font-semibold text-primary">{specification.value}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={locale === "ar" ? "عارض صور السيارة" : "Car image viewer"}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
            onClick={() => setLightboxOpen(false)}
          >
            <button
              type="button"
              aria-label={locale === "ar" ? "إغلاق عارض الصور" : "Close image viewer"}
              onClick={() => setLightboxOpen(false)}
              className="absolute end-4 top-4 z-10 inline-flex size-11 items-center justify-center rounded-full bg-white/10 text-white transition-colors [@media(hover:hover)]:hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <X className="size-6" aria-hidden="true" />
            </button>
            {validImages.length > 1 && (
              <>
                <button
                  type="button"
                  aria-label={locale === "ar" ? "الصورة السابقة" : "Previous image"}
                  onClick={(event) => { event.stopPropagation(); goPrev() }}
                  className="absolute left-4 z-10 inline-flex size-11 items-center justify-center rounded-full bg-white/10 text-white transition-colors [@media(hover:hover)]:hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  <ChevronLeft className="size-6" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  aria-label={locale === "ar" ? "الصورة التالية" : "Next image"}
                  onClick={(event) => { event.stopPropagation(); goNext() }}
                  className="absolute right-4 z-10 inline-flex size-11 items-center justify-center rounded-full bg-white/10 text-white transition-colors [@media(hover:hover)]:hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  <ChevronRight className="size-6" aria-hidden="true" />
                </button>
              </>
            )}
            <motion.div
              key={lightboxIndex}
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              transition={{ duration: 0.2 }}
              className="relative flex h-[min(85vh,800px)] w-full max-w-4xl items-center justify-center"
              onClick={(event) => event.stopPropagation()}
            >
              {validImages[lightboxIndex] === FALLBACK_IMAGE || failedImages.has(validImages[lightboxIndex]) ? (
                <div className="flex flex-col items-center gap-2 text-white/60">
                  <AlertCircle className="size-12" aria-hidden="true" />
                  <span className="text-sm">{locale === "ar" ? "فشل تحميل الصورة" : "Failed to load image"}</span>
                </div>
              ) : (
                <Image
                  src={validImages[lightboxIndex]}
                  alt={currentCar.name}
                  fill
                  loading="eager"
                  sizes="90vw"
                  className="rounded-lg object-contain"
                  onError={() => setFailedImages((previous) => new Set(previous).add(validImages[lightboxIndex]))}
                />
              )}
            </motion.div>
            {validImages.length > 1 && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-4 py-2 text-sm text-white">
                {lightboxIndex + 1} / {validImages.length}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
