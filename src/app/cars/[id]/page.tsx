"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useQuery } from "@tanstack/react-query"
import { Heart, Share2, Phone, MessageCircle, MapPin, Users, Gauge, Fuel, Calendar, Shield, Check, ArrowLeft, Star, ChevronLeft, ChevronRight } from "lucide-react"
import { motion } from "framer-motion"
import { useLocaleStore } from "@/store/useLocaleStore"
import { useWishlistStore } from "@/store/useWishlistStore"
import { useTranslation } from "@/lib/i18n"
import { carService } from "@/lib/supabase/services"
import { bookingSchema, type BookingFormData } from "@/lib/validations"
import { formatCurrency, cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Modal } from "@/components/ui/modal"
import { CarCard } from "@/components/shared/car-card"
import type { CarType } from "@/types"

export default function CarDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const { locale } = useLocaleStore()
  const { t } = useTranslation(locale)
  const { isWishlisted, toggleItem } = useWishlistStore()
  const [currentImage, setCurrentImage] = useState(0)
  const [showBooking, setShowBooking] = useState(false)
  const [bookingSuccess, setBookingSuccess] = useState(false)

  const { data: car, isLoading } = useQuery({
    queryKey: ["car", id],
    queryFn: () => carService.getById(id),
    enabled: !!id,
  })

  const { data: similarCars = [] } = useQuery({
    queryKey: ["cars", "similar", car?.brand],
    queryFn: () => carService.getAll({ brand: car?.brand }),
    enabled: !!car?.brand,
  })

  const wishlisted = car ? isWishlisted(car.id) : false

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<BookingFormData>({ resolver: zodResolver(bookingSchema) })

  const onSubmit = async (data: BookingFormData) => {
    await new Promise((r) => setTimeout(r, 1000))
    setBookingSuccess(true)
    reset()
    setTimeout(() => { setShowBooking(false); setBookingSuccess(false) }, 2000)
  }

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
  const similar = (similarCars as CarType[]).filter((sc) => sc.id !== c.id).slice(0, 4)

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
      <Link href="/cars" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-4"><ArrowLeft className="w-4 h-4" />{locale === "ar" ? "عودة للنتائج" : "Back to results"}</Link>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="relative rounded-2xl overflow-hidden bg-muted h-[300px] md:h-[400px]">
            <img src={c.images?.[currentImage] || "/placeholder.svg"} alt={locale === "ar" ? c.titleAr : c.titleEn} className="w-full h-full object-cover" />
            {c.images?.length > 1 && (
              <>
                <button onClick={() => setCurrentImage((p) => (p === 0 ? c.images.length - 1 : p - 1))} className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 flex items-center justify-center hover:bg-white"><ChevronRight className="w-5 h-5" /></button>
                <button onClick={() => setCurrentImage((p) => (p === c.images.length - 1 ? 0 : p + 1))} className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 flex items-center justify-center hover:bg-white"><ChevronLeft className="w-5 h-5" /></button>
              </>
            )}
            <div className="absolute bottom-3 right-1/2 translate-x-1/2 flex gap-1.5">
              {c.images?.map((_, i) => <button key={i} onClick={() => setCurrentImage(i)} className={cn("w-2 h-2 rounded-full transition-all", i === currentImage ? "bg-white w-6" : "bg-white/50")} />)}
            </div>
            <div className="absolute top-3 left-3 flex gap-2">
              <button onClick={() => toggleItem(c.id)} className="p-2 rounded-full bg-white/80 hover:bg-white"><Heart className={cn("w-5 h-5", wishlisted ? "fill-error text-error" : "")} /></button>
              <button className="p-2 rounded-full bg-white/80 hover:bg-white"><Share2 className="w-5 h-5" /></button>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <h1 className="text-2xl font-bold text-primary">{locale === "ar" ? c.titleAr : c.titleEn}</h1>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-lg font-bold text-secondary">{formatCurrency(c.pricePerDay, c.currency)}</span>
              <span className="text-sm text-muted-foreground">/ {t("cars.per_day")}</span>
              {c.availableNow && <Badge variant="success">{t("cars.available_now")}</Badge>}
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <h2 className="font-semibold text-primary mb-4">{t("car_details.specs")}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: Users, label: locale === "ar" ? "المقاعد" : "Seats", value: `${c.seats} ${t("cars.seats_label")}` },
                { icon: Gauge, label: locale === "ar" ? "ناقل الحركة" : "Transmission", value: c.transmission === "AUTOMATIC" ? t("cars.automatic") : t("cars.manual") },
                { icon: Fuel, label: locale === "ar" ? "الوقود" : "Fuel", value: c.fuelType === "GASOLINE" ? locale === "ar" ? "بنزين" : "Gasoline" : c.fuelType },
                { icon: Calendar, label: locale === "ar" ? "السنة" : "Year", value: c.year.toString() },
              ].map((spec) => (
                <div key={spec.label} className="text-center p-3 rounded-xl bg-muted">
                  <spec.icon className="w-5 h-5 mx-auto text-secondary mb-1" />
                  <p className="text-xs text-muted-foreground">{spec.label}</p>
                  <p className="text-sm font-semibold">{spec.value}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <h2 className="font-semibold text-primary mb-4">{t("car_details.features")}</h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { key: "airportDelivery", label: t("cars.airport_delivery"), value: c.airportDelivery },
                { key: "insurance", label: t("car_details.insurance"), value: c.insurance },
                { key: "gps", label: t("car_details.gps"), value: c.gps },
                { key: "bluetooth", label: t("car_details.bluetooth"), value: c.bluetooth },
                { key: "usbPort", label: t("car_details.usb"), value: c.usbPort },
                { key: "airConditioning", label: t("car_details.air_conditioning"), value: c.airConditioning },
              ].map((f) => (
                <div key={f.key} className={cn("flex items-center gap-2 p-2 rounded-lg", f.value ? "text-success" : "text-muted-foreground")}>
                  {f.value ? <Check className="w-4 h-4" /> : <div className="w-4 h-4 rounded-full border-2 border-muted-foreground/30" />}
                  <span className="text-sm">{f.label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <h2 className="font-semibold text-primary mb-3">{t("car_details.description")}</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">{locale === "ar" ? (c.descriptionAr || "لا يوجد وصف") : (c.descriptionEn || "No description")}</p>
          </div>
          {similar.length > 0 && (
            <div>
              <h2 className="font-semibold text-primary mb-4">{t("car_details.similar_cars")}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {similar.map((sc, i) => <CarCard key={sc.id} car={sc} index={i} />)}
              </div>
            </div>
          )}
        </div>
        <div className="space-y-4">
          {office && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sticky top-20">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-muted overflow-hidden">
                  {office.logo ? <img src={office.logo} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gradient-to-br from-secondary/20 to-blue-600/20 flex items-center justify-center text-lg font-bold text-secondary">{office.nameAr?.[0] || office.nameEn?.[0] || "O"}</div>}
                </div>
                <div>
                  <Link href={`/offices/${office.id}`} className="font-semibold text-primary hover:text-secondary">{locale === "ar" ? office.nameAr : office.nameEn}</Link>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Star className="w-3 h-3 text-accent fill-accent" /> {office.rating}</span>
                    {office.verified && <Badge variant="success"><Shield className="w-3 h-3 ml-1" />{t("car_details.verified")}</Badge>}
                  </div>
                </div>
              </div>
              <div className="space-y-2 mb-4 text-sm">
                <div className="flex justify-between py-2 border-b border-border"><span className="text-muted-foreground">{locale === "ar" ? "معدل الاستجابة" : "Response rate"}</span><span className="font-medium text-success">{office.responseRate}%</span></div>
                <div className="flex justify-between py-2 border-b border-border"><span className="text-muted-foreground">{locale === "ar" ? "وقت الاستجابة" : "Response time"}</span><span className="font-medium">{office.responseTime} {locale === "ar" ? "دقائق" : "min"}</span></div>
                <div className="flex justify-between py-2"><span className="text-muted-foreground">{locale === "ar" ? "السيارات" : "Total cars"}</span><span className="font-medium">{office.totalCars}</span></div>
              </div>
              <div className="space-y-2">
                <Button className="w-full" onClick={() => setShowBooking(true)}>{t("car_details.request_booking")}</Button>
                <a href={`tel:${office.phone}`} className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-medium text-gray-900 transition-all hover:bg-gray-50 active:scale-[0.98] w-full flex items-center justify-center gap-2"><Phone className="w-4 h-4" />{t("car_details.call")}</a>
                {office.whatsapp && (
                  <a href={`https://wa.me/${office.whatsapp.replace(/[^0-9]/g, "")}`} target="_blank" className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-medium text-gray-900 transition-all hover:bg-gray-50 active:scale-[0.98] w-full flex items-center justify-center gap-2 text-success border-success/30 hover:bg-success/5"><MessageCircle className="w-4 h-4" />{t("car_details.whatsapp")}</a>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      <Modal open={showBooking} onClose={() => { setShowBooking(false); setBookingSuccess(false) }} title={t("booking.title")}>
        {bookingSuccess ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4"><Check className="w-8 h-8 text-success" /></div>
            <p className="font-semibold text-lg">{t("booking.success")}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input id="customerName" label={t("booking.customer_name")} error={errors.customerName?.message} {...register("customerName")} />
            <Input id="customerPhone" label={t("booking.phone")} type="tel" error={errors.customerPhone?.message} {...register("customerPhone")} />
            <Input id="customerWhatsapp" label={t("booking.whatsapp")} type="tel" {...register("customerWhatsapp")} />
            <Input id="pickupLocation" label={t("booking.pickup_location")} {...register("pickupLocation")} />
            <div className="grid grid-cols-2 gap-2">
              <Input id="startDate" label={t("booking.start_date")} type="date" error={errors.startDate?.message} {...register("startDate")} />
              <Input id="endDate" label={t("booking.end_date")} type="date" error={errors.endDate?.message} {...register("endDate")} />
            </div>
            <Button type="submit" className="w-full" loading={isSubmitting}>{t("booking.submit")}</Button>
          </form>
        )}
      </Modal>
    </div>
  )
}
