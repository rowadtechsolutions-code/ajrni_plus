"use client"

import { useState, useEffect } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuthStore } from "@/store/useAuthStore"
import { useAuth } from "@/hooks/useAuth"
import Link from "next/link"
import { User, Shield, LogOut, ChevronLeft, Heart, Save, Loader2, CheckCircle2, AlertCircle, AlertTriangle } from "lucide-react"
import { useLocaleStore } from "@/store/useLocaleStore"
import { useTranslation } from "@/lib/i18n"
import { userService } from "@/lib/supabase/services"
import { gulfCountries, getCitiesByCountryCode } from "@/lib/locations"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Modal } from "@/components/ui/modal"
import { getInitials, cn } from "@/lib/utils"

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
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 text-center">
        <User className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">{locale === "ar" ? "تسجيل الدخول مطلوب" : "Login required"}</h2>
        <Link href="/auth/login"><Button>{t("nav.login")}</Button></Link>
      </div>
    )
  }

  const navItems = [
    ...(profile?.role === "OFFICE" ? [{ icon: Shield, label: t("nav.dashboard"), href: "/dashboard" }] : []),
    ...(profile?.role === "ADMIN" ? [{ icon: Shield, label: t("nav.admin"), href: "/admin" }] : []),
    ...(profile?.role !== "OFFICE" ? [{ icon: Heart, label: t("nav.wishlist"), href: "/favorites" }] : []),
  ]

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 max-w-2xl">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-secondary text-white flex items-center justify-center text-xl font-bold shrink-0">
            {getInitials(form.full_name || user?.email || "U")}
          </div>
          <div>
            <h2 className="text-xl font-bold text-primary">{form.full_name || user?.email || "User"}</h2>
            <p className="text-sm text-muted-foreground">{form.email || user?.email}</p>
            <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full bg-secondary/10 text-secondary font-medium">
              {profile?.role === "OFFICE" ? (locale === "ar" ? "مكتب تأجير" : "Rental Office") : profile?.role === "ADMIN" ? (locale === "ar" ? "مدير" : "Admin") : (locale === "ar" ? "مستأجر" : "Customer")}
            </span>
          </div>
        </div>
      </div>

      {successMsg && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-4 text-sm">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          {successMsg}
        </div>
      )}

      {errors._form && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {errors._form}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-4 space-y-4">
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
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-primary">
                {locale === "ar" ? "الدولة" : "Country"}
              </label>
              <select
                className={cn(
                  "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20",
                  errors.country && "border-error"
                )}
                value={form.country}
                onChange={(e) => handleChange("country", e.target.value)}
              >
                <option value="">
                  {locale === "ar" ? "اختر الدولة" : "Select country"}
                </option>
                {gulfCountries.map((c) => (
                  <option key={c.code} value={c.code}>
                    {locale === "ar" ? c.nameAr : c.nameEn}
                  </option>
                ))}
              </select>
              {errors.country && <p className="text-xs text-error mt-1">{errors.country}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-primary">
                {locale === "ar" ? "المدينة" : "City"}
              </label>
              <select
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                value={form.city}
                onChange={(e) => handleChange("city", e.target.value)}
                disabled={!form.country}
              >
                <option value="">
                  {locale === "ar" ? "اختر المدينة" : "Select city"}
                </option>
                {cities.map((c) => (
                  <option key={c.nameAr} value={c.nameAr}>
                    {locale === "ar" ? c.nameAr : c.nameEn}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-2">
            <Button type="submit" disabled={updateMutation.isPending || isLoading} className="min-w-[140px]">
              {updateMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {locale === "ar" ? "حفظ التعديلات" : "Save changes"}
            </Button>
          </div>
        </div>
      </form>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm divide-y divide-border">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href} className="flex items-center justify-between p-4 hover:bg-muted transition-colors">
            <div className="flex items-center gap-3">
              <item.icon className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm font-medium">{item.label}</span>
            </div>
            <ChevronLeft className="w-4 h-4 text-muted-foreground" />
          </Link>
        ))}
      </div>

      <div className="mt-4">
        <Button variant="danger" className="w-full" onClick={() => setShowLogoutModal(true)}>
          <LogOut className="w-4 h-4 ml-2" />
          {t("nav.logout")}
        </Button>
      </div>

      <Modal open={showLogoutModal} onClose={() => setShowLogoutModal(false)} title={locale === "ar" ? "تسجيل الخروج" : "Log out"}>
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-error mx-auto mb-3" />
          <p className="text-sm text-muted-foreground mb-6">
            {locale === "ar" ? "هل أنت متأكد من تسجيل الخروج؟" : "Are you sure you want to log out?"}
          </p>
          <div className="flex items-center gap-3 justify-center">
            <Button variant="outline" onClick={() => setShowLogoutModal(false)}>
              {locale === "ar" ? "إلغاء" : "Cancel"}
            </Button>
            <Button variant="danger" onClick={() => { setShowLogoutModal(false); signOut() }}>
              <LogOut className="w-4 h-4 ml-2" />
              {locale === "ar" ? "تسجيل الخروج" : "Log out"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
