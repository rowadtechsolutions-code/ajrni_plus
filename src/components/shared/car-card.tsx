"use client"

import { memo, useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { CarFront, Heart, Users, Gauge, MapPin, MessageCircle, Loader2 } from "lucide-react"
import { motion } from "framer-motion"
import { useLocaleStore } from "@/store/useLocaleStore"
import { useFavoriteStore } from "@/store/useFavoriteStore"
import { useTranslation } from "@/lib/i18n"
import { useAuthStore } from "@/store/useAuthStore"
import { cn, formatCurrency, getCurrencyByCountry, openWhatsAppReservation } from "@/lib/utils"
import type { CarType } from "@/types"

interface CarCardProps {
  car: CarType
  index?: number
  eagerImage?: boolean
}

interface PointerStart {
  id: number
  x: number
  y: number
}

const FALLBACK_IMAGE = "__car-card-fallback__"
const DRAG_INTENT_PX = 8
const POST_DRAG_CLICK_BLOCK_MS = 250

function getImageUrl(value: unknown): string | null {
  if (typeof value === "string") return value.trim() || null
  if (!value || typeof value !== "object") return null

  const image = value as Record<string, unknown>
  for (const key of ["url", "src", "image_url", "imageUrl"]) {
    const candidate = image[key]
    if (typeof candidate === "string" && candidate.trim()) return candidate.trim()
  }

  return null
}

export const CarCard = memo(function CarCard({ car, index = 0, eagerImage }: CarCardProps) {
  const { locale } = useLocaleStore()
  const isRTL = locale === "ar"
  const { t } = useTranslation(locale)
  const router = useRouter()
  const wishlisted = useFavoriteStore((state) => state.ids.includes(car.id))
  const toggleFavorite = useFavoriteStore((state) => state.toggleFavorite)
  const favoriteLoading = useFavoriteStore((state) => state.loading)
  const profile = useAuthStore((state) => state.profile)
  const user = useAuthStore((state) => state.user)
  const authLoading = useAuthStore((state) => state.loading)
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [hasInteracted, setHasInteracted] = useState(false)
  const [dragOffset, setDragOffset] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [favoritePending, setFavoritePending] = useState(false)
  const [failedImages, setFailedImages] = useState<Set<string>>(() => new Set())
  const [failedOfficeImage, setFailedOfficeImage] = useState(false)
  const pointerStartRef = useRef<PointerStart | null>(null)
  const dragDetectedRef = useRef(false)
  const suppressClickRef = useRef(false)
  const dragEndedAtRef = useRef(0)

  const galleryImages = useMemo(() => {
    const rawImages: unknown[] = [
      ...(Array.isArray(car.images) ? car.images : []),
      car.image,
    ]
    const uniqueImages = new Set<string>()

    rawImages.forEach((image) => {
      const url = getImageUrl(image)
      if (url) uniqueImages.add(url)
    })

    return uniqueImages.size > 0 ? Array.from(uniqueImages) : [FALLBACK_IMAGE]
  }, [car.image, car.images])

  const dotImageIndexes = useMemo(() => {
    const imageIndexes = galleryImages.map((_, imageIndex) => imageIndex)
    return isRTL ? imageIndexes.reverse() : imageIndexes
  }, [galleryImages, isRTL])

  const safeImageIndex = Math.min(activeImageIndex, galleryImages.length - 1)
  const activeImage = galleryImages[safeImageIndex]
  const displayedImage = failedImages.has(activeImage) ? FALLBACK_IMAGE : activeImage
  const detailHref = `/cars/${car.id}`
  const carSubtitle = [car.brand, car.model, car.year].filter(Boolean).join(" · ")
  const currency = getCurrencyByCountry(car.office?.country).code
  const shouldLoadEagerly = eagerImage ?? index < 3
  const favoriteBusy = authLoading || favoriteLoading || favoritePending

  useEffect(() => {
    if (!hasInteracted || galleryImages.length < 2) return

    const nextImage = galleryImages[safeImageIndex + 1]
    if (!nextImage || nextImage === FALLBACK_IMAGE || failedImages.has(nextImage)) return

    const preloader = new window.Image()
    preloader.decoding = "async"
    preloader.src = nextImage

    return () => {
      preloader.onload = null
      preloader.onerror = null
    }
  }, [failedImages, galleryImages, hasInteracted, safeImageIndex])

  const handleToggleFav = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    event.stopPropagation()
    if (favoriteBusy) return
    if (!user?.id) {
      router.push("/auth/login")
      return
    }

    setFavoritePending(true)
    try {
      await toggleFavorite(user.id, car.id)
    } finally {
      setFavoritePending(false)
    }
  }

  const handleReserve = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    event.stopPropagation()
    const userPhone = profile?.phone_number || ""
    openWhatsAppReservation(car, userPhone)
  }

  const handlePointerDown = (event: React.PointerEvent<HTMLAnchorElement>) => {
    if (galleryImages.length < 2) return
    if (event.pointerType === "mouse" && event.button !== 0) return

    suppressClickRef.current = false
    dragDetectedRef.current = false
    pointerStartRef.current = { id: event.pointerId, x: event.clientX, y: event.clientY }
    event.currentTarget.setPointerCapture(event.pointerId)
    setHasInteracted(true)
    setIsDragging(true)
  }

  const handlePointerMove = (event: React.PointerEvent<HTMLAnchorElement>) => {
    const start = pointerStartRef.current
    if (!start || start.id !== event.pointerId) return

    const deltaX = event.clientX - start.x
    const deltaY = event.clientY - start.y

    if (!dragDetectedRef.current) {
      const isHorizontalIntent = Math.abs(deltaX) >= DRAG_INTENT_PX && Math.abs(deltaX) > Math.abs(deltaY)
      if (!isHorizontalIntent) return
      dragDetectedRef.current = true
    }

    event.preventDefault()
    const maxOffset = event.currentTarget.clientWidth * 0.32
    setDragOffset(Math.max(-maxOffset, Math.min(maxOffset, deltaX)))
  }

  const finishPointerGesture = (event: React.PointerEvent<HTMLAnchorElement>, cancelled = false) => {
    const start = pointerStartRef.current
    if (!start || start.id !== event.pointerId) return

    const deltaX = event.clientX - start.x
    const wasDrag = dragDetectedRef.current
    const swipeThreshold = Math.min(64, event.currentTarget.clientWidth * 0.16)

    if (!cancelled && wasDrag && Math.abs(deltaX) >= swipeThreshold) {
      const moveToNext = isRTL ? deltaX > 0 : deltaX < 0
      setActiveImageIndex((current) => {
        if (moveToNext) return Math.min(current + 1, galleryImages.length - 1)
        return Math.max(current - 1, 0)
      })
    }

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }

    suppressClickRef.current = wasDrag
    dragEndedAtRef.current = wasDrag ? window.performance.now() : 0
    dragDetectedRef.current = false
    pointerStartRef.current = null
    setDragOffset(0)
    setIsDragging(false)
  }

  const handleImageClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (!suppressClickRef.current) return
    const isClickFromDrag = window.performance.now() - dragEndedAtRef.current <= POST_DRAG_CLICK_BLOCK_MS
    suppressClickRef.current = false
    dragEndedAtRef.current = 0
    if (!isClickFromDrag) return
    event.preventDefault()
    event.stopPropagation()
  }

  const handleImageError = () => {
    if (activeImage === FALLBACK_IMAGE) return
    setFailedImages((current) => {
      if (current.has(activeImage)) return current
      const next = new Set(current)
      next.add(activeImage)
      return next
    })
  }

  return (
    <motion.article
      data-car-card={car.id}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.28 }}
      className="h-full min-w-0"
      dir={locale === "ar" ? "rtl" : "ltr"}
    >
      <div className="group flex h-full min-w-0 flex-col rounded-xl border border-gray-100 bg-white shadow-sm transition-[transform,box-shadow,border-color] duration-200 [@media(hover:hover)]:hover:-translate-y-1 [@media(hover:hover)]:hover:border-gray-200 [@media(hover:hover)]:hover:shadow-lg">
        <div className="relative aspect-[16/10] w-full overflow-hidden rounded-t-xl bg-muted select-none touch-pan-y">
          <Link
            data-car-gallery
            data-gallery-size={galleryImages.length}
            data-active-image-index={safeImageIndex}
            href={detailHref}
            aria-label={locale === "ar" ? `عرض تفاصيل ${car.name}` : `View ${car.name} details`}
            className={cn("absolute inset-0 block touch-pan-y select-none", galleryImages.length > 1 && (isDragging ? "cursor-grabbing" : "cursor-grab"))}
            onPointerEnter={() => setHasInteracted(true)}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={(event) => finishPointerGesture(event)}
            onPointerCancel={(event) => finishPointerGesture(event, true)}
            onClick={handleImageClick}
            onDragStart={(event) => event.preventDefault()}
          >
            <motion.div
              key={displayedImage}
              initial={{ opacity: 0.72 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              style={{ x: dragOffset, scale: isDragging ? 1.015 : 1 }}
              className="pointer-events-none absolute inset-0"
            >
              {displayedImage === FALLBACK_IMAGE ? (
                <div className="flex size-full items-center justify-center bg-gradient-to-br from-slate-100 via-slate-50 to-slate-200 text-slate-400">
                  <CarFront className="size-14" aria-hidden="true" />
                </div>
              ) : (
                <Image
                  src={displayedImage}
                  alt={car.name}
                  fill
                  draggable={false}
                  loading={shouldLoadEagerly ? "eager" : "lazy"}
                  fetchPriority={shouldLoadEagerly && index === 0 ? "high" : "auto"}
                  decoding="async"
                  sizes="(max-width: 639px) calc(100vw - 2rem), (max-width: 1023px) 50vw, (max-width: 1279px) 33vw, 25vw"
                  className="object-cover"
                  onError={handleImageError}
                />
              )}
            </motion.div>
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-black/5" />
          </Link>

          <div className="pointer-events-none absolute start-3 top-3 z-10 flex flex-col items-start gap-1.5">
            {car.status === "available" ? (
              <span className="inline-flex items-center rounded-lg bg-emerald-600/90 px-2.5 py-1 text-[10px] font-semibold text-white shadow-sm backdrop-blur-sm">
                {locale === "ar" ? "متاح" : "Available"}
              </span>
            ) : car.status === "rented" ? (
              <span className="inline-flex items-center rounded-lg bg-amber-500/90 px-2.5 py-1 text-[10px] font-semibold text-white shadow-sm backdrop-blur-sm">
                {locale === "ar" ? "مؤجرة" : "Rented"}
              </span>
            ) : car.status === "maintenance" ? (
              <span className="inline-flex items-center rounded-lg bg-red-600/90 px-2.5 py-1 text-[10px] font-semibold text-white shadow-sm backdrop-blur-sm">
                {locale === "ar" ? "صيانة" : "Maintenance"}
              </span>
            ) : null}
          </div>

          <button
            data-car-favorite
            type="button"
            onClick={handleToggleFav}
            aria-label={wishlisted ? (locale === "ar" ? "إزالة من المفضلة" : "Remove from favorites") : (locale === "ar" ? "إضافة إلى المفضلة" : "Add to favorites")}
            aria-pressed={wishlisted}
            aria-busy={favoriteBusy}
            disabled={favoriteBusy}
            className="absolute end-3 top-3 z-20 inline-flex size-11 items-center justify-center rounded-full border border-white/70 bg-white/90 shadow-sm backdrop-blur-sm transition-[transform,background-color,box-shadow] [@media(hover:hover)]:hover:scale-105 [@media(hover:hover)]:hover:bg-white [@media(hover:hover)]:hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2 active:scale-95 disabled:cursor-wait disabled:opacity-75"
          >
            {favoriteBusy ? (
              <Loader2 className="size-4 animate-spin text-slate-500" aria-hidden="true" />
            ) : (
              <Heart className={cn("size-4.5 transition-colors", wishlisted ? "fill-error text-error" : "text-slate-600")} aria-hidden="true" />
            )}
          </button>

          {galleryImages.length > 1 && (
            <div className="pointer-events-none absolute inset-x-0 bottom-2.5 z-10 flex justify-center" dir="ltr" aria-hidden="true">
              {galleryImages.length <= 5 ? (
                <div className="flex items-center gap-1 rounded-full bg-black/20 px-1.5 py-1 backdrop-blur-sm">
                  {dotImageIndexes.map((imageIndex) => (
                    <span
                      key={galleryImages[imageIndex]}
                      className={cn(
                        "block size-1 rounded-full bg-white/45 transition-[width,opacity] duration-200",
                        imageIndex === safeImageIndex && "w-2 bg-white/95"
                      )}
                    />
                  ))}
                </div>
              ) : (
                <span className="rounded-full bg-black/45 px-2 py-0.5 text-[9px] font-medium tabular-nums text-white/95 backdrop-blur-sm">
                  {safeImageIndex + 1}/{galleryImages.length}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-3 p-3.5 sm:p-4">
          <Link href={detailHref} className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-start gap-3 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2">
            <div className="min-w-0">
              <h3 className="truncate text-[clamp(0.95rem,2.8vw,1.05rem)] font-semibold leading-6 text-primary">{car.name}</h3>
              {carSubtitle && <p className="mt-0.5 truncate text-xs text-muted-foreground">{carSubtitle}</p>}
            </div>
            <div className="shrink-0 text-end">
              <p className="whitespace-nowrap text-[clamp(1rem,3.4vw,1.125rem)] font-bold leading-6 text-secondary">
                {formatCurrency(Number(car.price || 0), currency)}
              </p>
              <p className="text-[10px] leading-4 text-muted-foreground">
                {car.rental_type === "monthly" ? (locale === "ar" ? "في الشهر" : "per month") : t("cars.per_day")}
              </p>
            </div>
          </Link>

          <div className="flex min-h-7 flex-wrap items-center gap-2 text-xs text-muted-foreground">
            {car.seats && (
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-muted px-2.5 py-1">
                <Users className="size-3.5 shrink-0 text-secondary" />
                <span>{car.seats}</span>
              </span>
            )}
            {car.transmission && (
              <span className="inline-flex min-w-0 items-center gap-1.5 rounded-lg bg-muted px-2.5 py-1">
                <Gauge className="size-3.5 shrink-0 text-secondary" />
                <span className="truncate">{car.transmission === "AUTOMATIC" ? t("cars.automatic") : t("cars.manual")}</span>
              </span>
            )}
          </div>

          {car.office && (
            <div className="flex min-w-0 items-center gap-2 border-t border-gray-100 pt-3">
              {car.office.image && !failedOfficeImage ? (
                <Image
                  src={car.office.image}
                  alt=""
                  width={28}
                  height={28}
                  className="size-7 shrink-0 rounded-lg object-cover"
                  loading="lazy"
                  decoding="async"
                  onError={() => setFailedOfficeImage(true)}
                />
              ) : (
                <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-secondary/20 to-blue-600/20 text-[10px] font-bold text-secondary">
                  {car.office.office_name?.[0] || "O"}
                </div>
              )}
              <span className="min-w-0 flex-1 truncate text-xs text-muted-foreground">
                {car.office.office_name}
              </span>
              {(car.office.city || car.office.country) && (
                <span className="flex min-w-0 max-w-[45%] items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="size-3 shrink-0" />
                  <span className="truncate">{car.office.city || car.office.country}</span>
                </span>
              )}
            </div>
          )}

          <button
            data-car-reserve
            type="button"
            onClick={handleReserve}
            className="mt-auto flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-secondary px-4 py-2.5 text-sm font-semibold text-white transition-colors [@media(hover:hover)]:hover:bg-secondary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2 active:scale-[0.99]"
          >
            <MessageCircle className="size-4 shrink-0" />
            {locale === "ar" ? "احجز الآن" : "Reserve Now"}
          </button>
        </div>
      </div>
    </motion.article>
  )
})
