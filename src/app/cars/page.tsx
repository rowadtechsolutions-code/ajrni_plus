"use client"

import { useState, useEffect, Suspense } from "react"
import { SlidersHorizontal, X, Search, Sparkles } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useQuery } from "@tanstack/react-query"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { useLocaleStore } from "@/store/useLocaleStore"
import { useAuthStore } from "@/store/useAuthStore"
import { useTranslation } from "@/lib/i18n"
import { carService } from "@/lib/supabase/services"
import { Button } from "@/components/ui/button"
import { CarCard } from "@/components/shared/car-card"
import { brands } from "@/lib/brands"
import { gulfCountries, getCitiesByCountryCode } from "@/lib/locations"
import { getCurrencyByCountry } from "@/lib/utils"
import type { CarType } from "@/types"

const fuelTypes = ["GASOLINE", "DIESEL", "ELECTRIC", "HYBRID"]
const transmissions = ["AUTOMATIC", "MANUAL"]

export default function CarsPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8"><div className="h-96 bg-muted rounded-2xl animate-pulse" /></div>}>
      <CarsPageContent />
    </Suspense>
  )
}

function CarsPageContent() {
  const { locale } = useLocaleStore()
  const { t } = useTranslation(locale)
  const [showFilters, setShowFilters] = useState(false)
  const [search, setSearch] = useState("")
  const searchParams = useSearchParams()
  const [countryFilter, setCountryFilter] = useState("")
  const [cityFilter, setCityFilter] = useState("")

  const { profile } = useAuthStore()

  useEffect(() => {
    const q = searchParams.get("q")
    if (q) setSearch(q)
  }, [searchParams])

  useEffect(() => {
    if (profile?.country) {
      setCountryFilter(profile.country)
      if (profile.city) setCityFilter(profile.city)
    } else {
      const saved = localStorage.getItem("userCountry")
      setCountryFilter(saved || "OM")
    }
  }, [profile])
  const [filters, setFilters] = useState({ brand: "", transmission: "", fuel_type: "", minPrice: "", maxPrice: "", seats: "" })
  const [sortBy, setSortBy] = useState("newest")

  const cities = countryFilter ? getCitiesByCountryCode(countryFilter) : []

  const { data: cars = [], isLoading, error } = useQuery({
    queryKey: ["cars", filters, countryFilter, cityFilter],
    queryFn: () => carService.getAll({
      brand: filters.brand || undefined,
      transmission: filters.transmission || undefined,
      fuel_type: filters.fuel_type || undefined,
      minPrice: filters.minPrice ? Number(filters.minPrice) : undefined,
      maxPrice: filters.maxPrice ? Number(filters.maxPrice) : undefined,
      seats: filters.seats ? Number(filters.seats) : undefined,
      country: countryFilter || undefined,
      city: cityFilter || undefined,
    }),
    staleTime: 30_000,
  })

  const filteredCars = (cars as CarType[]).filter((car) => {
    if (search) {
      const q = search.toLowerCase()
      const nameMatch = car.name?.toLowerCase().includes(q)
      const brandMatch = car.brand?.toLowerCase().includes(q)
      const modelMatch = car.model?.toLowerCase().includes(q)
      if (!nameMatch && !brandMatch && !modelMatch) return false
    }
    return true
  }).sort((a, b) => {
    const aPrice = Number(a.price || 0)
    const bPrice = Number(b.price || 0)
    if (sortBy === "price_low") return aPrice - bPrice
    if (sortBy === "price_high") return bPrice - aPrice
    return 0
  })

  const PAGE_SIZE = 9
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const displayedCars = filteredCars.slice(0, visibleCount)

  useEffect(() => {
    setVisibleCount(PAGE_SIZE)
  }, [search, filters, countryFilter, cityFilter, sortBy])

  const changeCountry = (val: string) => {
    setCountryFilter(val)
    setCityFilter("")
    if (typeof window !== "undefined") localStorage.setItem("userCountry", val)
  }

  const cur = getCurrencyByCountry(countryFilter || undefined)

  const FilterContent = () => (
    <div className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-primary mb-2">{locale === "ar" ? "الدولة" : "Country"}</label>
        <select className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all" value={countryFilter} onChange={(e) => changeCountry(e.target.value)}>
          <option value="">{locale === "ar" ? "الكل" : "All"}</option>
          {gulfCountries.map((c) => <option key={c.code} value={c.code}>{locale === "ar" ? c.nameAr : c.nameEn}</option>)}
        </select>
      </div>
      {countryFilter && cities.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-primary mb-2">{locale === "ar" ? "المدينة" : "City"}</label>
          <select className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all" value={cityFilter} onChange={(e) => setCityFilter(e.target.value)}>
            <option value="">{locale === "ar" ? "الكل" : "All"}</option>
            {cities.map((c) => <option key={c.nameAr} value={c.nameAr}>{locale === "ar" ? c.nameAr : c.nameEn}</option>)}
          </select>
        </div>
      )}
      <div>
        <label className="block text-sm font-medium text-primary mb-2">{locale === "ar" ? "ترتيب حسب" : "Sort By"}</label>
        <select className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="newest">{t("cars.newest")}</option>
          <option value="price_low">{t("cars.price_low")}</option>
          <option value="price_high">{t("cars.price_high")}</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-primary mb-2">{t("cars.brand")}</label>
        <select className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all" value={filters.brand} onChange={(e) => setFilters({ ...filters, brand: e.target.value })}>
          <option value="">{locale === "ar" ? "الكل" : "All"}</option>
          {brands.map((b) => <option key={b.id} value={b.id}>{b.label}</option>)}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-sm font-medium text-primary mb-2">{t("cars.min_price")}</label>
          <input type="number" className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all" placeholder="0" value={filters.minPrice} onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm font-medium text-primary mb-2">{t("cars.max_price")}</label>
          <input type="number" className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all" placeholder="10000" value={filters.maxPrice} onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })} />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-primary mb-2">{t("cars.transmission")}</label>
        <select className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all" value={filters.transmission} onChange={(e) => setFilters({ ...filters, transmission: e.target.value })}>
          <option value="">{locale === "ar" ? "الكل" : "All"}</option>
          {transmissions.map((tr) => <option key={tr} value={tr}>{tr === "AUTOMATIC" ? t("cars.automatic") : t("cars.manual")}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-primary mb-2">{t("cars.fuel_type")}</label>
        <select className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all" value={filters.fuel_type} onChange={(e) => setFilters({ ...filters, fuel_type: e.target.value })}>
          <option value="">{locale === "ar" ? "الكل" : "All"}</option>
          {fuelTypes.map((f) => <option key={f} value={f}>{f === "GASOLINE" ? (locale === "ar" ? "بنزين" : "Gasoline") : f === "DIESEL" ? (locale === "ar" ? "ديزل" : "Diesel") : f === "ELECTRIC" ? (locale === "ar" ? "كهرباء" : "Electric") : (locale === "ar" ? "هايبرد" : "Hybrid")}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-primary mb-2">{t("cars.seats")}</label>
        <select className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all" value={filters.seats} onChange={(e) => setFilters({ ...filters, seats: e.target.value })}>
          <option value="">{locale === "ar" ? "الكل" : "All"}</option>
          {[2, 3, 4, 5, 6, 7, 8].map((s) => <option key={s} value={s}>{s}+</option>)}
        </select>
      </div>
      <Button variant="outline" className="w-full rounded-2xl" onClick={() => { setFilters({ brand: "", transmission: "", fuel_type: "", minPrice: "", maxPrice: "", seats: "" }); setCountryFilter(""); setCityFilter("") }}>
        {t("cars.reset_filters")}
      </Button>
    </div>
  )

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row gap-8">
        <aside className="hidden md:block w-64 shrink-0">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sticky top-24">
            <h3 className="font-semibold text-primary mb-5 flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-secondary" />
              {t("cars.filters")}
            </h3>
            <FilterContent />
          </div>
        </aside>
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-primary">{t("cars.title")}</h1>
              <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-accent" />
                {isLoading ? "..." : `${filteredCars.length} ${locale === "ar" ? "سيارة متاحة" : "cars available"}${cur ? ` (${locale === "ar" ? cur.nameAr : cur.symbol})` : ""}`}
              </p>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder={locale === "ar" ? "بحث..." : "Search..."} className="w-full sm:w-80 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all pr-10" />
              </div>
              <button onClick={() => setShowFilters(true)} className="md:hidden inline-flex items-center justify-center rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-900 transition-all hover:bg-gray-50 active:scale-[0.98] shrink-0">
                <SlidersHorizontal className="w-4 h-4" />
              </button>
            </div>
          </div>
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white rounded-3xl border border-gray-100 shadow-sm animate-pulse overflow-hidden">
                  <div className="h-48 bg-muted" />
                  <div className="p-4 space-y-3">
                    <div className="h-5 bg-muted rounded w-3/4" />
                    <div className="h-4 bg-muted rounded w-1/2" />
                    <div className="flex gap-2">
                      <div className="h-8 bg-muted rounded-lg w-16" />
                      <div className="h-8 bg-muted rounded-lg w-16" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {displayedCars.map((car, i) => <CarCard key={car.id} car={car} index={i} />)}
            </motion.div>
          )}
          {!isLoading && visibleCount < filteredCars.length && (
            <div className="flex justify-center mt-8">
              <Button variant="outline" className="rounded-2xl px-8" onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}>
                {locale === "ar" ? "عرض المزيد" : "Load More"}
              </Button>
            </div>
          )}
          {error && (
            <div className="text-center py-10 text-red-500">
              <p>Error: {(error as Error).message}</p>
            </div>
          )}
          {!isLoading && filteredCars.length === 0 && !error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
              <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                <Search className="w-6 h-6 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">{locale === "ar" ? "لم يتم العثور على سيارات مطابقة لبحثك" : "No cars matching your search were found"}</p>
              <Link href="/cars">
                <Button variant="outline" className="mt-4 rounded-2xl">
                  {locale === "ar" ? "عرض جميع السيارات" : "View all cars"}
                </Button>
              </Link>
            </motion.div>
          )}
        </div>
      </motion.div>
      <AnimatePresence>
        {showFilters && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 md:hidden">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowFilters(false)} />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute top-0 left-0 bottom-0 w-80 max-w-[85vw] bg-white p-6 overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-semibold text-primary flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-secondary" />
                  {t("cars.filters")}
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
