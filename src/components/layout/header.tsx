"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import type { LucideIcon } from "lucide-react"
import { Menu, X, User, LogOut, LayoutDashboard, Shield, Heart, Globe, Car, BarChart3 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useLocaleStore } from "@/store/useLocaleStore"
import { useAuthStore } from "@/store/useAuthStore"
import { useAuth } from "@/hooks/useAuth"
import { useTranslation } from "@/lib/i18n"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const navItems = [
  { href: "/", labelKey: "nav.home" },
  { href: "/about", labelKey: "nav.about" },
  { href: "/cars", labelKey: "nav.cars" },
  { href: "/offices", labelKey: "nav.offices" },
  { href: "/contact", labelKey: "nav.contact" },
]

const officeNavItems: { href: string; labelKey: string; icon: LucideIcon }[] = []

export function Header() {
  const [mobileMenu, setMobileMenu] = useState(false)
  const pathname = usePathname()
  const { isAuthenticated, user, profile, loading } = useAuthStore()
  const { signOut } = useAuth()
  const { locale, setLocale } = useLocaleStore()
  const { t } = useTranslation(locale)

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between lg:grid lg:grid-cols-3 h-16 lg:h-20">
            {/* START - Logo */}
            <Link href="/" className="flex items-center gap-2.5 shrink-0">
              <img
                src="/images/logo.png"
                alt="أجرني بلس"
                className="h-12 w-auto max-w-[250px] sm:max-w-[280px] md:max-w-[320px] object-contain"
              />
            </Link>

            {/* CENTER - Nav links */}
            <nav className="hidden lg:flex items-center justify-center gap-1">
              {(profile?.role === "OFFICE" ? officeNavItems : navItems).map((item) => {
                const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))
                const NavIcon = "icon" in item ? (item as typeof officeNavItems[number]).icon : null
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "relative px-5 py-2 text-sm font-medium rounded-xl transition-all duration-200 whitespace-nowrap",
                      isActive
                        ? "text-secondary"
                        : "text-muted-foreground hover:text-primary"
                    )}
                  >
                    {NavIcon && <NavIcon className="w-4 h-4 inline ml-1.5" />}
                    {t(item.labelKey)}
                    {isActive && (
                      <motion.span
                        layoutId="nav-active"
                        className="absolute -bottom-0.5 left-2 right-2 h-0.5 bg-gradient-to-r from-secondary to-blue-400 rounded-full"
                      />
                    )}
                  </Link>
                )
              })}
            </nav>

            {/* END - Tools */}
            <div className="flex items-center gap-1.5 justify-self-end">
              <button
                onClick={() => setLocale(locale === "ar" ? "en" : "ar")}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-muted-foreground hover:text-primary hover:bg-gray-100 rounded-xl transition-all duration-200"
              >
                <Globe className="w-3.5 h-3.5" />
                {locale === "ar" ? "EN" : "AR"}
              </button>

              <div className="hidden md:flex items-center gap-1.5">
                {loading ? (
                  <div className="w-8 h-8 rounded-full bg-gray-100 animate-pulse" />
                ) : isAuthenticated ? (
                  <>
                    {profile?.role === "CUSTOMER" && (
                      <Link href="/wishlist" className="p-2 rounded-xl text-muted-foreground hover:text-primary hover:bg-gray-100 transition-all duration-200">
                        <Heart className="w-4 h-4" />
                      </Link>
                    )}
                    {profile?.role === "OFFICE" && (
                      <Link href="/dashboard" className="p-2 rounded-xl text-muted-foreground hover:text-primary hover:bg-gray-100 transition-all duration-200">
                        <LayoutDashboard className="w-4 h-4" />
                      </Link>
                    )}
                    {profile?.role === "ADMIN" && (
                      <Link href="/admin" className="p-2 rounded-xl text-muted-foreground hover:text-primary hover:bg-gray-100 transition-all duration-200">
                        <Shield className="w-4 h-4" />
                      </Link>
                    )}
                    <Link
                      href="/profile"
                      className="w-8 h-8 rounded-xl bg-gradient-to-br from-secondary to-blue-700 text-white flex items-center justify-center text-xs font-bold shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200"
                    >
                      {profile?.name?.[0] || user?.email?.[0]?.toUpperCase() || "U"}
                    </Link>
                  </>
                ) : (
                  <>
                    <Link href="/auth/login">
                      <Button variant="ghost" size="sm">{t("nav.login")}</Button>
                    </Link>
                    <Link href="/auth/register">
                      <Button size="sm">{t("nav.register")}</Button>
                    </Link>
                  </>
                )}
              </div>

              <button
                onClick={() => setMobileMenu(true)}
                className="lg:hidden p-2 rounded-xl text-muted-foreground hover:text-primary hover:bg-gray-100 transition-all duration-200"
                aria-label="Menu"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {mobileMenu && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 lg:hidden"
          >
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setMobileMenu(false)} />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 250 }}
              className="absolute top-0 bottom-0 left-0 w-80 max-w-[85vw] bg-white shadow-2xl"
            >
              <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <img
                    src="/images/logo.png"
                    alt="أجرني بلس"
                    className="h-10 w-auto max-w-[180px] object-contain"
                  />
                </div>
                <button onClick={() => setMobileMenu(false)} className="p-2 rounded-xl hover:bg-gray-100 transition-all">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="px-4 pt-4">
                <button
                  onClick={() => { setLocale(locale === "ar" ? "en" : "ar"); setMobileMenu(false) }}
                  className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium bg-gray-50 hover:bg-gray-100 rounded-2xl transition-all duration-200"
                >
                  <span className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-muted-foreground" />
                    {t("nav.language")}
                  </span>
                  <span className="text-xs text-muted-foreground bg-white px-2 py-0.5 rounded-lg border">
                    {locale === "ar" ? "EN" : "AR"}
                  </span>
                </button>
              </div>

              <div className="p-4 space-y-1">
                {(profile?.role === "OFFICE" ? officeNavItems : navItems).map((item) => {
                  const NavIcon = "icon" in item ? (item as typeof officeNavItems[number]).icon : null
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenu(false)}
                      className={cn(
                        "flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-2xl transition-all duration-200",
                        pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))
                          ? "text-secondary bg-secondary/5"
                          : "text-muted-foreground hover:text-primary hover:bg-gray-50"
                      )}
                    >
                      {NavIcon && <NavIcon className="w-4 h-4" />}
                      {t(item.labelKey)}
                    </Link>
                  )
                })}
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100 bg-white">
                {isAuthenticated ? (
                  <div className="space-y-2">
                    <Link href="/profile" onClick={() => setMobileMenu(false)} className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-muted-foreground hover:text-primary hover:bg-gray-50 rounded-2xl transition-all duration-200">
                      <User className="w-4 h-4" />
                      {t("nav.profile")}
                    </Link>
                    <button
                      onClick={() => { signOut(); setMobileMenu(false) }}
                      className="w-full text-right px-4 py-3 text-sm font-medium text-red-500 hover:bg-red-50 rounded-2xl transition-all duration-200"
                    >
                      <LogOut className="w-4 h-4 inline ml-2" />
                      {t("nav.logout")}
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Link href="/auth/login" onClick={() => setMobileMenu(false)} className="flex-1">
                      <Button variant="outline" className="w-full">{t("nav.login")}</Button>
                    </Link>
                    <Link href="/auth/register" onClick={() => setMobileMenu(false)} className="flex-1">
                      <Button className="w-full">{t("nav.register")}</Button>
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
