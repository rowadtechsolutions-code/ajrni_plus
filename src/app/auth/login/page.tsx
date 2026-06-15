"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Eye, EyeOff, LogIn, Loader2, CheckCircle2, Mail } from "lucide-react"
import { motion } from "framer-motion"
import { useLocaleStore } from "@/store/useLocaleStore"
import { useTranslation } from "@/lib/i18n"
import { loginSchema, type LoginFormData } from "@/lib/validations"
import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Modal } from "@/components/ui/modal"

export default function LoginPage() {
  const { locale } = useLocaleStore()
  const { t } = useTranslation(locale)
  const router = useRouter()
  const { signIn, resetPassword } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) })

  const [showResetModal, setShowResetModal] = useState(false)
  const [resetEmail, setResetEmail] = useState("")
  const [resetSending, setResetSending] = useState(false)
  const [resetSent, setResetSent] = useState(false)
  const [resetError, setResetError] = useState("")

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

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setResetError("")
    if (!resetEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(resetEmail)) {
      setResetError(locale === "ar" ? "البريد الإلكتروني غير صحيح" : "Invalid email address")
      return
    }
    setResetSending(true)
    try {
      await resetPassword(resetEmail)
      setResetSent(true)
    } catch {
      setResetError(locale === "ar" ? "لا يوجد حساب بهذا البريد الإلكتروني" : "No account found with this email")
    }
    setResetSending(false)
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
            <div className="flex justify-end -mt-2">
              <button type="button" onClick={() => { setResetEmail(""); setResetSent(false); setResetError(""); setShowResetModal(true) }} className="text-xs text-secondary hover:underline">
                {t("auth.forgot_password")}
              </button>
            </div>
            <Button type="submit" className="w-full" loading={isSubmitting}><LogIn className="w-4 h-4 ml-2" />{t("auth.login_btn")}</Button>
          </form>
          <p className="text-center text-sm text-muted-foreground mt-6">{t("auth.no_account")} <Link href="/auth/register" className="text-secondary hover:underline font-medium">{t("auth.sign_up")}</Link></p>
        </div>
      </motion.div>

      <Modal open={showResetModal} onClose={() => setShowResetModal(false)} title={t("auth.reset_password_title")}>
        {resetSent ? (
          <div className="text-center py-4">
            <CheckCircle2 className="w-12 h-12 text-success mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">{t("auth.reset_password_sent")}</p>
            <button type="button" onClick={() => setShowResetModal(false)} className="mt-4 text-sm text-secondary hover:underline">
              {t("auth.go_back")}
            </button>
          </div>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <p className="text-sm text-muted-foreground">{t("auth.reset_password_desc")}</p>
            {resetError && <div className="p-3 rounded-xl bg-error/10 text-error text-sm">{resetError}</div>}
            <Input
              id="resetEmail"
              label={t("auth.email")}
              type="email"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              required
            />
            <Button type="submit" className="w-full" loading={resetSending}>
              {resetSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
              {t("auth.send_reset_link")}
            </Button>
          </form>
        )}
      </Modal>
    </div>
  )
}
