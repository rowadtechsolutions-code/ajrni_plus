"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { getClient } from "@/lib/supabase/client"

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    const handle = async () => {
      const supabase = getClient()
      const { data } = await supabase.auth.getSession()
      const params = new URLSearchParams(window.location.search)
      const redirect = params.get("redirect_to") || "/"
      if (data?.session) {
        router.push(redirect)
      } else {
        router.push("/auth/login")
      }
    }
    handle()
  }, [router])

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-secondary border-t-transparent rounded-full animate-spin" />
    </div>
  )
}
