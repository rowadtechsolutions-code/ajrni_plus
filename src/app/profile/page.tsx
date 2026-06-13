"use client"

import { useAuthStore } from "@/store/useAuthStore"
import { useAuth } from "@/hooks/useAuth"
import Link from "next/link"
import { User, Shield, LogOut, ChevronLeft, Heart } from "lucide-react"
import { useLocaleStore } from "@/store/useLocaleStore"
import { useTranslation } from "@/lib/i18n"
import { Button } from "@/components/ui/button"
import { getInitials } from "@/lib/utils"

export default function ProfilePage() {
  const { locale } = useLocaleStore()
  const { t } = useTranslation(locale)
  const { isAuthenticated, profile, user } = useAuthStore()
  const { signOut } = useAuth()

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 text-center">
        <User className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">{locale === "ar" ? "تسجيل الدخول مطلوب" : "Login required"}</h2>
        <Link href="/auth/login"><Button>{t("nav.login")}</Button></Link>
      </div>
    )
  }

  const items = [
    ...(profile?.role === "OFFICE" ? [{ icon: Shield, label: t("nav.dashboard"), href: "/dashboard" }] : []),
    ...(profile?.role === "ADMIN" ? [{ icon: Shield, label: t("nav.admin"), href: "/admin" }] : []),
    { icon: Heart, label: t("nav.wishlist"), href: "/wishlist" },
  ]

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 max-w-2xl">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-secondary text-white flex items-center justify-center text-xl font-bold">{getInitials(profile?.name || user?.email || "U")}</div>
          <div>
            <h2 className="text-xl font-bold text-primary">{profile?.name || user?.email || "User"}</h2>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
            <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full bg-secondary/10 text-secondary font-medium">
              {profile?.role === "OFFICE" ? (locale === "ar" ? "مكتب تأجير" : "Rental Office") : profile?.role === "ADMIN" ? (locale === "ar" ? "مدير" : "Admin") : (locale === "ar" ? "مستأجر" : "Customer")}
            </span>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm divide-y divide-border">
        {items.map((item) => (
          <Link key={item.href} href={item.href} className="flex items-center justify-between p-4 hover:bg-muted transition-colors">
            <div className="flex items-center gap-3"><item.icon className="w-5 h-5 text-muted-foreground" /><span className="text-sm font-medium">{item.label}</span></div>
            <ChevronLeft className="w-4 h-4 text-muted-foreground" />
          </Link>
        ))}
      </div>
      <div className="mt-4"><Button variant="danger" className="w-full" onClick={() => signOut()}><LogOut className="w-4 h-4 ml-2" />{t("nav.logout")}</Button></div>
    </div>
  )
}
