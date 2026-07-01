"use client"

import { Bell } from "lucide-react"
import { useLocaleStore } from "@/store/useLocaleStore"
import { NotificationList } from "@/components/notifications/notification-list"

export default function DashboardNotificationsPage() {
  const { locale } = useLocaleStore()

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-primary flex items-center gap-2">
          <Bell className="w-5 h-5 text-secondary" />
          {locale === "ar" ? "الإشعارات" : "Notifications"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {locale === "ar" ? "جميع إشعارات مكتبك" : "All your office notifications"}
        </p>
      </div>

      <NotificationList />
    </div>
  )
}
