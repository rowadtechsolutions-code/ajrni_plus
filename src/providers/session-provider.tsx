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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setSession, clearSession, setLoading } = useAuthStore()
  const { loadFavorites, clear } = useFavoriteStore()
  const supabase = getClient()

  useEffect(() => {
    setLoading(true)

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        supabase
          .from("Users")
          .select("*")
          .eq("id", session.user.id)
          .single()
          .then(({ data: profile }) => {
            setSession(session, session.user, enrichProfile(session, profile))
            loadFavorites(session.user.id)
          })
      } else {
        clearSession()
        clear()
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        supabase
          .from("Users")
          .select("*")
          .eq("id", session.user.id)
          .single()
          .then(({ data: profile }) => {
            setSession(session, session.user, enrichProfile(session, profile))
            loadFavorites(session.user.id)
          })
      } else {
        clearSession()
        clear()
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  return <>{children}</>
}
