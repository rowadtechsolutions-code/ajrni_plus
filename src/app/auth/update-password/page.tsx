"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getClient } from "@/lib/supabase/client"
import { useLocaleStore } from "@/store/useLocaleStore"
import { useTranslation } from "@/lib/i18n"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Lock, Loader2, CheckCircle2, AlertCircle } from "lucide-react"

const SUPA_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPA_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const STORAGE_KEY = `sb-${new URL(SUPA_URL).hostname.split(".")[0]}-auth-token`

function getCodeVerifierFromCookie(): string | null {
  const raw = document.cookie.split(";").map((c) => c.trim())
  const prefix = `${STORAGE_KEY}-code-verifier`
  const entries: { idx: number; val: string }[] = []

  for (const cookie of raw) {
    const eq = cookie.indexOf("=")
    if (eq === -1) continue
    const name = cookie.slice(0, eq)
    const val = cookie.slice(eq + 1)
    if (name === prefix) entries.push({ idx: -1, val })
    else if (name.startsWith(prefix + ".")) {
      const idx = parseInt(name.slice(name.lastIndexOf(".") + 1), 10)
      if (!isNaN(idx)) entries.push({ idx, val })
    }
  }

  if (!entries.length) return null
  entries.sort((a, b) => a.idx - b.idx)
  const combined = entries.map((e) => e.val).join("")
  if (!combined) return null

  if (combined.startsWith("base64-")) {
    try {
      const b64 = combined.slice(7).replace(/-/g, "+").replace(/_/g, "/")
      const pad = b64.padEnd(b64.length + ((4 - (b64.length % 4)) % 4), "=")
      return atob(pad).split("/")[0] || null
    } catch {
      return null
    }
  }
  return combined.split("/")[0] || null
}

async function exchangePKCEDirect(code: string, verifier: string) {
  try {
    const res = await fetch(`${SUPA_URL}/auth/v1/token?grant_type=pkce`, {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: SUPA_ANON },
      body: JSON.stringify({ auth_code: code, code_verifier: verifier }),
    })
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

export default function UpdatePasswordPage() {
  const { locale } = useLocaleStore()
  const { t } = useTranslation(locale)
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [error, setError] = useState("")
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(false)
  const [ready, setReady] = useState(false)
  const [authError, setAuthError] = useState(false)

  useEffect(() => {
    const supabase = getClient()

    const recover = async () => {
      const { data: existing } = await supabase.auth.getSession()
      if (existing?.session) {
        setReady(true)
        return
      }

      const params = new URLSearchParams(window.location.search)
      const code = params.get("code")

      if (code) {
        const { data: exchanged, error: excErr } = await supabase.auth.exchangeCodeForSession(code)
        if (!excErr && exchanged?.session) {
          window.history.replaceState(null, "", window.location.pathname)
          setReady(true)
          return
        }

        const codeVerifier = getCodeVerifierFromCookie()
        if (codeVerifier) {
          const result = await exchangePKCEDirect(code, codeVerifier)
          if (result?.access_token && result?.refresh_token) {
            await supabase.auth.setSession({
              access_token: result.access_token,
              refresh_token: result.refresh_token,
            })
            const { data } = await supabase.auth.getSession()
            if (data?.session) {
              setReady(true)
              window.history.replaceState(null, "", window.location.pathname)
              return
            }
          }
        }
      }

      const hash = window.location.hash
      if (hash && hash.includes("access_token")) {
        const p = new URLSearchParams(hash.replace("#", ""))
        const accessToken = p.get("access_token")
        const refreshToken = p.get("refresh_token")
        if (accessToken && refreshToken) {
          await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken })
          const { data } = await supabase.auth.getSession()
          if (data?.session) {
            setReady(true)
            window.history.replaceState(null, "", window.location.pathname)
            return
          }
        }
      }

      setAuthError(true)
    }

    recover()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (password.length < 6) {
      setError(locale === "ar" ? "كلمة المرور يجب أن تكون 6 أحرف على الأقل" : "Password must be at least 6 characters")
      return
    }
    if (password !== confirm) {
      setError(locale === "ar" ? "كلمتا المرور غير متطابقتين" : "Passwords do not match")
      return
    }

    setSaving(true)
    const supabase = getClient()
    const { error: err } = await supabase.auth.updateUser({ password })
    setSaving(false)

    if (err) {
      setError(err.message)
      return
    }

    setDone(true)
    setTimeout(() => router.push("/auth/login"), 3000)
  }

  if (done) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 max-w-md w-full text-center">
          <CheckCircle2 className="w-12 h-12 text-success mx-auto mb-4" />
          <h2 className="text-xl font-bold text-primary mb-2">
            {locale === "ar" ? "تم تحديث كلمة المرور" : "Password updated"}
          </h2>
          <p className="text-sm text-muted-foreground">
            {locale === "ar" ? "سيتم تحويلك إلى صفحة تسجيل الدخول" : "Redirecting to login..."}
          </p>
        </div>
      </div>
    )
  }

  if (authError) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 max-w-md w-full text-center">
          <AlertCircle className="w-12 h-12 text-error mx-auto mb-4" />
          <h2 className="text-xl font-bold text-primary mb-2">
            {locale === "ar" ? "الرابط غير صالح" : "Invalid link"}
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            {locale === "ar" ? "رابط إعادة تعيين كلمة المرور غير صالح أو منتهي الصلاحية" : "This reset link is invalid or has expired"}
          </p>
          <Button onClick={() => router.push("/auth/login")}>
            {locale === "ar" ? "العودة لتسجيل الدخول" : "Back to login"}
          </Button>
        </div>
      </div>
    )
  }

  if (!ready) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-secondary" />
      </div>
    )
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
          <div className="text-center mb-6">
            <Lock className="w-10 h-10 text-secondary mx-auto mb-3" />
            <h1 className="text-2xl font-bold text-primary">
              {locale === "ar" ? "تعيين كلمة مرور جديدة" : "Set new password"}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {locale === "ar" ? "أدخل كلمة المرور الجديدة" : "Enter your new password"}
            </p>
          </div>
          {error && <div className="p-3 rounded-xl bg-error/10 text-error text-sm mb-4">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              id="password"
              label={locale === "ar" ? "كلمة المرور الجديدة" : "New password"}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
            <Input
              id="confirm"
              label={locale === "ar" ? "تأكيد كلمة المرور" : "Confirm password"}
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
            />
            <Button type="submit" className="w-full" loading={saving}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
              {locale === "ar" ? "تحديث كلمة المرور" : "Update password"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
