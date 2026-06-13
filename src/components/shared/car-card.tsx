"use client"

import Link from "next/link"
import { Heart, Users, Gauge, Star, MapPin, MessageCircle } from "lucide-react"
import { motion } from "framer-motion"
import { useLocaleStore } from "@/store/useLocaleStore"
import { useWishlistStore } from "@/store/useWishlistStore"
import { useTranslation } from "@/lib/i18n"
import { useAuthStore } from "@/store/useAuthStore"
import { cn, formatCurrency, getCurrencyByCountry, openWhatsAppReservation } from "@/lib/utils"
import type { CarType } from "@/types"

interface CarCardProps {
  car: CarType
  index?: number
}

export function CarCard({ car, index = 0 }: CarCardProps) {
  const { locale } = useLocaleStore()
  const { t } = useTranslation(locale)
  const { isWishlisted, toggleItem } = useWishlistStore()
  const { profile } = useAuthStore()
  const wishlisted = isWishlisted(car.id)

  const handleReserve = () => {
    const userPhone = profile?.phone_number || ""
    openWhatsAppReservation(car, userPhone)
  }

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
              src={car.image || "/placeholder.svg"}
              alt={car.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            <div className="absolute top-3 right-3 flex flex-col gap-1.5 items-end">
              {car.status === "available" && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/90 backdrop-blur-sm px-3 py-1 text-[10px] font-semibold text-white shadow-lg">
                  {locale === "ar" ? "متاح الآن" : "Available Now"}
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
                <h3 className="font-semibold text-primary leading-snug line-clamp-1">{car.name}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{car.brand} {car.year}</p>
              </div>
              <div className="text-left shrink-0">
                  <p className="text-lg font-bold text-secondary">{formatCurrency(Number(car.price || 0), getCurrencyByCountry(car.office?.country).code)}</p>
                  <p className="text-[10px] text-muted-foreground">{car.rental_type === "monthly" ? (locale === "ar" ? "شهر" : "month") : t("cars.per_day")}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              {car.seats && (
                <span className="flex items-center gap-1.5 bg-muted px-2.5 py-1 rounded-lg">
                  <Users className="w-3.5 h-3.5 text-secondary" />
                  {car.seats}
                </span>
              )}
              {car.transmission && (
                <span className="flex items-center gap-1.5 bg-muted px-2.5 py-1 rounded-lg">
                  <Gauge className="w-3.5 h-3.5 text-secondary" />
                  {car.transmission === "AUTOMATIC" ? t("cars.automatic") : t("cars.manual")}
                </span>
              )}
            </div>

            {car.office && (
              <div className="flex items-center gap-2 pt-2 border-t border-gray-50">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-secondary/20 to-blue-600/20 flex items-center justify-center text-[10px] font-bold text-secondary">
                  {car.office.office_name?.[0] || "O"}
                </div>
                <span className="text-xs text-muted-foreground flex-1 truncate">
                  {car.office.office_name}
                </span>
                {(car.office.city || car.office.country) && (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="w-3 h-3" />
                    {car.office.city || car.office.country}
                  </span>
                )}
              </div>
            )}
            <button
              onClick={handleReserve}
              className="w-full mt-4 rounded-xl bg-secondary px-4 py-2.5 text-sm font-semibold text-white hover:bg-secondary/90 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              {locale === "ar" ? "احجز الآن" : "Reserve Now"}
            </button>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
