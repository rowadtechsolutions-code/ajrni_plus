"use client"

import { useQuery } from "@tanstack/react-query"
import { useLocaleStore } from "@/store/useLocaleStore"
import { useTranslation } from "@/lib/i18n"
import { carService } from "@/lib/supabase/services"
import { getCurrencyByCountry } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { CurrencyAmount } from "@/components/shared/currency-symbol"
import type { CarType } from "@/types"

export default function AdminCarsPage() {
  const { locale } = useLocaleStore()
  const { t } = useTranslation(locale)

  const { data: cars = [], isLoading } = useQuery({
    queryKey: ["admin-cars"],
    queryFn: () => carService.getAll(),
  })

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-xl font-bold text-primary mb-6">{t("admin.cars")}</h1>
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground animate-pulse">{locale === "ar" ? "جاري التحميل..." : "Loading..."}</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-right p-3 font-medium text-muted-foreground">{locale === "ar" ? "السيارة" : "Car"}</th>
                <th className="text-right p-3 font-medium text-muted-foreground">{locale === "ar" ? "المكتب" : "Office"}</th>
                <th className="text-right p-3 font-medium text-muted-foreground">{t("cars.price")}</th>
                <th className="text-right p-3 font-medium text-muted-foreground">{locale === "ar" ? "الحالة" : "Status"}</th>
              </tr>
            </thead>
            <tbody>
              {(cars as CarType[]).map((car) => (
                <tr key={car.id} className="border-b border-border hover:bg-muted/50">
                  <td className="p-3 font-medium">{car.name}</td>
                  <td className="p-3 text-muted-foreground">{car.office?.office_name || "-"}</td>
                  <td className="p-3 font-semibold text-secondary"><CurrencyAmount amount={Number(car.price || 0)} currency={getCurrencyByCountry(car.office?.country).code} size="compact" /> {car.rental_type === "monthly" ? "/شهر" : ""}</td>
                  <td className="p-3"><Badge variant={car.status === "available" ? "success" : "warning"}>{car.status === "available" ? (locale === "ar" ? "متاح" : "Available") : (locale === "ar" ? "محجوز" : "Booked")}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
