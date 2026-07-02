"use client"

import { useCallback } from "react"
import { useRouter } from "next/navigation"
import { getClient } from "@/lib/supabase/client"
import { useAuthStore } from "@/store/useAuthStore"
import { useFavoriteStore } from "@/store/useFavoriteStore"
import { resolveMetadataRole } from "@/providers/session-provider"

const supabase = getClient()

export function useAuth() {
  const router = useRouter()
  const store = useAuthStore()

  const signIn = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    const role = resolveMetadataRole(data.user)
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
    commercialRegistrationNumber?: string
    country?: string
    city?: string
  }) => {
    const metaName = data.role === "OFFICE" ? data.officeName || data.name || "" : data.name || ""

    if (data.role === "OFFICE" && data.commercialRegistrationNumber) {
      const { data: existing } = await supabase
        .from("Offices")
        .select("id")
        .eq("commercial_registration_number", data.commercialRegistrationNumber)
        .maybeSingle()
      if (existing) {
        throw new Error("رقم السجل التجاري مسجل مسبقًا، يرجى التواصل مع الدعم.")
      }
    }

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

    if (authData?.user && !authData?.session) {
      return
    }

    if (authData?.session) {
      if (data.role === "OFFICE") {
        try {
          const { error: oErr } = await supabase.from("Offices").insert({
            id: authData.user!.id,
            office_name: metaName,
            email: data.email,
            phone_number: data.phone || "",
            country: data.country || "",
            city: data.city || "",
            is_active: false,
            commercial_registration_number: data.commercialRegistrationNumber || "",
          })
          if (oErr) {
            if (oErr.code === '23505') {
              throw new Error("رقم السجل التجاري مسجل مسبقًا، يرجى التواصل مع الدعم.")
            }
            throw new Error(`Offices insert: ${oErr.message}`)
          }
        } catch (err) {
          await supabase.auth.signOut()
          throw err
        }
      } else {
        const { error: uErr } = await supabase.from("Users").insert({
          id: authData.user!.id,
          full_name: metaName,
          email: data.email,
          phone_number: data.phone || '',
          country: data.country || null,
          city: data.city || null,
        })
        if (uErr && uErr.code !== '23505') throw new Error(`Users insert: ${uErr.message}`)
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

  const resetPassword = useCallback(async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/update-password`,
    })
    if (error) throw error
  }, [])

  return { ...store, signIn, signUp, signOut, resetPassword }
}
