"use client"

import { TrendingUp, Eye, CalendarCheck, Target } from "lucide-react"
import { useLocaleStore } from "@/store/useLocaleStore"
import { useTranslation } from "@/lib/i18n"

export default function DashboardAnalyticsPage() {
  const { locale } = useLocaleStore()
  const { t } = useTranslation(locale)
  const stats = [
    { icon: Eye, label: t("dashboard.total_views"), value: "1,234", change: "+12%", positive: true },
    { icon: CalendarCheck, label: t("dashboard.total_requests"), value: "48", change: "+8%", positive: true },
    { icon: TrendingUp, label: t("dashboard.conversion_rate"), value: "72%", change: "+5%", positive: true },
    { icon: Target, label: locale === "ar" ? "متوسط التقييم" : "Avg Rating", value: "4.8", change: "+0.2", positive: true },
  ]
  return (
    <div className="p-4 md:p-6">
      <h1 className="text-xl font-bold text-primary mb-6">{t("dashboard.analytics")}</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
            <div className="flex items-center justify-between mb-2">
              <stat.icon className="w-5 h-5 text-muted-foreground" />
              <span className={`text-xs font-medium ${stat.positive ? "text-success" : "text-error"}`}>{stat.change}</span>
            </div>
            <p className="text-2xl font-bold text-primary">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <h3 className="font-semibold text-primary mb-4">{locale === "ar" ? "البيانات" : "Data"}</h3>
        <div className="h-48 flex items-center justify-center text-muted-foreground">{locale === "ar" ? "الرسوم البيانية قريباً" : "Charts coming soon"}</div>
      </div>
    </div>
  )
}
