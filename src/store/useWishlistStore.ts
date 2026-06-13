"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

interface WishlistState {
  items: string[]
  addItem: (carId: string) => void
  removeItem: (carId: string) => void
  isWishlisted: (carId: string) => boolean
  toggleItem: (carId: string) => void
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (carId) =>
        set((state) => ({ items: [...state.items, carId] })),
      removeItem: (carId) =>
        set((state) => ({
          items: state.items.filter((id) => id !== carId),
        })),
      isWishlisted: (carId) => get().items.includes(carId),
      toggleItem: (carId) => {
        const { items } = get()
        if (items.includes(carId)) {
          set({ items: items.filter((id) => id !== carId) })
        } else {
          set({ items: [...items, carId] })
        }
      },
    }),
    { name: "ajirni-wishlist" }
  )
)
