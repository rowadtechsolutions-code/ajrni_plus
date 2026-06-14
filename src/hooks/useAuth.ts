"use client"

import { useCallback } from "react"
import { useRouter } from "next/navigation"
import { getClient } from "@/lib/supabase/client"
import { useAuthStore } from "@/store/useAuthStore"
import { useFavoriteStore } from "@/store/useFavoriteStore"

const supabase = getClient()

export function useAuth() {
  const router = useRouter()
  const store = useAuthStore()

  const signIn = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    const role = data.user?.user_metadata?.role
    if (role === "OFFICE") {
      router.push("/dashboard")
    } else {
      router.push("/")
    }
    router.refresh()
  }, [router])

  const signUp = useCallback(async (data: {
    email: string
    password: string
    name?: string
    phone?: string
    role: string
    officeName?: string
    country?: string
    city?: string
  }) => {
    const metaName = data.role === "OFFICE" ? data.officeName || data.name || "" : data.name || ""
    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          name: metaName,
          phone: data.phone || '',
          role: data.role,
          country: data.country || '',
          city: data.city || '',
        },
      },
    })
    if (error) throw error

    if (authData?.session) {
      await supabase.auth.setSession(authData.session)

      const { error: uErr } = await supabase.from("Users").insert({
        id: authData.user!.id,
        full_name: metaName,
        email: data.email,
        phone_number: data.phone || '',
        country: data.country || null,
        city: data.city || null,
      })
      if (uErr && uErr.code !== '23505') throw new Error(`Users insert: ${uErr.message}`)

      if (data.role === "OFFICE") {
        const { error: oErr } = await supabase.from("Offices").insert({
          id: authData.user!.id,
          office_name: metaName,
          email: data.email,
          phone_number: data.phone || "",
          country: data.country || "",
          city: data.city || "",
          is_active: false,
        })
        if (oErr) throw new Error(`Offices insert: ${oErr.message}`)
      }

      await supabase.auth.signOut()
    }
  }, [])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    store.clearSession()
    useFavoriteStore.getState().clear()
    router.push("/")
    router.refresh()
  }, [router, store])

  return { ...store, signIn, signUp, signOut }
}
