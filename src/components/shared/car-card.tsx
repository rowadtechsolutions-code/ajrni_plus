"use client"

import Link from "next/link"
import { Heart, MapPin, Users, Gauge, Star, Shield, Zap, CheckCircle } from "lucide-react"
import { motion } from "framer-motion"
import { useLocaleStore } from "@/store/useLocaleStore"
import { useWishlistStore } from "@/store/useWishlistStore"
import { useTranslation } from "@/lib/i18n"
import { cn, formatCurrency, getImageUrl } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import type { CarType } from "@/types"

interface CarCardProps {
  car: CarType
  index?: number
}

export function CarCard({ car, index = 0 }: CarCardProps) {
  const { locale } = useLocaleStore()
  const { t } = useTranslation(locale)
  const { isWishlisted, toggleItem } = useWishlistStore()
  const wishlisted = isWishlisted(car.id)

  const title = locale === "ar" ? car.titleAr : car.titleEn

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, type: "spring", stiffness: 100 }}
      whileHover={{ y: -4 }}
      className="h-full"
    >
      <Link href={`/cars/${car.id}`} className="block h-full">
        <div className="relative h-full bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-gray-200 transition-all duration-300 overflow-hidden group">
          <div className="relative h-48 overflow-hidden">
            <img
              src={getImageUrl(car.images[0])}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            <div className="absolute top-3 right-3 flex flex-col gap-1.5 items-end">
              {car.availableNow && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/90 backdrop-blur-sm px-3 py-1 text-[10px] font-semibold text-white shadow-lg">
                  <Zap className="w-3 h-3" />
                  {locale === "ar" ? "متاح الآن" : "Available Now"}
                </span>
              )}
              {car.featured && (
                <span className="inline-flex items-center gap-1 rounded-full bg-accent/90 backdrop-blur-sm px-3 py-1 text-[10px] font-semibold text-white shadow-lg">
                  <Star className="w-3 h-3" />
                  {locale === "ar" ? "أفضل عرض" : "Best Deal"}
                </span>
              )}
              {car.office?.verified && (
                <span className="inline-flex items-center gap-1 rounded-full bg-secondary/90 backdrop-blur-sm px-3 py-1 text-[10px] font-semibold text-white shadow-lg">
                  <Shield className="w-3 h-3" />
                  {locale === "ar" ? "موثق" : "Verified"}
                </span>
              )}
            </div>
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleItem(car.id) }}
              className="absolute top-3 left-3 p-2.5 rounded-2xl bg-white/80 backdrop-blur-sm hover:bg-white shadow-lg transition-all hover:scale-110 active:scale-95"
            >
              <Heart className={cn("w-4 h-4 transition-colors", wishlisted ? "fill-error text-error" : "text-muted-foreground")} />
            </button>
          </div>

          <div className="p-4 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-primary leading-snug line-clamp-1">{title}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{car.brand} {car.model} {car.year}</p>
              </div>
              <div className="text-left shrink-0">
                <p className="text-lg font-bold text-secondary">{formatCurrency(car.pricePerDay, car.currency)}</p>
                <p className="text-[10px] text-muted-foreground">{t("cars.per_day")}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5 bg-muted px-2.5 py-1 rounded-lg">
                <Users className="w-3.5 h-3.5 text-secondary" />
                {car.seats}
              </span>
              <span className="flex items-center gap-1.5 bg-muted px-2.5 py-1 rounded-lg">
                <Gauge className="w-3.5 h-3.5 text-secondary" />
                {car.transmission === "AUTOMATIC" ? t("cars.automatic") : t("cars.manual")}
              </span>
              {car.airportDelivery && (
                <span className="flex items-center gap-1 bg-info/10 text-info px-2.5 py-1 rounded-lg font-medium">
                  <CheckCircle className="w-3 h-3" />
                  <span className="text-[10px]">{locale === "ar" ? "توصيل مطار" : "Airport"}</span>
                </span>
              )}
            </div>

            {car.office && (
              <div className="flex items-center gap-2 pt-2 border-t border-gray-50">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-secondary/20 to-blue-600/20 flex items-center justify-center text-[10px] font-bold text-secondary">
                  {car.office.nameAr?.[0] || car.office.nameEn?.[0] || "O"}
                </div>
                <span className="text-xs text-muted-foreground flex-1 truncate">
                  {locale === "ar" ? car.office.nameAr : car.office.nameEn}
                </span>
                {car.office.rating && (
                  <span className="flex items-center gap-1 text-xs text-accent font-medium">
                    <Star className="w-3 h-3 fill-accent" />
                    {car.office.rating}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
