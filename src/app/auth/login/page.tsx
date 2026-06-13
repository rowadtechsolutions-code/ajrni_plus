"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Eye, EyeOff, LogIn } from "lucide-react"
import { motion } from "framer-motion"
import { useLocaleStore } from "@/store/useLocaleStore"
import { useTranslation } from "@/lib/i18n"
import { loginSchema, type LoginFormData } from "@/lib/validations"
import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function LoginPage() {
  const { locale } = useLocaleStore()
  const { t } = useTranslation(locale)
  const router = useRouter()
  const { signIn } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) })

  const onSubmit = async (data: LoginFormData) => {
    setError("")
    try {
      await signIn(data.email, data.password)
    } catch (err: any) {
      if (err.message?.includes("OFFICE_NOT_APPROVED") || err.message?.includes("office")) {
        setError(locale === "ar" ? "حساب المكتب قيد المراجعة من الإدارة" : "Office account is pending admin review")
      } else {
        setError(locale === "ar" ? "البريد الإلكتروني أو كلمة المرور غير صحيحة" : "Invalid email or password")
      }
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-primary">{t("auth.login_title")}</h1>
            <p className="text-sm text-muted-foreground mt-1">{locale === "ar" ? "مرحباً بعودتك!" : "Welcome back!"}</p>
          </div>
          {error && <div className="p-3 rounded-xl bg-error/10 text-error text-sm mb-4">{error}</div>}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input id="email" label={t("auth.email")} type="email" placeholder="email@example.com" error={errors.email?.message} {...register("email")} />
            <div className="relative">
              <Input id="password" label={t("auth.password")} type={showPassword ? "text" : "password"} placeholder="••••••••" error={errors.password?.message} {...register("password")} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute left-3 top-[38px] text-muted-foreground">{showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
            </div>
            <Button type="submit" className="w-full" loading={isSubmitting}><LogIn className="w-4 h-4 ml-2" />{t("auth.login_btn")}</Button>
          </form>
          <p className="text-center text-sm text-muted-foreground mt-6">{t("auth.no_account")} <Link href="/auth/register" className="text-secondary hover:underline font-medium">{t("auth.sign_up")}</Link></p>
        </div>
      </motion.div>
    </div>
  )
}
