"use client"

import { create } from "zustand"

interface FilterState {
  country: string
  city: string
  brand: string
  minPrice: string
  maxPrice: string
  seats: string
  transmission: string
  fuelType: string
  availableNow: boolean
  airportDelivery: boolean
  withDriver: boolean
  sortBy: string
  setFilter: (key: string, value: any) => void
  resetFilters: () => void
}

const initialState = {
  country: "",
  city: "",
  brand: "",
  minPrice: "",
  maxPrice: "",
  seats: "",
  transmission: "",
  fuelType: "",
  availableNow: false,
  airportDelivery: false,
  withDriver: false,
  sortBy: "newest",
}

export const useFilterStore = create<FilterState>((set) => ({
  ...initialState,
  setFilter: (key, value) => set({ [key]: value }),
  resetFilters: () => set(initialState),
}))
