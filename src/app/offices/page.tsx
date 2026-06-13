"use client"

import { useState } from "react"
import Link from "next/link"
import { Search, MapPin, Shield, Building2, MessageCircle } from "lucide-react"
import { motion } from "framer-motion"
import { useQuery } from "@tanstack/react-query"
import { useLocaleStore } from "@/store/useLocaleStore"
import { useTranslation } from "@/lib/i18n"
import { officeService } from "@/lib/supabase/services"
import { getCountryByCode } from "@/lib/locations"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { OfficeType } from "@/types"

const officeImages = [
  "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=400",
  "https://images.unsplash.com/photo-1556189250-72ba954cfc2b?w=400",
  "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=400",
  "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?w=400",
  "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=400",
  "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400",
]

export default function OfficesPage() {
  const { locale } = useLocaleStore()
  const { t } = useTranslation(locale)
  const [search, setSearch] = useState("")

  const { data: offices = [], isLoading } = useQuery({
    queryKey: ["offices"],
    queryFn: () => officeService.getActive(),
  })

  const filtered = (offices as any[]).filter((office) => {
    return office.office_name.toLowerCase().includes(search.toLowerCase())
  })

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 text-secondary text-xs font-medium mb-4">
            <Building2 className="w-3 h-3" />
            {locale === "ar" ? "مكاتب موثقة" : "Verified Offices"}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-primary mb-3">{t("offices_page.title")}</h1>
          <p className="text-muted-foreground">{t("offices_page.subtitle")}</p>
        </div>
        <div className="relative max-w-md mx-auto">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("offices_page.search_placeholder")}
            className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all pr-10"
          />
        </div>
      </motion.div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-3xl border border-gray-100 shadow-sm animate-pulse overflow-hidden">
              <div className="h-36 bg-muted" />
              <div className="p-4 space-y-3">
                <div className="h-5 bg-muted rounded w-3/4" />
                <div className="h-4 bg-muted rounded w-1/2" />
                <div className="h-9 bg-muted rounded-xl w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((office, i) => {
            const countryObj = office.country ? getCountryByCode(office.country) : null
            const countryName = countryObj ? (locale === "ar" ? countryObj.nameAr : countryObj.nameEn) : office.country
            return (
              <motion.div
                key={office.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ y: -4 }}
              >
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden">
                  <div className="relative h-36 overflow-hidden">
                    <img src={officeImages[i % officeImages.length]} alt={office.office_name} className="w-full h-full object-cover" loading="lazy" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                    <div className="absolute bottom-3 right-3">
                      {office.is_active && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-secondary/90 backdrop-blur-sm px-3 py-1 text-[10px] font-semibold text-white shadow-lg">
                          <Shield className="w-3 h-3" />
                          {t("offices_page.verified")}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-primary">{office.office_name}</h3>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3" />
                          {office.city}, {countryName}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1 bg-muted px-2.5 py-1 rounded-lg">
                        <MapPin className="w-3.5 h-3.5 text-secondary" />
                        {office.city}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 pt-2">
                      <Link href={`/offices/${office.id}`} className="flex-1">
                        <Button size="sm" className="w-full">{t("offices_page.view_office")}</Button>
                      </Link>
                      <a href={`https://wa.me/${office.phone_number?.replace(/\s/g, "")}`} target="_blank" rel="noopener noreferrer" className="p-2 rounded-xl bg-green-50 text-green-600 hover:bg-green-100 transition-all">
                        <MessageCircle className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      )}

      {!isLoading && filtered.length === 0 && (
        <div className="text-center py-20">
          <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">{t("offices_page.no_results")}</p>
        </div>
      )}
    </div>
  )
}
