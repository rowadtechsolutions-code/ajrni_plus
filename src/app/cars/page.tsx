"use client"

import { useState } from "react"
import { SlidersHorizontal, X, Search, ArrowLeft, Sparkles } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useQuery } from "@tanstack/react-query"
import { useLocaleStore } from "@/store/useLocaleStore"
import { useTranslation } from "@/lib/i18n"
import { carService } from "@/lib/supabase/services"
import { Button } from "@/components/ui/button"
import { CarCard } from "@/components/shared/car-card"
import type { CarType, Transmission, FuelType } from "@/types"

const brands = ["Toyota", "Nissan", "Honda", "Mercedes", "BMW", "Audi", "Hyundai", "Kia", "Lexus", "Porsche"]

export default function CarsPage() {
  const { locale } = useLocaleStore()
  const { t } = useTranslation(locale)
  const [showFilters, setShowFilters] = useState(false)
  const [search, setSearch] = useState("")
  const [filters, setFilters] = useState({ brand: "", transmission: "" as Transmission | "", fuelType: "" as FuelType | "", minPrice: "", maxPrice: "", seats: "", availableNow: false })
  const [sortBy, setSortBy] = useState("newest")

  const { data: cars = [], isLoading } = useQuery({
    queryKey: ["cars", filters],
    queryFn: () => carService.getAll({
      brand: filters.brand || undefined,
      transmission: (filters.transmission as Transmission) || undefined,
      fuelType: (filters.fuelType as FuelType) || undefined,
      minPrice: filters.minPrice ? Number(filters.minPrice) : undefined,
      maxPrice: filters.maxPrice ? Number(filters.maxPrice) : undefined,
      availableNow: filters.availableNow || undefined,
    }),
    staleTime: 30_000,
  })

  const filteredCars = (cars as CarType[]).filter((car) => {
    const title = locale === "ar" ? car.titleAr : car.titleEn
    if (search && !title.toLowerCase().includes(search.toLowerCase())) return false
    if (filters.seats && car.seats < Number(filters.seats)) return false
    return true
  }).sort((a, b) => {
    if (sortBy === "price_low") return a.pricePerDay - b.pricePerDay
    if (sortBy === "price_high") return b.pricePerDay - a.pricePerDay
    return 0
  })

  const FilterContent = () => (
    <div className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-primary mb-2">{t("cars.brand")}</label>
        <select className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all" value={filters.brand} onChange={(e) => setFilters({ ...filters, brand: e.target.value })}>
          <option value="">{locale === "ar" ? "الكل" : "All"}</option>
          {brands.map((b) => <option key={b} value={b}>{b}</option>)}
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
        <select className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all" value={filters.transmission} onChange={(e) => setFilters({ ...filters, transmission: e.target.value as Transmission | "" })}>
          <option value="">{locale === "ar" ? "الكل" : "All"}</option>
          <option value="AUTOMATIC">{t("cars.automatic")}</option>
          <option value="MANUAL">{t("cars.manual")}</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-primary mb-2">{t("cars.fuel_type")}</label>
        <select className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all" value={filters.fuelType} onChange={(e) => setFilters({ ...filters, fuelType: e.target.value as FuelType | "" })}>
          <option value="">{locale === "ar" ? "الكل" : "All"}</option>
          <option value="GASOLINE">{locale === "ar" ? "بنزين" : "Gasoline"}</option>
          <option value="DIESEL">{locale === "ar" ? "ديزل" : "Diesel"}</option>
          <option value="ELECTRIC">{locale === "ar" ? "كهرباء" : "Electric"}</option>
        </select>
      </div>
      <label className="flex items-center gap-2 cursor-pointer p-3 rounded-2xl hover:bg-muted transition-all">
        <input type="checkbox" className="w-4 h-4 rounded border-border text-secondary accent-secondary" checked={filters.availableNow} onChange={(e) => setFilters({ ...filters, availableNow: e.target.checked })} />
        <span className="text-sm text-primary">{t("cars.available_now")}</span>
      </label>
      <Button variant="outline" className="w-full rounded-2xl" onClick={() => setFilters({ brand: "", transmission: "", fuelType: "", minPrice: "", maxPrice: "", seats: "", availableNow: false })}>
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
                {isLoading ? "..." : `${filteredCars.length} ${locale === "ar" ? "سيارة متاحة" : "cars available"}`}
              </p>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-initial">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t("nav.search")} className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all pl-10 w-full sm:w-52" />
              </div>
              <select className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="newest">{t("cars.newest")}</option>
                <option value="price_low">{t("cars.price_low")}</option>
                <option value="price_high">{t("cars.price_high")}</option>
              </select>
              <button onClick={() => setShowFilters(true)} className="md:hidden inline-flex items-center justify-center rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-900 transition-all hover:bg-gray-50 active:scale-[0.98]">
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
              {filteredCars.map((car, i) => <CarCard key={car.id} car={car} index={i} />)}
            </motion.div>
          )}
          {!isLoading && filteredCars.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
              <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                <Search className="w-6 h-6 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">{t("cars.no_results")}</p>
              <Button variant="outline" className="mt-4 rounded-2xl" onClick={() => { setFilters({ brand: "", transmission: "", fuelType: "", minPrice: "", maxPrice: "", seats: "", availableNow: false }); setSearch("") }}>
                {t("cars.reset_filters")}
              </Button>
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
                  <ArrowLeft className="w-5 h-5" />
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
