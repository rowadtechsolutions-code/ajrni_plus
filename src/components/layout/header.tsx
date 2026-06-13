"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import type { LucideIcon } from "lucide-react"
import { Menu, X, User, LogOut, LayoutDashboard, Shield, Heart, Globe } from "lucide-react"
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

            {/* LOGO */}
            <Link href="/" className="flex items-center gap-2.5 shrink-0">
              <img
                src="/images/logo.png"
                alt="أجرني بلس"
                className="h-12 w-auto max-w-[250px] sm:max-w-[280px] md:max-w-[320px] object-contain"
              />
            </Link>

            {/* NAV LINKS - FIXED ONE LINE */}
            <nav className="hidden lg:flex items-center justify-center gap-1 flex-nowrap whitespace-nowrap">
              {(profile?.role === "OFFICE" ? officeNavItems : navItems).map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/" && pathname.startsWith(item.href))

                const NavIcon = "icon" in item ? (item as any).icon : null

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

            {/* RIGHT TOOLS (UNCHANGED) */}
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
                    <Link href="/profile" className="w-8 h-8 rounded-xl bg-gradient-to-br from-secondary to-blue-700 text-white flex items-center justify-center text-xs font-bold shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200">
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
    </>
  )
}