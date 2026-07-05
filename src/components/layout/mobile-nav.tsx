"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Search, Heart, User, LayoutDashboard, Building2 } from "lucide-react"
import { useAuthStore } from "@/store/useAuthStore"
import { useLocaleStore } from "@/store/useLocaleStore"
import { cn } from "@/lib/utils"

export function MobileNav() {
  const pathname = usePathname()
  const { isAuthenticated, profile } = useAuthStore()
  const { locale } = useLocaleStore()

  if (pathname.startsWith("/dashboard") || pathname.startsWith("/admin")) return null

  const items = [
    { href: "/", icon: Home, label: locale === "ar" ? "الرئيسية" : "Home" },
    { href: "/cars", icon: Search, label: locale === "ar" ? "بحث" : "Search" },
    { href: "/offices", icon: Building2, label: locale === "ar" ? "المكاتب" : "Offices" },
    ...(profile?.role === "OFFICE"
      ? [{ href: "/dashboard", icon: LayoutDashboard, label: locale === "ar" ? "لوحة التحكم" : "Dashboard" }]
      : [{ href: "/wishlist", icon: Heart, label: locale === "ar" ? "المفضلة" : "Wishlist" }]
    ),
    { href: "/profile", icon: User, label: locale === "ar" ? "حسابي" : "Profile" },
  ]

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-border safe-area-bottom">
      <div className="flex items-center justify-around h-16">
        {items.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors",
                isActive ? "text-secondary" : "text-muted-foreground"
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
