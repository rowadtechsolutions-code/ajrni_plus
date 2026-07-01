"use client"

import { useState } from "react"
import { Bell, Check, ChevronLeft, ChevronRight, Loader2, AlertCircle } from "lucide-react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuthStore } from "@/store/useAuthStore"
import { useLocaleStore } from "@/store/useLocaleStore"
import { notificationService } from "@/lib/supabase/notifications"
import { useUnreadCount } from "@/hooks/useUnreadNotifications"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import type { NotificationType } from "@/types"

function formatRelativeTime(dateStr: string, locale: string) {
  const now = new Date()
  const date = new Date(dateStr)
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)

  if (locale === "ar") {
    if (diffMin < 1) return "الآن"
    if (diffMin < 60) {
      if (diffMin === 1) return "منذ دقيقة"
      if (diffMin === 2) return "منذ دقيقتين"
      if (diffMin <= 10) return `منذ ${diffMin} دقائق`
      return `منذ ${diffMin} دقيقة`
    }
    const diffHour = Math.floor(diffMin / 60)
    if (diffHour < 24) {
      if (diffHour === 1) return "منذ ساعة"
      if (diffHour === 2) return "منذ ساعتين"
      if (diffHour <= 10) return `منذ ${diffHour} ساعات`
      return `منذ ${diffHour} ساعة`
    }
    const diffDay = Math.floor(diffHour / 24)
    if (diffDay === 1) return "أمس"
    if (diffDay === 2) return "منذ يومين"
    if (diffDay <= 10) return `منذ ${diffDay} أيام`
    return new Intl.DateTimeFormat("ar-SA", { dateStyle: "medium" }).format(date)
  }

  if (diffMin < 1) return "now"
  if (diffMin < 60) return `${diffMin}m ago`
  const diffHour = Math.floor(diffMin / 60)
  if (diffHour < 24) return `${diffHour}h ago`
  const diffDay = Math.floor(diffHour / 24)
  if (diffDay === 1) return "yesterday"
  if (diffDay < 7) return `${diffDay}d ago`
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(date)
}

export function NotificationList() {
  const [page, setPage] = useState(1)
  const { user } = useAuthStore()
  const { locale } = useLocaleStore()
  const queryClient = useQueryClient()
  const { unreadCount, invalidate } = useUnreadCount()

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["notifications", user?.id, page],
    queryFn: () => notificationService.getNotifications(user!.id, page),
    enabled: !!user?.id,
  })

  const notifications = data?.data || []
  const totalCount = data?.count || 0
  const totalPages = Math.max(1, Math.ceil(totalCount / 20))

  const markReadMutation = useMutation({
    mutationFn: (id: string) => notificationService.markAsRead(id, user!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] })
      invalidate()
    },
  })

  const markAllMutation = useMutation({
    mutationFn: () => notificationService.markAllAsRead(user!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] })
      invalidate()
    },
  })

  const handleMarkAsRead = (notification: NotificationType) => {
    if (!notification.is_read) {
      markReadMutation.mutate(notification.id)
    }
  }

  if (!user) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        {locale === "ar" ? "يرجى تسجيل الدخول" : "Please log in"}
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 animate-pulse">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-gray-200 shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
                <div className="h-2 bg-gray-200 rounded w-1/4" />
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (isError) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8 text-error" />
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          {locale === "ar" ? "تعذر تحميل الإشعارات، حاول مرة أخرى" : "Failed to load notifications, please try again"}
        </p>
        <Button variant="outline" onClick={() => refetch()}>
          {locale === "ar" ? "إعادة المحاولة" : "Retry"}
        </Button>
      </div>
    )
  }

  return (
    <div>
      {unreadCount > 0 && (
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {locale === "ar"
              ? `لديك ${unreadCount} إشعار${unreadCount === 1 ? "" : unreadCount === 2 ? "ان" : "ات"} غير مقروء${unreadCount === 1 ? "" : "ة"}`
              : `You have ${unreadCount} unread notification${unreadCount === 1 ? "" : "s"}`}
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => markAllMutation.mutate()}
            disabled={markAllMutation.isPending}
          >
            {markAllMutation.isPending ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Check className="w-3.5 h-3.5" />
            )}
            {locale === "ar" ? "تعليم الكل كمقروء" : "Mark all as read"}
          </Button>
        </div>
      )}

      {notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
            <Bell className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-primary mb-2">
            {locale === "ar" ? "لا توجد إشعارات" : "No notifications"}
          </h3>
          <p className="text-sm text-muted-foreground text-center max-w-sm">
            {locale === "ar" ? "ستظهر إشعارات حسابك هنا عند وصولها." : "Your notifications will appear here."}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n, idx) => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.03 }}
              onClick={() => handleMarkAsRead(n)}
              className={cn(
                "flex items-start gap-3 p-4 rounded-2xl border cursor-pointer transition-all hover:shadow-sm",
                !n.is_read
                  ? "bg-secondary/5 border-secondary/20"
                  : "bg-white border-gray-200"
              )}
            >
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                !n.is_read ? "bg-secondary/15 text-secondary" : "bg-muted text-muted-foreground"
              )}>
                <Bell className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className={cn("text-sm", !n.is_read ? "font-semibold text-primary" : "text-muted-foreground")}>
                    {n.title}
                  </p>
                  {!n.is_read && (
                    <span className="w-2 h-2 rounded-full bg-secondary shrink-0 mt-1.5" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.body}</p>
                <p className="text-[10px] text-muted-foreground/60 mt-1.5">
                  {formatRelativeTime(n.created_at, locale)}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-6">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            <ChevronRight className="w-4 h-4" />
            {locale === "ar" ? "السابق" : "Previous"}
          </Button>
          <span className="text-xs text-muted-foreground">
            {page} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            {locale === "ar" ? "التالي" : "Next"}
            <ChevronLeft className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
