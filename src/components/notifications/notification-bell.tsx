"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import Link from "next/link"
import { Bell } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuthStore } from "@/store/useAuthStore"
import { useLocaleStore } from "@/store/useLocaleStore"
import { notificationService } from "@/lib/supabase/notifications"
import { useUnreadCount } from "@/hooks/useUnreadNotifications"
import { cn } from "@/lib/utils"
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

export function NotificationBell() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const { user } = useAuthStore()
  const { locale } = useLocaleStore()
  const queryClient = useQueryClient()
  const { unreadCount, invalidate } = useUnreadCount()

  const { data: recentNotifications = [] } = useQuery({
    queryKey: ["recent-notifications", user?.id],
    queryFn: () => notificationService.getRecentNotifications(user!.id, 5),
    enabled: !!user?.id && open,
  })

  const markReadMutation = useMutation({
    mutationFn: (id: string) => notificationService.markAsRead(id, user!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recent-notifications"] })
      queryClient.invalidateQueries({ queryKey: ["notifications"] })
      invalidate()
    },
  })

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [open])

  const handleNotificationClick = useCallback((notification: NotificationType) => {
    if (!notification.is_read) {
      markReadMutation.mutate(notification.id)
    }
    setOpen(false)
  }, [markReadMutation])

  if (!user) return null

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-xl text-muted-foreground hover:text-primary hover:bg-gray-100 transition-all duration-200"
        aria-label={locale === "ar" ? "الإشعارات" : "Notifications"}
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-error text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full min-w-[16px] text-center leading-tight">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className={cn(
              "absolute top-full mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden",
              locale === "ar" ? "left-0" : "right-0"
            )}
          >
            <div className="p-3 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-primary">
                {locale === "ar" ? "الإشعارات" : "Notifications"}
              </h3>
              {unreadCount > 0 && (
                <span className="text-[11px] bg-secondary/10 text-secondary font-medium px-2 py-0.5 rounded-full">
                  {unreadCount} {locale === "ar" ? "غير مقروء" : "unread"}
                </span>
              )}
            </div>

            <div className="max-h-[360px] overflow-y-auto">
              {recentNotifications.length === 0 ? (
                <div className="p-6 text-center text-sm text-muted-foreground">
                  {locale === "ar" ? "لا توجد إشعارات" : "No notifications"}
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {recentNotifications.map((n) => (
                    <Link
                      key={n.id}
                      href={user ? "/profile/notifications" : "#"}
                      onClick={() => handleNotificationClick(n)}
                      className={cn(
                        "flex items-start gap-3 p-3 hover:bg-muted/50 transition-colors",
                        !n.is_read && "bg-secondary/5"
                      )}
                    >
                      <div className={cn(
                        "w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5",
                        !n.is_read ? "bg-secondary/15 text-secondary" : "bg-muted text-muted-foreground"
                      )}>
                        <Bell className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={cn("text-sm truncate", !n.is_read ? "font-semibold text-primary" : "text-muted-foreground")}>
                          {n.title}
                        </p>
                        <p className="text-xs text-muted-foreground truncate mt-0.5">{n.body}</p>
                        <p className="text-[10px] text-muted-foreground/60 mt-1">{formatRelativeTime(n.created_at, locale)}</p>
                      </div>
                      {!n.is_read && (
                        <span className="w-2 h-2 rounded-full bg-secondary shrink-0 mt-2" />
                      )}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link
              href={user ? "/profile/notifications" : "#"}
              onClick={() => setOpen(false)}
              className="block p-3 text-center text-sm font-medium text-secondary hover:bg-secondary/5 border-t border-gray-100 transition-colors"
            >
              {locale === "ar" ? "عرض جميع الإشعارات" : "View all notifications"}
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
