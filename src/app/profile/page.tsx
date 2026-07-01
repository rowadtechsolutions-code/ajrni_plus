"use client"

import { useState } from "react"
import Link from "next/link"
import { User, Heart, LogOut, ChevronLeft, AlertTriangle, MessageCircle, Bell } from "lucide-react"
import { useAuthStore } from "@/store/useAuthStore"
import { useAuth } from "@/hooks/useAuth"
import { useLocaleStore } from "@/store/useLocaleStore"
import { useTranslation } from "@/lib/i18n"
import { useUnreadCount } from "@/hooks/useUnreadNotifications"
import { Button } from "@/components/ui/button"
import { Modal } from "@/components/ui/modal"
import { getInitials, cn } from "@/lib/utils"
import { motion } from "framer-motion"

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gray-200 shrink-0" />
        <div className="flex-1 space-y-1.5">
          <div className="h-4 bg-gray-200 rounded w-2/3" />
          <div className="h-3 bg-gray-200 rounded w-1/3" />
        </div>
      </div>
    </div>
  )
}

export default function ProfilePage() {
  const { locale } = useLocaleStore()
  const { t } = useTranslation(locale)
  const { isAuthenticated, profile, user, loading } = useAuthStore()
  const { signOut } = useAuth()
  const { unreadCount } = useUnreadCount()
  const [showLogoutModal, setShowLogoutModal] = useState(false)

  if (!isAuthenticated && !loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 text-center">
        <User className="w-20 h-20 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">
          {locale === "ar" ? "تسجيل الدخول مطلوب" : "Login required"}
        </h2>
        <p className="text-muted-foreground text-sm mb-6">
          {locale === "ar" ? "يرجى تسجيل الدخول لعرض الملف الشخصي" : "Please log in to view your profile"}
        </p>
        <Link href="/auth/login"><Button>{t("nav.login")}</Button></Link>
      </div>
    )
  }

  const fullName = profile?.full_name || profile?.name || user?.email?.split("@")[0] || "User"
  const initials = getInitials(fullName)
  const roleLabel = profile?.role === "OFFICE"
    ? (locale === "ar" ? "مكتب تأجير" : "Rental Office")
    : profile?.role === "ADMIN"
    ? (locale === "ar" ? "مدير" : "Admin")
    : (locale === "ar" ? "مستأجر" : "Customer")
  const roleDotColor = profile?.role === "OFFICE" ? "bg-secondary" : profile?.role === "ADMIN" ? "bg-accent" : "bg-success"

  const navItems = [
    { icon: User, label: locale === "ar" ? "تعديل بياناتي الشخصية" : "Edit Personal Data", href: "/profile/edit", desc: locale === "ar" ? "تحديث معلومات حسابك" : "Update your account info" },
    { icon: MessageCircle, label: locale === "ar" ? "طلباتي" : "My Requests", href: "/my-requests", desc: locale === "ar" ? "عرض طلبات السيارات" : "View car requests" },
    ...(profile?.role !== "OFFICE" ? [{ icon: Heart, label: t("nav.wishlist"), href: "/favorites", desc: locale === "ar" ? "السيارات المفضلة" : "Favorite cars" }] : []),
    { icon: Bell, label: locale === "ar" ? "الإشعارات" : "Notifications", href: "/profile/notifications", desc: locale === "ar" ? "عرض الإشعارات" : "View notifications", badge: unreadCount },
  ]

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-8 space-y-4">
        <div className="h-8 bg-gray-200 rounded w-32 animate-pulse mb-6" />
        <div className="flex items-center gap-4 p-5 bg-white rounded-2xl border border-gray-200 shadow-sm animate-pulse">
          <div className="w-16 h-16 rounded-2xl bg-gray-200 shrink-0" />
          <div className="space-y-2 flex-1">
            <div className="h-5 bg-gray-200 rounded w-40" />
            <div className="h-4 bg-gray-200 rounded w-56" />
            <div className="h-4 w-16 bg-gray-200 rounded-full" />
          </div>
        </div>
        {[1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)}
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-8">
      <motion.h1
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl font-bold text-primary mb-6"
      >
        {locale === "ar" ? "حسابي" : "My Account"}
      </motion.h1>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4 p-5 bg-white rounded-2xl border border-gray-200 shadow-sm mb-6"
      >
        <div className="w-16 h-16 shrink-0 rounded-2xl bg-gradient-to-br from-secondary/20 to-secondary/5 border border-gray-200 flex items-center justify-center">
          <span className="text-xl font-bold text-secondary">{initials}</span>
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-bold text-primary truncate">{fullName}</h2>
          <p className="text-sm text-muted-foreground truncate">{user?.email}</p>
          <div className="inline-flex items-center gap-1.5 mt-1.5 px-2.5 py-0.5 rounded-full bg-secondary/10 text-secondary text-[11px] font-medium">
            <span className={cn("w-1.5 h-1.5 rounded-full", roleDotColor)} />
            {roleLabel}
          </div>
        </div>
      </motion.div>

      <div className="mb-2">
        <h3 className="text-sm font-semibold text-muted-foreground px-1">
          {locale === "ar" ? "الحساب" : "Account"}
        </h3>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden divide-y divide-gray-100">
        {navItems.map((item, idx) => (
          <motion.div
            key={item.href}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <Link
              href={item.href}
              className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors active:bg-muted/80 group"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center shrink-0 group-hover:bg-secondary/20 transition-colors">
                  <item.icon className="w-5 h-5 text-secondary" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-primary">{item.label}</p>
                  {'desc' in item && item.desc && (
                    <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {'badge' in item && item.badge && (item.badge as number) > 0 && (
                  <span className="bg-error text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                    {(item.badge as number) > 99 ? "99+" : item.badge}
                  </span>
                )}
                <ChevronLeft className="w-4 h-4 text-muted-foreground group-hover:-translate-x-0.5 transition-transform" />
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      <div className="mt-6 mb-2">
        <h3 className="text-sm font-semibold text-muted-foreground px-1">
          {locale === "ar" ? "إعدادات الحساب" : "Account Settings"}
        </h3>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <button
          onClick={() => setShowLogoutModal(true)}
          className="w-full flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-200 shadow-sm hover:bg-red-50/50 transition-colors active:bg-red-50/80 group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-error/10 flex items-center justify-center shrink-0 group-hover:bg-error/20 transition-colors">
              <LogOut className="w-5 h-5 text-error" />
            </div>
            <p className="text-sm font-medium text-error">{locale === "ar" ? "تسجيل الخروج" : "Logout"}</p>
          </div>
          <ChevronLeft className="w-4 h-4 text-error/60 group-hover:-translate-x-0.5 transition-transform" />
        </button>
      </motion.div>

      <Modal open={showLogoutModal} onClose={() => setShowLogoutModal(false)} title={locale === "ar" ? "تسجيل الخروج" : "Log out"}>
        <div className="text-center">
          <div className="w-14 h-14 rounded-full bg-error/10 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-7 h-7 text-error" />
          </div>
          <p className="text-sm text-muted-foreground mb-6">
            {locale === "ar" ? "هل أنت متأكد من تسجيل الخروج؟" : "Are you sure you want to log out?"}
          </p>
          <div className="flex items-center gap-3 justify-center">
            <Button variant="outline" onClick={() => setShowLogoutModal(false)}>
              {locale === "ar" ? "إلغاء" : "Cancel"}
            </Button>
            <Button variant="danger" onClick={() => { setShowLogoutModal(false); signOut() }}>
              <LogOut className="w-4 h-4" />
              {locale === "ar" ? "تسجيل الخروج" : "Log out"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
