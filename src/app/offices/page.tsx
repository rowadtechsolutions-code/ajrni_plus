"use client"

import { useState, useMemo, useEffect } from "react"
import { Search, Building2, X, SlidersHorizontal } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useQuery } from "@tanstack/react-query"
import { useLocaleStore } from "@/store/useLocaleStore"
import { useAuthStore } from "@/store/useAuthStore"
import { useTranslation } from "@/lib/i18n"
import { officeService } from "@/lib/supabase/services"
import { useCountries, useCities } from "@/hooks/useLocations"
import { formatPhoneNumber, cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { OfficeCard } from "@/components/shared/office-card"
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
  const [showFilters, setShowFilters] = useState(false)
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

  const FilterContent = () => (
    <div className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-primary mb-2">{locale === "ar" ? "الدولة" : "Country"}</label>
        <select dir={locale === "ar" ? "rtl" : "ltr"} className={`w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all appearance-none disabled:opacity-60 disabled:cursor-not-allowed bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%222%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-[length:16px] bg-no-repeat ${locale === "ar" ? "pl-10" : "pr-10"}`} style={{ backgroundPosition: locale === "ar" ? "left 12px center" : "right 12px center", textAlign: locale === "ar" ? "right" : "left" }} value={country} onChange={(e) => { setCountry(e.target.value); setCity("") }} disabled={countriesLoading}>
          {countriesLoading ? (
            <option value="">{locale === "ar" ? "جاري التحميل..." : "Loading..."}</option>
          ) : (
            <option value="">{locale === "ar" ? "الكل" : "All"}</option>
          )}
          {!countriesLoading && countries.map((c) => <option key={c.code} value={c.code}>{locale === "ar" ? c.nameAr : c.nameEn}</option>)}
        </select>
      </div>
      {country && (
        <div>
          <label className="block text-sm font-medium text-primary mb-2">{locale === "ar" ? "المدينة" : "City"}</label>
          <select dir={locale === "ar" ? "rtl" : "ltr"} className={`w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all appearance-none disabled:opacity-60 disabled:cursor-not-allowed bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%222%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-[length:16px] bg-no-repeat ${locale === "ar" ? "pl-10" : "pr-10"}`} style={{ backgroundPosition: locale === "ar" ? "left 12px center" : "right 12px center", textAlign: locale === "ar" ? "right" : "left" }} value={city} onChange={(e) => setCity(e.target.value)} disabled={!country || citiesLoading}>
            {citiesLoading ? (
              <option value="">{locale === "ar" ? "جاري التحميل..." : "Loading..."}</option>
            ) : (
              <option value="">{locale === "ar" ? "الكل" : "All"}</option>
            )}
            {!citiesLoading && cities.map((c) => <option key={c.nameAr} value={c.nameAr}>{locale === "ar" ? c.nameAr : c.nameEn}</option>)}
          </select>
        </div>
      )}
      <Button variant="outline" className="w-full rounded-2xl" onClick={clearFilters}>
        {locale === "ar" ? "مسح الفلاتر" : "Clear filters"}
      </Button>
    </div>
  )

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-2xl mx-auto mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 text-secondary text-xs font-medium mb-4">
          <Building2 className="w-3 h-3" />
          {locale === "ar" ? "مكاتب موثقة" : "Verified Offices"}
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-primary mb-3">{t("offices_page.title")}</h1>
        <p className="text-muted-foreground">{t("offices_page.subtitle")}</p>
      </motion.div>

      <div className="flex flex-col md:flex-row gap-8">
        <aside className="hidden md:block w-64 shrink-0">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sticky top-24">
            <h3 className="font-semibold text-primary mb-5 flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-secondary" />
              {locale === "ar" ? "تصفية" : "Filters"}
            </h3>
            <FilterContent />
          </div>
        </aside>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-6">
            <div className="relative flex-1">
              <Search className={cn("absolute top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none", locale === "ar" ? "right-3" : "left-3")} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t("offices_page.search_placeholder")}
                className={cn(
                  "w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition-all duration-200 focus:border-secondary focus:ring-2 focus:ring-secondary/20",
                  locale === "ar" ? "pr-10" : "pl-10"
                )}
              />
            </div>
            <button
              onClick={() => setShowFilters(true)}
              className="md:hidden inline-flex items-center justify-center rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium transition-all hover:bg-gray-50 active:scale-[0.98] shrink-0"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm animate-pulse">
                  <div className="aspect-[16/7] bg-muted" />
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
                {displayed.map((office, i) => (
                  <OfficeCard
                    key={office.id}
                    office={office as OfficeType}
                    coverImage={office.cover || officeImages[i % officeImages.length]}
                    whatsAppHref={`https://wa.me/${formatPhoneNumber(office.phone_number, office.country)}`}
                    index={i}
                    eagerImage={i === 0}
                  />
                ))}
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
      </div>

      <AnimatePresence>
        {showFilters && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 md:hidden">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowFilters(false)} />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute top-0 left-0 bottom-0 w-80 max-w-[85vw] bg-white p-6 pb-16 overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-semibold text-primary flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-secondary" />
                  {locale === "ar" ? "تصفية" : "Filters"}
                </h3>
                <button onClick={() => setShowFilters(false)} className="p-2 rounded-2xl hover:bg-muted transition-all">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <FilterContent />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
