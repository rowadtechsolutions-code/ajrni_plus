"use client"

import { useState, useEffect } from "react"
import { TrendingUp, Car, CalendarCheck, Clock } from "lucide-react"
import { useLocaleStore } from "@/store/useLocaleStore"
import { useAuthStore } from "@/store/useAuthStore"
import { useTranslation } from "@/lib/i18n"
import { getClient } from "@/lib/supabase/client"

export default function DashboardAnalyticsPage() {
  const { locale } = useLocaleStore()
  const { t } = useTranslation(locale)
  const { officeId } = useAuthStore()
  const supabase = getClient()

  const [totalCars, setTotalCars] = useState(0)
  const [availableCars, setAvailableCars] = useState(0)
  const [totalRequests, setTotalRequests] = useState(0)
  const [pendingRequests, setPendingRequests] = useState(0)
  const [latestBookings, setLatestBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!officeId) return
    setLoading(true)

    Promise.all([
      supabase.from("cars").select("*").eq("office_id", officeId),
      supabase.from("bookings").select("*, car:cars(*), customer:users(*)").eq("officeId", officeId).order("createdAt", { ascending: false }).limit(5),
    ]).then(([carsResult, bookingsResult]) => {
      if (carsResult.data) {
        setTotalCars(carsResult.data.length)
        setAvailableCars(carsResult.data.filter((c: any) => c.status === "available").length)
      }
      const bookingData = bookingsResult.data || []
      setTotalRequests(bookingData.length)
      setPendingRequests(bookingData.filter((b: any) => b.status === "PENDING").length)
      setLatestBookings(bookingData.slice(0, 5))
    }).catch(() => {}).finally(() => setLoading(false))
  }, [officeId, supabase])

  const stats = [
    { icon: Car, label: locale === "ar" ? "إجمالي السيارات" : "Total Cars", value: totalCars.toString() },
    { icon: TrendingUp, label: locale === "ar" ? "السيارات المتاحة" : "Available Cars", value: availableCars.toString() },
    { icon: CalendarCheck, label: locale === "ar" ? "إجمالي الطلبات" : "Total Requests", value: totalRequests.toString() },
    { icon: Clock, label: locale === "ar" ? "الطلبات المعلقة" : "Pending Requests", value: pendingRequests.toString() },
  ]

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-xl font-bold text-primary mb-6">{t("dashboard.analytics")}</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
            <stat.icon className="w-5 h-5 text-muted-foreground mb-2" />
            <p className="text-2xl font-bold text-primary">{loading ? "..." : stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <h3 className="font-semibold text-primary mb-4">{locale === "ar" ? "آخر الطلبات" : "Latest Requests"}</h3>
        {loading ? (
          <div className="h-24 flex items-center justify-center text-muted-foreground">{locale === "ar" ? "جاري التحميل..." : "Loading..."}</div>
        ) : latestBookings.length > 0 ? (
          <div className="space-y-3">
            {latestBookings.map((booking: any) => (
              <div key={booking.id} className="flex items-center justify-between p-3 rounded-xl bg-muted">
                <div>
                  <p className="text-sm font-medium text-primary">{booking.car?.name || locale === "ar" ? "سيارة" : "Car"}</p>
                  <p className="text-xs text-muted-foreground">{booking.customer?.full_name || booking.customerName || "-"}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                  booking.status === "PENDING" ? "bg-amber-100 text-amber-700" :
                  booking.status === "ACCEPTED" ? "bg-green-100 text-green-700" :
                  booking.status === "COMPLETED" ? "bg-blue-100 text-blue-700" :
                  booking.status === "REJECTED" ? "bg-red-100 text-red-700" :
                  "bg-gray-100 text-gray-700"
                }`}>
                  {booking.status === "PENDING" ? (locale === "ar" ? "معلق" : "Pending") :
                   booking.status === "ACCEPTED" ? (locale === "ar" ? "مقبول" : "Accepted") :
                   booking.status === "COMPLETED" ? (locale === "ar" ? "مكتمل" : "Completed") :
                   booking.status === "REJECTED" ? (locale === "ar" ? "مرفوض" : "Rejected") :
                   booking.status || "-"}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="h-24 flex items-center justify-center text-muted-foreground">{locale === "ar" ? "لا توجد طلبات حتى الآن" : "No requests yet"}</div>
        )}
      </div>
    </div>
  )
}
