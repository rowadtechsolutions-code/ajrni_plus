"use client"

import { create } from "zustand"
import type { User } from "@supabase/supabase-js"

interface AuthState {
  isAuthenticated: boolean
  user: User | null
  session: any | null
  profile: any | null
  role: string | null
  officeId: string | null
  officeStatus: string | null
  loading: boolean
  setSession: (session: any, user: User | null, profile?: any) => void
  clearSession: () => void
  setLoading: (loading: boolean) => void
  updateProfile: (profile: any) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  user: null,
  session: null,
  profile: null,
  role: null,
  officeId: null,
  officeStatus: null,
  loading: true,
  setSession: (session, user, profile) =>
    set({
      isAuthenticated: !!session,
      session,
      user,
      profile: profile || null,
      role: profile?.role || null,
      officeId: profile?.officeId || null,
      officeStatus: profile?.officeStatus || null,
      loading: false,
    }),
  clearSession: () =>
    set({
      isAuthenticated: false,
      user: null,
      session: null,
      profile: null,
      role: null,
      officeId: null,
      officeStatus: null,
      loading: false,
    }),
  setLoading: (loading) => set({ loading }),
  updateProfile: (profile) => set((state) => ({
    profile,
    role: profile?.role || state.role,
    officeId: profile?.officeId || state.officeId,
    officeStatus: profile?.officeStatus || state.officeStatus,
  })),
}))
