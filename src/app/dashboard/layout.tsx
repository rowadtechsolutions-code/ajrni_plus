"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Car, TrendingUp, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { useLocaleStore } from "@/store/useLocaleStore"
import { useTranslation } from "@/lib/i18n"

const navItems = [
  { href: "/dashboard/cars", icon: Car, label: "dashboard.my_cars" },
  { href: "/dashboard/analytics", icon: TrendingUp, label: "dashboard.analytics" },
  { href: "/dashboard/profile", icon: User, label: "dashboard.profile" },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { locale } = useLocaleStore()
  const { t } = useTranslation(locale)
  const pathname = usePathname()

  return (
    <div className="flex min-h-[80vh]">
      <aside className="hidden lg:block w-64 border-l border-border bg-white p-4">
        <h2 className="font-bold text-primary mb-4 px-3">{t("dashboard.title")}</h2>
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link key={item.href} href={item.href} className={cn("flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all", isActive ? "bg-secondary/10 text-secondary" : "text-muted-foreground hover:bg-muted")}>
                <item.icon className="w-4 h-4" />
                {t(item.label)}
              </Link>
            )
          })}
        </nav>
      </aside>
      <div className="flex-1 min-w-0">
        <div className="lg:hidden flex items-center gap-2 p-4 border-b border-border bg-white overflow-x-auto no-scrollbar">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link key={item.href} href={item.href} className={cn("flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all", isActive ? "bg-secondary/10 text-secondary" : "text-muted-foreground bg-muted")}>
                <item.icon className="w-3.5 h-3.5" />
                {t(item.label)}
              </Link>
            )
          })}
        </div>
        {children}
      </div>
    </div>
  )
}
