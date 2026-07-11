"use client"

import { useState, useMemo, useEffect } from "react"
import Link from "next/link"
import { Search, MapPin, Shield, Building2, MessageCircle, X } from "lucide-react"
import { motion } from "framer-motion"
import { useQuery } from "@tanstack/react-query"
import { useLocaleStore } from "@/store/useLocaleStore"
import { useAuthStore } from "@/store/useAuthStore"
import { useTranslation } from "@/lib/i18n"
import { officeService } from "@/lib/supabase/services"
import { getCountryByCode } from "@/lib/locations"
import { useCountries, useCities } from "@/hooks/useLocations"
import { formatPhoneNumber, cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
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
  const { profile } = useAuthStore()
  const [search, setSearch] = useState("")
  const [country, setCountry] = useState("")
  const [city, setCity] = useState("")

  useEffect(() => {
    if (profile?.country) {
      setCountry(profile.country)
      if (profile.city) setCity(profile.city)
    } else {
      setCountry("OM")
    }
  }, [profile])

  const { data: offices = [], isLoading } = useQuery({
    queryKey: ["offices"],
    queryFn: () => officeService.getActive(),
  })

  const { data: countries = [], isLoading: countriesLoading } = useCountries()
  const { data: cities = [], isLoading: citiesLoading } = useCities(country)

  const filtered = useMemo(() => {
    return (offices as any[]).filter((office) => {
      const matchSearch = office.office_name.toLowerCase().includes(search.toLowerCase())
      const matchCountry = !country || office.country === country
      const matchCity = !city || office.city === city
      return matchSearch && matchCountry && matchCity
    })
  }, [offices, search, country, city])

  const PAGE_SIZE = 9
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const displayed = filtered.slice(0, visibleCount)

  useEffect(() => {
    setVisibleCount(PAGE_SIZE)
  }, [search, country, city])

  const activeFilters = [search, country, city].filter(Boolean).length > 0

  const clearFilters = () => {
    setSearch("")
    setCountry("")
    setCity("")
  }

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

        <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3 max-w-2xl mx-auto">
          <div className="relative flex-1">
            <Search className={cn("absolute top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground", locale === "ar" ? "right-3" : "left-3")} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("offices_page.search_placeholder")}
              className={cn(
                "w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition-all focus:border-secondary focus:ring-2 focus:ring-secondary/20",
                locale === "ar" ? "pr-10" : "pl-10"
              )}
            />
          </div>
          <select
            value={country}
            onChange={(e) => { setCountry(e.target.value); setCity("") }}
            disabled={countriesLoading}
            dir={locale === "ar" ? "rtl" : "ltr"}
            className={`w-full sm:w-auto min-w-[140px] rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all appearance-none disabled:opacity-60 disabled:cursor-not-allowed bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%222%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-[length:16px] bg-no-repeat ${locale === "ar" ? "pl-10" : "pr-10"}`}
            style={{ backgroundPosition: locale === "ar" ? "left 12px center" : "right 12px center", textAlign: locale === "ar" ? "right" : "left" }}
          >
            {countriesLoading ? (
              <option value="">{locale === "ar" ? "جاري التحميل..." : "Loading..."}</option>
            ) : (
              <option value="">{locale === "ar" ? "كل الدول" : "All countries"}</option>
            )}
            {!countriesLoading && countries.map((c) => (
              <option key={c.code} value={c.code}>{locale === "ar" ? c.nameAr : c.nameEn}</option>
            ))}
          </select>
          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            disabled={!country || citiesLoading}
            dir={locale === "ar" ? "rtl" : "ltr"}
            className={`w-full sm:w-auto min-w-[140px] rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all appearance-none disabled:opacity-50 disabled:cursor-not-allowed bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%222%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-[length:16px] bg-no-repeat ${locale === "ar" ? "pl-10" : "pr-10"}`}
            style={{ backgroundPosition: locale === "ar" ? "left 12px center" : "right 12px center", textAlign: locale === "ar" ? "right" : "left" }}
          >
            {citiesLoading ? (
              <option value="">{locale === "ar" ? "جاري التحميل..." : "Loading..."}</option>
            ) : (
              <option value="">{locale === "ar" ? "كل المدن" : "All cities"}</option>
            )}
            {!citiesLoading && cities.map((c) => (
              <option key={c.nameAr} value={c.nameAr}>{locale === "ar" ? c.nameAr : c.nameEn}</option>
            ))}
          </select>
          {activeFilters && (
            <button
              onClick={clearFilters}
              className="shrink-0 p-3 rounded-2xl border border-gray-200 hover:bg-muted transition-colors text-muted-foreground hover:text-primary"
              title={locale === "ar" ? "إلغاء التصفية" : "Clear filters"}
            >
              <X className="w-4 h-4" />
            </button>
          )}
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
      ) : filtered.length > 0 ? (
        <>
          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {displayed.map((office, i) => {
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
                  <div className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden h-full flex flex-col">
                    <div className="relative h-36 overflow-hidden">
                      <img
                        src={office.cover || officeImages[i % officeImages.length]}
                        alt={office.office_name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
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
                    <div className="p-4 space-y-3 flex flex-col flex-1">
                      <div>
                        <h3 className="font-semibold text-primary">{office.office_name}</h3>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 shrink-0" />
                          {[office.city, countryName].filter(Boolean).join(", ")}
                        </p>
                      </div>
                      {office.city && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                          <span className="flex items-center gap-1 bg-muted px-2.5 py-1 rounded-lg">
                            <MapPin className="w-3.5 h-3.5 text-secondary" />
                            {office.city}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 pt-2 mt-auto">
                        <Link href={`/offices/${office.id}`} className="flex-1">
                          <Button size="sm" className="w-full">{t("offices_page.view_office")}</Button>
                        </Link>
                        <a
                          href={`https://wa.me/${formatPhoneNumber(office.phone_number, office.country)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-xl bg-green-50 text-green-600 hover:bg-green-100 transition-all"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
          {visibleCount < filtered.length && (
            <div className="flex justify-center mt-8">
              <Button variant="outline" className="rounded-2xl px-8" onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}>
                {locale === "ar" ? "عرض المزيد" : "Load More"}
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-20">
          <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">{t("offices_page.no_results")}</p>
        </div>
      )}
    </div>
  )
}
