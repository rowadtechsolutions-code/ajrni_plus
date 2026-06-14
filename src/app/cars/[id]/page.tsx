"use client"

import { useParams } from "next/navigation"
import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import { Heart, Share2, Phone, MessageCircle, MapPin, Users, Gauge, Fuel, Calendar, ArrowLeft } from "lucide-react"
import { motion } from "framer-motion"
import { useLocaleStore } from "@/store/useLocaleStore"
import { useWishlistStore } from "@/store/useWishlistStore"
import { useAuthStore } from "@/store/useAuthStore"
import { useTranslation } from "@/lib/i18n"
import { carService } from "@/lib/supabase/services"
import { formatCurrency, cn, getCurrencyByCountry, openWhatsAppReservation } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { CarType } from "@/types"

export default function CarDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const { locale } = useLocaleStore()
  const { t } = useTranslation(locale)
  const { isWishlisted, toggleItem } = useWishlistStore()
  const { profile } = useAuthStore()

  const { data: car, isLoading } = useQuery({
    queryKey: ["car", id],
    queryFn: () => carService.getById(id),
    enabled: !!id,
  })

  const wishlisted = car ? isWishlisted(car.id) : false

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 animate-pulse">
        <div className="h-4 bg-muted rounded w-40 mb-4" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-[400px] bg-muted rounded-2xl" />
            <div className="h-32 bg-muted rounded-2xl" />
            <div className="h-48 bg-muted rounded-2xl" />
          </div>
          <div className="h-96 bg-muted rounded-2xl" />
        </div>
      </div>
    )
  }

  if (!car) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 text-center">
        <p className="text-muted-foreground">{locale === "ar" ? "السيارة غير موجودة" : "Car not found"}</p>
        <Link href="/cars" className="text-secondary hover:underline mt-2 inline-block">{locale === "ar" ? "عودة للسيارات" : "Back to cars"}</Link>
      </div>
    )
  }

  const c = car as CarType
  const office = c.office

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
      <Link href="/cars" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-4"><ArrowLeft className="w-4 h-4" />{locale === "ar" ? "عودة للنتائج" : "Back to results"}</Link>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="relative rounded-2xl overflow-hidden bg-muted h-[300px] md:h-[400px]">
            <img src={c.image || "/placeholder.svg"} alt={c.name} className="w-full h-full object-cover" />
            <div className="absolute top-3 left-3 flex gap-2">
              <button onClick={() => toggleItem(c.id)} className="p-2 rounded-full bg-white/80 hover:bg-white"><Heart className={cn("w-5 h-5", wishlisted ? "fill-error text-error" : "")} /></button>
              <button
                onClick={async () => {
                  const url = window.location.href
                  if (navigator.share) {
                    try { await navigator.share({ title: c.name, url }) } catch {}
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
                className="p-2 rounded-full bg-white/80 hover:bg-white"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <h1 className="text-2xl font-bold text-primary">{c.name}</h1>
            <div className="flex items-center gap-2 mt-2">
              {c.model && <span className="text-sm text-muted-foreground">{c.brand} {c.model} • {c.year}</span>}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-lg font-bold text-secondary">
                {formatCurrency(Number(c.price || 0), getCurrencyByCountry(office?.country).code)}
              </span>
              <span className="text-sm text-muted-foreground">{c.rental_type === "monthly" ? (locale === "ar" ? "/ شهر" : "/ month") : "/ " + t("cars.per_day")}</span>
              {c.status === "available" && <Badge variant="success">{t("cars.available_now")}</Badge>}
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <h2 className="font-semibold text-primary mb-4">{t("car_details.specs")}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: Users, label: locale === "ar" ? "المقاعد" : "Seats", value: c.seats ? `${c.seats}` : "-" },
                { icon: Gauge, label: locale === "ar" ? "القير" : "Transmission", value: c.transmission === "AUTOMATIC" ? t("cars.automatic") : c.transmission === "MANUAL" ? t("cars.manual") : "-" },
                { icon: Fuel, label: locale === "ar" ? "الوقود" : "Fuel", value: c.fuel_type === "GASOLINE" ? (locale === "ar" ? "بنزين" : "Gasoline") : c.fuel_type === "DIESEL" ? (locale === "ar" ? "ديزل" : "Diesel") : c.fuel_type === "ELECTRIC" ? (locale === "ar" ? "كهرباء" : "Electric") : c.fuel_type === "HYBRID" ? (locale === "ar" ? "هايبرد" : "Hybrid") : "-" },
                { icon: Calendar, label: locale === "ar" ? "السنة" : "Year", value: c.year?.toString() || "-" },
              ].map((spec) => (
                <div key={spec.label} className="text-center p-3 rounded-xl bg-muted">
                  <spec.icon className="w-5 h-5 mx-auto text-secondary mb-1" />
                  <p className="text-xs text-muted-foreground">{spec.label}</p>
                  <p className="text-sm font-semibold">{spec.value}</p>
                </div>
              ))}
            </div>
          </div>
          {c.color && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <h2 className="font-semibold text-primary mb-2">{locale === "ar" ? "اللون" : "Color"}</h2>
              <p className="text-sm text-muted-foreground">{c.color}</p>
            </div>
          )}
        </div>
        <div className="space-y-4">
          {office && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sticky top-20">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-secondary/20 to-blue-600/20 flex items-center justify-center text-lg font-bold text-secondary shrink-0 overflow-hidden">
                  {office.image ? (
                    <img src={office.image} alt={office.office_name || ""} className="w-full h-full object-cover" />
                  ) : (
                    office.office_name?.[0] || "O"
                  )}
                </div>
                <div>
                  <Link href={`/offices/${office.id}`} className="font-semibold text-primary hover:text-secondary">{office.office_name || (locale === "ar" ? "المكتب" : "Office")}</Link>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="w-3 h-3" />
                    {office.city || office.country || "-"}
                  </div>
                </div>
              </div>
              {office.bio && <p className="text-xs text-muted-foreground leading-relaxed mb-4">{office.bio}</p>}
              <div className="space-y-2">
                <a href={`tel:${office.phone_number}`} className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-6 py-3 text-sm font-medium hover:bg-gray-50 transition-all w-full">
                  <Phone className="w-4 h-4" />{t("car_details.call")}
                </a>
                <Button
                  className="w-full rounded-xl bg-success px-6 py-3 text-sm font-medium text-white hover:bg-success/90 transition-all flex items-center justify-center gap-2"
                  onClick={() => {
                    const userPhone = profile?.phone_number || ""
                    openWhatsAppReservation(c, userPhone)
                  }}
                >
                  <MessageCircle className="w-4 h-4" />{locale === "ar" ? "احجز الآن" : "Reserve Now"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
