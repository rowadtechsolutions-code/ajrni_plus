"use client"

import { useState, useEffect } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import Link from "next/link"
import { ArrowLeft, User, Save, Loader2, CheckCircle2, AlertCircle } from "lucide-react"
import { useAuthStore } from "@/store/useAuthStore"
import { useLocaleStore } from "@/store/useLocaleStore"
import { useTranslation } from "@/lib/i18n"
import { userService } from "@/lib/supabase/services"
import { gulfCountries, getCitiesByCountryCode } from "@/lib/locations"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { cn } from "@/lib/utils"
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

export default function ProfileEditPage() {
  const { locale } = useLocaleStore()
  const { t } = useTranslation(locale)
  const { isAuthenticated, profile, user, updateProfile } = useAuthStore()
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
        <User className="w-20 h-20 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">
          {locale === "ar" ? "تسجيل الدخول مطلوب" : "Login required"}
        </h2>
        <p className="text-muted-foreground text-sm mb-6">
          {locale === "ar" ? "يرجى تسجيل الدخول لتعديل الملف الشخصي" : "Please log in to edit your profile"}
        </p>
        <Link href="/auth/login"><Button>{t("nav.login")}</Button></Link>
      </div>
    )
  }

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
      <div className="flex items-center gap-3 mb-6">
        <Link href="/profile" className="p-2 rounded-xl hover:bg-muted text-muted-foreground">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-primary">
            {locale === "ar" ? "تعديل البيانات الشخصية" : "Edit Personal Data"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {locale === "ar" ? "قم بتحديث معلومات حسابك" : "Update your account information"}
          </p>
        </div>
      </div>

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
        <form onSubmit={handleSubmit}>
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
                  disabled
                  className="bg-gray-50 text-muted-foreground cursor-not-allowed"
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
      )}
    </div>
  )
}
