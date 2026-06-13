"use client"

import { useParams } from "next/navigation"
import Link from "next/link"
import { Shield, Phone, MessageCircle, MapPin } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { useLocaleStore } from "@/store/useLocaleStore"
import { useTranslation } from "@/lib/i18n"
import { officeService } from "@/lib/supabase/services"
import { getCountryByCode } from "@/lib/locations"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export default function OfficePage() {
  const { id } = useParams<{ id: string }>()
  const { locale } = useLocaleStore()
  const { t } = useTranslation(locale)

  const { data: office, isLoading } = useQuery({
    queryKey: ["office", id],
    queryFn: () => officeService.getById(id),
    enabled: !!id,
  })

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-48 md:h-64 bg-muted" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-12 relative z-10">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 h-40" />
        </div>
      </div>
    )
  }

  if (!office) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 text-center">
        <p className="text-muted-foreground">{locale === "ar" ? "المكتب غير موجود" : "Office not found"}</p>
        <Link href="/offices" className="text-secondary hover:underline mt-2 inline-block">{locale === "ar" ? "عودة للمكاتب" : "Back to offices"}</Link>
      </div>
    )
  }

  const o = office as any
  const countryObj = o.country ? getCountryByCode(o.country) : null
  const countryName = countryObj ? (locale === "ar" ? countryObj.nameAr : countryObj.nameEn) : o.country

  return (
    <div>
      <div className="relative h-48 md:h-64 bg-gradient-to-br from-primary to-secondary" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-12 relative z-10">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <div className="flex flex-col sm:flex-row items-start gap-4">
            <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gradient-to-br from-secondary/20 to-blue-600/20 shrink-0 border-4 border-white shadow-md flex items-center justify-center text-3xl font-bold text-secondary">
              {o.office_name?.[0] || "O"}
            </div>
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <h1 className="text-2xl font-bold text-primary">{o.office_name}</h1>
                {o.is_active && <Badge variant="success"><Shield className="w-3 h-3 ml-1" />{t("car_details.verified")}</Badge>}
              </div>
              <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1"><MapPin className="w-3 h-3" />{o.city}, {countryName}</p>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <a href={`tel:${o.phone_number}`} className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-medium text-gray-900 transition-all hover:bg-gray-50 active:scale-[0.98] flex-1 sm:flex-initial"><Phone className="w-4 h-4" /></a>
              <a href={`https://wa.me/${o.phone_number?.replace(/[^0-9]/g, "")}`} target="_blank" className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-medium text-gray-900 transition-all hover:bg-gray-50 active:scale-[0.98] flex-1 sm:flex-initial text-success"><MessageCircle className="w-4 h-4" /></a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
