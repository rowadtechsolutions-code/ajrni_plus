"use client"

import Link from "next/link"
import { ArrowLeft, Bell } from "lucide-react"
import { useLocaleStore } from "@/store/useLocaleStore"
import { NotificationList } from "@/components/notifications/notification-list"

export default function ProfileNotificationsPage() {
  const { locale } = useLocaleStore()

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/profile" className="p-2 rounded-xl hover:bg-muted text-muted-foreground">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-primary flex items-center gap-2">
            <Bell className="w-5 h-5 text-secondary" />
            {locale === "ar" ? "الإشعارات" : "Notifications"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {locale === "ar" ? "جميع إشعارات حسابك" : "All your notifications"}
          </p>
        </div>
      </div>

      <NotificationList />
    </div>
  )
}
