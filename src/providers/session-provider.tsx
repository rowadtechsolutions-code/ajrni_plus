"use client"

import { useEffect } from "react"
import { getClient } from "@/lib/supabase/client"
import { useAuthStore } from "@/store/useAuthStore"
import { useFavoriteStore } from "@/store/useFavoriteStore"

export function resolveMetadataRole(user: { user_metadata?: Record<string, any> } | null | undefined): string | null {
  const role = String(user?.user_metadata?.role ?? "").trim().toUpperCase()
  if (role === "OFFICE") return "OFFICE"
  if (role === "CUSTOMER" || role === "USER") return "CUSTOMER"

  const accountType = String(user?.user_metadata?.account_type ?? "").trim().toLowerCase()
  if (accountType === "office") return "OFFICE"
  if (accountType === "user") return "CUSTOMER"

  return null
}

function enrichProfile(session: any, profile: any, resolvedRole?: string | null) {
  return {
    ...(profile || {}),
    role: resolvedRole || profile?.role || session?.user?.user_metadata?.role || null,
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setSession, clearSession, setLoading } = useAuthStore()
  const { loadFavorites, clear } = useFavoriteStore()
  const supabase = getClient()

  const fetchProfile = async (session: any) => {
    let role = resolveMetadataRole(session.user)
    let profile: any = null

    if (role === "OFFICE") {
      const { data } = await supabase.from("Offices").select("*").eq("id", session.user.id).single()
      profile = data
    } else if (role === "CUSTOMER") {
      const { data } = await supabase.from("Users").select("*").eq("id", session.user.id).single()
      profile = data
    } else {
      const { data: office } = await supabase.from("Offices").select("*").eq("id", session.user.id).single()
      if (office) {
        profile = office
        role = "OFFICE"
      } else {
        const { data: user } = await supabase.from("Users").select("*").eq("id", session.user.id).single()
        if (user) {
          profile = user
          role = "CUSTOMER"
        }
      }
    }

    setSession(session, session.user, enrichProfile(session, profile, role))
    loadFavorites(session.user.id)
  }

  useEffect(() => {
    setLoading(true)

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchProfile(session)
      } else {
        clearSession()
        clear()
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchProfile(session)
      } else {
        clearSession()
        clear()
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  return <>{children}</>
}
