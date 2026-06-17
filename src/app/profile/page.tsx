"use client"

import { useState, useEffect } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuthStore } from "@/store/useAuthStore"
import { useAuth } from "@/hooks/useAuth"
import Link from "next/link"
import { User, Shield, LogOut, ChevronLeft, Heart, Save, Loader2, CheckCircle2, AlertCircle, AlertTriangle, Mail, Phone, Globe, MapPin, UserCircle, MessageCircle } from "lucide-react"
import { useLocaleStore } from "@/store/useLocaleStore"
import { useTranslation } from "@/lib/i18n"
import { userService } from "@/lib/supabase/services"
import { gulfCountries, getCitiesByCountryCode } from "@/lib/locations"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Modal } from "@/components/ui/modal"
import { getInitials, cn } from "@/lib/utils"
import { motion } from "framer-motion"

function SectionCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("bg-white rounded-2xl border border-gray-200 shadow-sm", className)}
    >
      {children}
    </motion.div>
  )
}

function SkeletonBlock() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-5 p-6 bg-white rounded-2xl border border-gray-200 shadow-sm animate-pulse">
        <div className="w-20 h-20 rounded-2xl bg-gray-200 shrink-0" />
        <div className="space-y-2 flex-1">
          <div className="h-5 bg-gray-200 rounded w-40" />
          <div className="h-4 bg-gray-200 rounded w-56" />
          <div className="h-5 w-16 bg-gray-200 rounded-full" />
        </div>
      </div>
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4 animate-pulse">
        <div className="h-5 bg-gray-200 rounded w-32 mb-2" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-20" />
              <div className="h-[46px] bg-gray-200 rounded-xl" />
            </div>
          ))}
        </div>
        <div className="h-10 bg-gray-200 rounded-xl w-[140px]" />
      </div>
    </div>
  )
}

export default function ProfilePage() {
  const { locale } = useLocaleStore()
  const { t } = useTranslation(locale)
  const { isAuthenticated, profile, user, updateProfile } = useAuthStore()
  const { signOut } = useAuth()
  const queryClient = useQueryClient()

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone_number: "",
    country: "",
    city: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [successMsg, setSuccessMsg] = useState("")
  const [showLogoutModal, setShowLogoutModal] = useState(false)

  const { data: userData, isLoading } = useQuery({
    queryKey: ["user-profile", user?.id],
    queryFn: () => userService.getProfile(user!.id),
    enabled: !!user?.id,
  })

  useEffect(() => {
    if (userData) {
      setForm({
        full_name: userData.full_name || "",
        email: userData.email || "",
        phone_number: userData.phone_number || "",
        country: userData.country || "",
        city: userData.city || "",
      })
    } else if (profile) {
      setForm({
        full_name: profile.full_name || profile.name || "",
        email: profile.email || user?.email || "",
        phone_number: profile.phone_number || "",
        country: profile.country || "",
        city: profile.city || "",
      })
    }
  }, [userData, profile, user])

  const cities = form.country ? getCitiesByCountryCode(form.country) : []

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: "" }))
    if (field === "country") setForm((prev) => ({ ...prev, city: "" }))
  }

  const validate = (): boolean => {
    const errs: Record<string, string> = {}
    if (!form.full_name.trim())
      errs.full_name = locale === "ar" ? "الاسم مطلوب" : "Full name is required"
    if (!form.email.trim())
      errs.email = locale === "ar" ? "البريد الإلكتروني مطلوب" : "Email is required"
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = locale === "ar" ? "بريد إلكتروني غير صالح" : "Invalid email"
    if (!form.phone_number.trim())
      errs.phone_number = locale === "ar" ? "رقم الهاتف مطلوب" : "Phone number is required"
    if (!form.country)
      errs.country = locale === "ar" ? "الدولة مطلوبة" : "Country is required"
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error("Not authenticated")
      return userService.updateProfile(user.id, {
        full_name: form.full_name.trim(),
        email: form.email.trim(),
        phone_number: form.phone_number.trim(),
        country: form.country,
        city: form.city,
      })
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["user-profile"] })
      updateProfile({ ...profile, ...data })
      setSuccessMsg(locale === "ar" ? "تم تحديث الملف الشخصي بنجاح" : "Profile updated successfully")
      setTimeout(() => setSuccessMsg(""), 4000)
    },
    onError: (err: Error) => {
      setErrors({
        _form: err.message || (locale === "ar" ? "حدث خطأ أثناء الحفظ" : "An error occurred while saving"),
      })
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSuccessMsg("")
    if (!validate()) return
    updateMutation.mutate()
  }

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 text-center">
        <UserCircle className="w-20 h-20 text-muted-foreground mx-auto mb-4" />
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

  const fullName = form.full_name || user?.email || "User"
  const initials = getInitials(fullName)
  const roleLabel = profile?.role === "OFFICE"
    ? (locale === "ar" ? "مكتب تأجير" : "Rental Office")
    : profile?.role === "ADMIN"
    ? (locale === "ar" ? "مدير" : "Admin")
    : (locale === "ar" ? "مستأجر" : "Customer")
  const roleDotColor = profile?.role === "OFFICE" ? "bg-secondary" : profile?.role === "ADMIN" ? "bg-accent" : "bg-success"

  const navItems = [
    { icon: MessageCircle, label: locale === "ar" ? "طلباتي" : "My Requests", href: "/my-requests", desc: locale === "ar" ? "عرض طلبات السيارات" : "View car requests" },
    ...(profile?.role !== "OFFICE" ? [{ icon: Heart, label: t("nav.wishlist"), href: "/favorites", desc: locale === "ar" ? "السيارات المفضلة" : "Favorite cars" }] : []),
    ...(profile?.role === "OFFICE" ? [{ icon: Shield, label: t("nav.dashboard"), href: "/dashboard", desc: locale === "ar" ? "لوحة التحكم" : "Dashboard" }] : []),
    ...(profile?.role === "ADMIN" ? [{ icon: Shield, label: t("nav.admin"), href: "/admin", desc: locale === "ar" ? "لوحة الإدارة" : "Admin panel" }] : []),
  ]

  const countryOptions = gulfCountries.map((c) => ({
    value: c.code,
    label: locale === "ar" ? c.nameAr : c.nameEn,
  }))

  const cityOptions = cities.map((c) => ({
    value: c.nameAr,
    label: locale === "ar" ? c.nameAr : c.nameEn,
  }))

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-8">
      {successMsg && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="flex items-center gap-2.5 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-6 text-sm"
        >
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          {successMsg}
        </motion.div>
      )}

      {errors._form && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="flex items-center gap-2.5 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm"
        >
          <AlertCircle className="w-4 h-4 shrink-0" />
          {errors._form}
        </motion.div>
      )}

      {isLoading ? (
        <SkeletonBlock />
      ) : (
        <>
          <SectionCard>
            <div className="p-6">
              <div className="flex items-center gap-5">
                <div className="relative w-20 h-20 shrink-0">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-secondary/20 to-secondary/5 border border-gray-200 flex items-center justify-center">
                    <span className="text-2xl font-bold text-secondary">{initials}</span>
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className="text-xl font-bold text-primary truncate">{fullName}</h1>
                  <p className="text-sm text-muted-foreground truncate">{form.email || user?.email}</p>
                  <div className="inline-flex items-center gap-1.5 mt-2 px-3 py-0.5 rounded-full bg-secondary/10 text-secondary text-xs font-medium">
                    <span className={cn("w-1.5 h-1.5 rounded-full", roleDotColor)} />
                    {roleLabel}
                  </div>
                </div>
              </div>
            </div>
          </SectionCard>

          <form onSubmit={handleSubmit} className="mt-6">
            <SectionCard>
              <div className="p-6 space-y-6">
                <div>
                  <h2 className="text-base font-semibold text-primary flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    {locale === "ar" ? "المعلومات الشخصية" : "Personal Information"}
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {locale === "ar" ? "قم بتحديث بياناتك الأساسية" : "Update your basic information"}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    id="full_name"
                    label={locale === "ar" ? "الاسم الكامل" : "Full name"}
                    value={form.full_name}
                    onChange={(e) => handleChange("full_name", e.target.value)}
                    error={errors.full_name}
                  />
                  <Input
                    id="email"
                    label={locale === "ar" ? "البريد الإلكتروني" : "Email"}
                    type="email"
                    value={form.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    error={errors.email}
                  />
                  <Input
                    id="phone_number"
                    label={locale === "ar" ? "رقم الهاتف" : "Phone number"}
                    type="tel"
                    value={form.phone_number}
                    onChange={(e) => handleChange("phone_number", e.target.value)}
                    error={errors.phone_number}
                  />
                  <Select
                    id="country"
                    label={locale === "ar" ? "الدولة" : "Country"}
                    value={form.country}
                    onChange={(e) => handleChange("country", e.target.value)}
                    error={errors.country}
                    options={countryOptions}
                  />
                  <Select
                    id="city"
                    label={locale === "ar" ? "المدينة" : "City"}
                    value={form.city}
                    onChange={(e) => handleChange("city", e.target.value)}
                    disabled={!form.country}
                    options={cityOptions}
                  />
                </div>

                <div className="border-t border-gray-100 pt-5">
                  <Button
                    type="submit"
                    disabled={updateMutation.isPending}
                    className="min-w-[160px]"
                    size="lg"
                  >
                    {updateMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    {locale === "ar" ? "حفظ التعديلات" : "Save changes"}
                  </Button>
                </div>
              </div>
            </SectionCard>
          </form>

          {navItems.length > 0 && (
            <SectionCard className="mt-6 divide-y divide-gray-100 overflow-hidden">
              {navItems.map((item, idx) => (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.08 }}
                >
                  <Link
                    href={item.href}
                    className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-secondary/10 flex items-center justify-center shrink-0 group-hover:bg-secondary/20 transition-colors">
                        <item.icon className="w-4 h-4 text-secondary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-primary">{item.label}</p>
                        <p className="text-xs text-muted-foreground">{item.desc}</p>
                      </div>
                    </div>
                    <ChevronLeft className="w-4 h-4 text-muted-foreground group-hover:-translate-x-0.5 transition-transform" />
                  </Link>
                </motion.div>
              ))}
            </SectionCard>
          )}

          <div className="mt-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Button
                variant="danger"
                className="w-full"
                size="lg"
                onClick={() => setShowLogoutModal(true)}
              >
                <LogOut className="w-4 h-4" />
                {t("nav.logout")}
              </Button>
            </motion.div>
          </div>
        </>
      )}

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
