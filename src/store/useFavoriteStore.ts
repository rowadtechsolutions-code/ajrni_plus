"use client"

import { create } from "zustand"
import { getClient } from "@/lib/supabase/client"

interface FavoriteState {
  ids: string[]
  loading: boolean
  loadFavorites: (userId: string) => Promise<void>
  toggleFavorite: (userId: string, carId: string) => Promise<void>
  isFavorited: (carId: string) => boolean
  clear: () => void
}

export const useFavoriteStore = create<FavoriteState>((set, get) => ({
  ids: [],
  loading: false,
  loadFavorites: async (userId) => {
    if (!userId) return
    set({ loading: true })
    const supabase = getClient()
    const { data, error } = await supabase
      .from("Favorites")
      .select("car_id")
      .eq("user_id", userId)
    if (!error && data) {
      set({ ids: data.map((f: any) => f.car_id), loading: false })
    } else {
      set({ loading: false })
    }
  },
  toggleFavorite: async (userId, carId) => {
    if (!userId) return
    const supabase = getClient()
    const { ids } = get()
    const isFav = ids.includes(carId)

    if (isFav) {
      await supabase.from("Favorites").delete().eq("user_id", userId).eq("car_id", carId)
      set({ ids: ids.filter((id) => id !== carId) })
    } else {
      await supabase.from("Favorites").insert({ user_id: userId, car_id: carId })
      set({ ids: [...ids, carId] })
    }
  },
  isFavorited: (carId) => get().ids.includes(carId),
  clear: () => set({ ids: [], loading: false }),
}))
