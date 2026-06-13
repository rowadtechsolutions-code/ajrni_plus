"use client"

import { Heart } from "lucide-react"
import { useLocaleStore } from "@/store/useLocaleStore"
import { useTranslation } from "@/lib/i18n"
import { EmptyState } from "@/components/shared/empty-state"

export default function WishlistPage() {
  const { locale } = useLocaleStore()
  const { t } = useTranslation(locale)
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-primary mb-6">{t("nav.wishlist")}</h1>
      <EmptyState icon={<Heart className="w-8 h-8 text-muted-foreground" />} title={locale === "ar" ? "قائمة المفضلة فارغة" : "Wishlist is empty"} description={locale === "ar" ? "أضف سيارات إلى المفضلة لمتابعتها" : "Add cars to your wishlist"} action={{ label: t("home.view_all"), href: "/cars" }} />
    </div>
  )
}
