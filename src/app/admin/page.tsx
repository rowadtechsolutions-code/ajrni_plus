"use client"

import Link from "next/link"
import { useAuthStore } from "@/store/useAuthStore"
import { Building2, Car, Users, Settings, Shield, CheckCircle2, Clock, Ban } from "lucide-react"
import { useLocaleStore } from "@/store/useLocaleStore"
import { useTranslation } from "@/lib/i18n"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function AdminPage() {
  const { locale } = useLocaleStore()
  const { t } = useTranslation(locale)
  const { isAuthenticated, profile, loading } = useAuthStore()

  if (loading) {
    return <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 text-center">{locale === "ar" ? "جاري التحميل..." : "Loading..."}</div>
  }

  if (!isAuthenticated || profile?.role !== "ADMIN") {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 text-center">
        <Shield className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">{locale === "ar" ? "غير مصرح" : "Unauthorized"}</h2>
        <Link href="/auth/login"><Button>{t("nav.login")}</Button></Link>
      </div>
    )
  }

  const stats = [
    { icon: Building2, label: t("admin.offices"), value: "24", href: "/admin/offices" },
    { icon: Car, label: t("admin.cars"), value: "156", href: "/admin/cars" },
    { icon: Users, label: t("admin.users"), value: "892", href: "/admin/users" },
    { icon: Clock, label: t("admin.pending_offices"), value: "3", href: "/admin/offices?status=PENDING", color: "text-warning" },
  ]

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
      <h1 className="text-2xl font-bold text-primary mb-6">{t("admin.title")}</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 hover:shadow-md transition-shadow">
              <stat.icon className={`w-8 h-8 mb-3 ${stat.color || "text-secondary"}`} />
              <p className="text-2xl font-bold text-primary">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          </Link>
        ))}
      </div>
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-primary">{locale === "ar" ? "أحدث المكاتب قيد المراجعة" : "Latest Pending Offices"}</h3>
          <Link href="/admin/offices" className="text-sm text-secondary hover:underline">{t("home.view_all")}</Link>
        </div>
        {[{ name: "مكتب الدمام", email: "dammam@office.com" }, { name: "مكتب القطيف", email: "qatif@office.com" }].map((office) => (
          <div key={office.email} className="flex items-center justify-between py-3 border-b border-border last:border-0">
            <div><p className="text-sm font-medium">{office.name}</p><p className="text-xs text-muted-foreground">{office.email}</p></div>
            <Badge variant="warning">{t("dashboard.pending_review")}</Badge>
          </div>
        ))}
      </div>
    </div>
  )
}
