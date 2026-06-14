"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Heart, ArrowLeft } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { useLocaleStore } from "@/store/useLocaleStore"
import { useAuthStore } from "@/store/useAuthStore"
import { useFavoriteStore } from "@/store/useFavoriteStore"
import { useTranslation } from "@/lib/i18n"
import { favoriteService } from "@/lib/supabase/services"
import { CarCard } from "@/components/shared/car-card"
import { EmptyState } from "@/components/shared/empty-state"

export default function FavoritesPage() {
  const { locale } = useLocaleStore()
  const { t } = useTranslation(locale)
  const { user, isAuthenticated } = useAuthStore()
  const { loadFavorites, ids } = useFavoriteStore()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) router.push("/auth/login")
  }, [isAuthenticated, router])

  const { data: favorites = [], isLoading } = useQuery({
    queryKey: ["favorites", user?.id],
    queryFn: () => favoriteService.getByUser(user!.id),
    enabled: !!user?.id,
  })

  useEffect(() => {
    if (user?.id) loadFavorites(user.id)
  }, [user?.id, loadFavorites])

  const cars = favorites
    .map((f: any) => f.car)
    .filter(Boolean)
    .filter((car: any) => ids.includes(car.id))

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/profile" className="p-2 rounded-xl hover:bg-muted transition-all">
          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
        </Link>
        <h1 className="text-2xl font-bold text-primary">{locale === "ar" ? "المفضلة" : "Favorites"}</h1>
      </div>
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-80 bg-muted rounded-3xl animate-pulse" />
          ))}
        </div>
      ) : cars.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {cars.map((car: any, index: number) => (
            <CarCard key={car.id} car={car} index={index} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Heart className="w-8 h-8 text-muted-foreground" />}
          title={locale === "ar" ? "قائمة المفضلة فارغة" : "Favorites is empty"}
          description={locale === "ar" ? "أضف سيارات إلى المفضلة لمتابعتها" : "Add cars to your favorites"}
          action={{ label: t("home.view_all"), href: "/cars" }}
        />
      )}
    </div>
  )
}
