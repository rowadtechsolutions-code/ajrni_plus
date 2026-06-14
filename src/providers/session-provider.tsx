"use client"

import { useEffect } from "react"
import { getClient } from "@/lib/supabase/client"
import { useAuthStore } from "@/store/useAuthStore"
import { useFavoriteStore } from "@/store/useFavoriteStore"

function enrichProfile(session: any, profile: any) {
  return {
    ...(profile || {}),
    role: profile?.role || session?.user?.user_metadata?.role || null,
  }
}

function getProfileTable(role?: string) {
  return role === "OFFICE" ? "Offices" : "Users"
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setSession, clearSession, setLoading } = useAuthStore()
  const { loadFavorites, clear } = useFavoriteStore()
  const supabase = getClient()

  const fetchProfile = async (session: any) => {
    const role = session?.user?.user_metadata?.role
    const table = getProfileTable(role)
    const { data: profile } = await supabase
      .from(table)
      .select("*")
      .eq("id", session.user.id)
      .single()
    setSession(session, session.user, enrichProfile(session, profile))
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
