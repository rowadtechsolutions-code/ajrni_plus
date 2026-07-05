"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Car, TrendingUp, User, LogOut, MessageCircle, Bell } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { cn } from "@/lib/utils"
import { useLocaleStore } from "@/store/useLocaleStore"
import { useTranslation } from "@/lib/i18n"
import { useAuth } from "@/hooks/useAuth"
import { officeService, bookingRequestService } from "@/lib/supabase/services"
import { notificationService } from "@/lib/supabase/notifications"

const navItems = [
  { href: "/dashboard/cars", icon: Car, label: "dashboard.my_cars" },
  { href: "/dashboard/requests", icon: MessageCircle, label: "dashboard.requests", badge: true },
  { href: "/dashboard/analytics", icon: TrendingUp, label: "dashboard.analytics" },
  { href: "/dashboard/notifications", icon: Bell, label: "dashboard.notifications", badge: true },
  { href: "/dashboard/profile", icon: User, label: "dashboard.profile" },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { locale } = useLocaleStore()
  const { t } = useTranslation(locale)
  const pathname = usePathname()
  const { signOut, user } = useAuth()
  const [showLogoutModal, setShowLogoutModal] = useState(false)

  const { data: office } = useQuery({
    queryKey: ["office-status", user?.id],
    queryFn: () => officeService.getByUserId(user!.id),
    enabled: !!user?.id,
  })
  const isActive = office?.is_active

  const { data: unviewedCount = 0 } = useQuery({
    queryKey: ["unviewed-requests", user?.id],
    queryFn: () => bookingRequestService.getUnviewedCount(user!.id),
    enabled: !!user?.id,
    refetchInterval: 30000,
  })

  const { data: notificationUnreadCount = 0 } = useQuery({
    queryKey: ["unread-notifications", user?.id],
    queryFn: () => notificationService.getUnreadCount(user!.id),
    enabled: !!user?.id,
    refetchInterval: 30000,
  })

  return (
    <div className="flex min-h-[80vh]">
        <aside className="hidden lg:block w-64 border-l border-border bg-white p-4">
        <div className="flex items-center justify-between px-3 mb-4">
          <h2 className="font-bold text-primary">{t("dashboard.title")}</h2>
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${isActive ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
            {isActive ? (locale === "ar" ? "نشط" : "Active") : (locale === "ar" ? "قيد المراجعة" : "Pending")}
          </span>
        </div>
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            const badgeCount = item.href === "/dashboard/requests" ? unviewedCount : item.href === "/dashboard/notifications" ? notificationUnreadCount : 0
            return (
              <Link key={item.href} href={item.href} className={cn("flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all", isActive ? "bg-secondary/10 text-secondary" : "text-muted-foreground hover:bg-muted")}>
                <item.icon className="w-4 h-4" />
                {t(item.label)}
                {item.badge && badgeCount > 0 && (
                  <span className="mr-auto bg-error text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">{badgeCount > 99 ? "99+" : badgeCount}</span>
                )}
              </Link>
            )
          })}
        </nav>
        <button onClick={() => setShowLogoutModal(true)} className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-error hover:bg-red-50 transition-all w-full mt-4">
          <LogOut className="w-4 h-4" />
          {locale === "ar" ? "تسجيل الخروج" : "Logout"}
        </button>
      </aside>
      <div className="flex-1 min-w-0 pb-16 lg:pb-0">
        {children}
      </div>

      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-border safe-area-bottom">
        <div className="flex items-center justify-around h-16">
          {[
            { href: "/dashboard/cars", icon: Car, label: locale === "ar" ? "سياراتي" : "My Cars" },
            { href: "/dashboard/requests", icon: MessageCircle, label: locale === "ar" ? "الطلبات" : "Requests", badgeCount: unviewedCount },
            { href: "/dashboard/notifications", icon: Bell, label: locale === "ar" ? "الإشعارات" : "Notifications", badgeCount: notificationUnreadCount },
            { href: "/dashboard/profile", icon: User, label: locale === "ar" ? "حسابي" : "Account" },
          ].map((item) => {
            const isItemActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors",
                  isItemActive ? "text-secondary" : "text-muted-foreground"
                )}
              >
                <div className="relative">
                  <item.icon className="w-5 h-5" />
                  {(item as any).badgeCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-error text-white text-[8px] font-bold px-1 rounded-full min-w-[14px] text-center leading-[14px]">
                      {(item as any).badgeCount > 99 ? "99+" : (item as any).badgeCount}
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>

      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowLogoutModal(false)}>
          <div className="bg-white rounded-2xl shadow-xl p-6 w-80 mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-primary mb-2">{locale === "ar" ? "تسجيل الخروج" : "Logout"}</h3>
            <p className="text-sm text-muted-foreground mb-6">{locale === "ar" ? "هل أنت متأكد أنك تريد تسجيل الخروج؟" : "Are you sure you want to logout?"}</p>
            <div className="flex gap-3">
              <button onClick={() => setShowLogoutModal(false)} className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-muted-foreground hover:bg-muted transition-all">
                {locale === "ar" ? "إلغاء" : "Cancel"}
              </button>
              <button onClick={() => { signOut(); setShowLogoutModal(false) }} className="flex-1 px-4 py-2.5 rounded-xl bg-error text-white text-sm font-medium hover:bg-red-700 transition-all">
                {locale === "ar" ? "تسجيل الخروج" : "Logout"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
