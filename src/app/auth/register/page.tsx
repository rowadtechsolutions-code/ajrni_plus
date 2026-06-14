"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { motion } from "framer-motion"
import { User, Building2 } from "lucide-react"
import { useLocaleStore } from "@/store/useLocaleStore"
import { useTranslation } from "@/lib/i18n"
import { registerSchema, type RegisterFormData } from "@/lib/validations"
import { useAuth } from "@/hooks/useAuth"
import { gulfCountries, getCitiesByCountryCode } from "@/lib/locations"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { cn } from "@/lib/utils"

export default function RegisterPage() {
  const { locale } = useLocaleStore()
  const { t } = useTranslation(locale)
  const router = useRouter()
  const { signUp } = useAuth()
  const [role, setRole] = useState<"CUSTOMER" | "OFFICE">("CUSTOMER")
  const [error, setError] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [confirmError, setConfirmError] = useState("")

  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: "CUSTOMER" },
  })

  const selectedCountry = watch("country")
  const cities = selectedCountry ? getCitiesByCountryCode(selectedCountry) : []

  const onSubmit = async (data: RegisterFormData) => {
    setError("")
    setConfirmError("")
    if (data.password !== confirmPassword) {
      setConfirmError(locale === "ar" ? "كلمة المرور غير متطابقة" : "Passwords do not match"); return
    }
    if (role === "CUSTOMER" && !data.name) {
      setError(locale === "ar" ? "يرجى إدخال الاسم" : "Please enter your name"); return
    }
    if (role === "OFFICE") {
      if (!data.country) { setError(locale === "ar" ? "يرجى اختيار الدولة" : "Please select a country"); return }
      if (!data.city) { setError(locale === "ar" ? "يرجى اختيار المدينة" : "Please select a city"); return }
      if (!data.officeName) { setError(locale === "ar" ? "يرجى إدخال اسم المكتب" : "Please enter office name"); return }
      if (!data.commercialRegistrationNumber) { setError(locale === "ar" ? "يرجى إدخال رقم السجل التجاري" : "Please enter commercial registration number"); return }
    }
    try {
      await signUp({ ...data, role })
      router.push("/auth/login")
    } catch (err: any) {
      setError(err.message || "An error occurred")
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-primary">{t("auth.register_title")}</h1>
            <p className="text-sm text-muted-foreground mt-1">{locale === "ar" ? "انضم إلى أجرني اليوم" : "Join Ajrni today"}</p>
          </div>
          {error && <div className="p-3 rounded-xl bg-error/10 text-error text-sm mb-4">{error}</div>}
          <div className="grid grid-cols-2 gap-2 mb-6">
            <button type="button" onClick={() => setRole("CUSTOMER")} className={cn("p-3 rounded-xl border-2 text-sm font-medium transition-all", role === "CUSTOMER" ? "border-secondary bg-secondary/5 text-secondary" : "border-border text-muted-foreground")}>
              <User className="w-5 h-5 mx-auto mb-1" />{t("auth.as_customer")}
            </button>
            <button type="button" onClick={() => setRole("OFFICE")} className={cn("p-3 rounded-xl border-2 text-sm font-medium transition-all", role === "OFFICE" ? "border-secondary bg-secondary/5 text-secondary" : "border-border text-muted-foreground")}>
              <Building2 className="w-5 h-5 mx-auto mb-1" />{t("auth.as_office")}
            </button>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {role === "CUSTOMER" ? (
              <Input id="name" label={t("auth.name")} placeholder={locale === "ar" ? "الاسم الكامل" : "Full name"} error={errors.name?.message} {...register("name")} />
            ) : (
              <>
                <Input id="officeName" label={locale === "ar" ? "اسم المكتب" : "Office name"} placeholder={locale === "ar" ? "اسم المكتب" : "Office name"} {...register("officeName")} />
                <Input
                  id="commercialRegistrationNumber"
                  label={locale === "ar" ? "رقم السجل التجاري" : "Commercial Registration No."}
                  placeholder={locale === "ar" ? "رقم السجل التجاري" : "CR number"}
                  {...register("commercialRegistrationNumber")}
                />
              </>
            )}
            <Input id="email" label={t("auth.email")} type="email" placeholder="email@example.com" error={errors.email?.message} {...register("email")} />
            <Input id="phone" label={t("auth.phone")} type="tel" placeholder="+966 5X XXX XXXX" error={errors.phone?.message} {...register("phone")} />
            <Input id="password" label={t("auth.password")} type="password" placeholder="••••••••" error={errors.password?.message} {...register("password")} />
            <Input id="confirmPassword" label={locale === "ar" ? "تأكيد كلمة المرور" : "Confirm password"} type="password" placeholder="••••••••" value={confirmPassword} onChange={(e) => { setConfirmPassword(e.target.value); setConfirmError("") }} error={confirmError} />
            {role === "OFFICE" && (
              <>
                <p className="text-xs text-warning bg-warning/5 p-3 rounded-xl">{t("auth.office_approval_note")}</p>
                <Select
                  id="country"
                  label={t("auth.country")}
                  error={errors.country?.message}
                  options={gulfCountries.map((c) => ({ value: c.code, label: locale === "ar" ? c.nameAr : c.nameEn }))}
                  {...register("country", { onChange: () => setValue("city", "") })}
                />
                {selectedCountry && (
                  <Select
                    id="city"
                    label={t("auth.city")}
                    error={errors.city?.message}
                    options={cities.map((c) => ({ value: c.nameAr, label: locale === "ar" ? c.nameAr : c.nameEn }))}
                    {...register("city")}
                  />
                )}
              </>
            )}
            <Button type="submit" className="w-full" loading={isSubmitting}>{t("auth.register_btn")}</Button>
          </form>
          <p className="text-center text-sm text-muted-foreground mt-6">{t("auth.have_account")} <Link href="/auth/login" className="text-secondary hover:underline font-medium">{t("auth.sign_in")}</Link></p>
        </div>
      </motion.div>
    </div>
  )
}
