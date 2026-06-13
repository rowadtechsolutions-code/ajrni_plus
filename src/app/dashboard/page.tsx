"use client"

import { useAuthStore } from "@/store/useAuthStore"
import Link from "next/link"
import { Car, CalendarCheck, Eye, TrendingUp, Plus, Clock } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { useLocaleStore } from "@/store/useLocaleStore"
import { useTranslation } from "@/lib/i18n"
import { officeService } from "@/lib/supabase/services"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function DashboardPage() {
  const { locale } = useLocaleStore()
  const { t } = useTranslation(locale)
  const { isAuthenticated, user, profile, loading } = useAuthStore()

  const { data: office } = useQuery({
    queryKey: ["my-office", user?.id],
    queryFn: () => officeService.getByUserId(user!.id),
    enabled: !!user?.id,
  })

  if (loading) {
    return <div className="p-4 md:p-6 text-center py-16">{locale === "ar" ? "جاري التحميل..." : "Loading..."}</div>
  }

  if (!isAuthenticated || profile?.role !== "OFFICE") {
    return (
      <div className="p-4 md:p-6 text-center py-16">
        <h2 className="text-xl font-semibold mb-2">{locale === "ar" ? "غير مصرح" : "Unauthorized"}</h2>
        <Link href="/auth/login"><Button>{t("nav.login")}</Button></Link>
      </div>
    )
  }

  if (office && !office.is_active) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 max-w-md text-center">
          <div className="w-20 h-20 rounded-full bg-warning/10 flex items-center justify-center mx-auto mb-4"><Clock className="w-10 h-10 text-warning" /></div>
          <h2 className="text-xl font-bold text-primary mb-2">{t("dashboard.office_pending")}</h2>
          <p className="text-sm text-muted-foreground mb-6">{t("dashboard.office_pending_desc")}</p>
          <div className="animate-pulse flex items-center justify-center gap-2 text-sm text-warning"><span className="w-2 h-2 rounded-full bg-warning" />{locale === "ar" ? "قيد المراجعة" : "Under review"}</div>
        </div>
      </div>
    )
  }

  const stats = [
    { icon: Eye, label: t("dashboard.total_views"), value: "1,234", color: "text-info", bg: "bg-info/10" },
    { icon: CalendarCheck, label: t("dashboard.total_requests"), value: "48", color: "text-secondary", bg: "bg-secondary/10" },
    { icon: TrendingUp, label: t("dashboard.conversion_rate"), value: "72%", color: "text-success", bg: "bg-success/10" },
    { icon: Car, label: t("dashboard.my_cars"), value: "12", color: "text-accent", bg: "bg-accent/10" },
  ]

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-primary">{t("dashboard.title")}</h1>
          <p className="text-sm text-muted-foreground">{locale === "ar" ? "مرحباً بعودتك!" : "Welcome back!"}</p>
        </div>
        <Link href="/dashboard/cars"><Button><Plus className="w-4 h-4 ml-2" />{t("dashboard.add_car")}</Button></Link>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
            <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}><stat.icon className={`w-5 h-5 ${stat.color}`} /></div>
            <p className="text-2xl font-bold text-primary">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4"><h3 className="font-semibold text-primary">{t("dashboard.requests")}</h3><Link href="/dashboard/requests" className="text-sm text-secondary hover:underline">{t("home.view_all")}</Link></div>
          <div className="space-y-3">
            {[
              { customer: "أحمد محمد", car: "تويوتا كامري 2024", status: "PENDING" },
              { customer: "سارة خالد", car: "نيسان باترول 2024", status: "ACCEPTED" },
            ].map((req, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-muted">
                <div><p className="text-sm font-medium">{req.customer}</p><p className="text-xs text-muted-foreground">{req.car}</p></div>
                <Badge variant={req.status === "PENDING" ? "warning" : "success"}>{req.status === "PENDING" ? t("booking.pending") : t("booking.accepted")}</Badge>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h3 className="font-semibold text-primary mb-4">{locale === "ar" ? "روابط سريعة" : "Quick Actions"}</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: Car, label: t("dashboard.my_cars"), href: "/dashboard/cars", color: "text-secondary" },
              { icon: CalendarCheck, label: t("dashboard.requests"), href: "/dashboard/requests", color: "text-accent" },
              { icon: TrendingUp, label: t("dashboard.analytics"), href: "/dashboard/analytics", color: "text-success" },
              { icon: Car, label: t("dashboard.profile"), href: "/dashboard/profile", color: "text-info" },
            ].map((item) => (
              <Link key={item.href} href={item.href} className="p-4 rounded-xl border border-border hover:bg-muted transition-colors text-center">
                <item.icon className={`w-6 h-6 mx-auto mb-2 ${item.color}`} />
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
