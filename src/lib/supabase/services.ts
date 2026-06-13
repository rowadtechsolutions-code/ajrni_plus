import { createClient } from "./client"
import type { CarFilters, OfficeStatus, BookingStatus, CarStatus } from "@/types"

const supabase = () => createClient()

export const userService = {
  async getProfile(userId: string) {
    const { data, error } = await supabase().from("Users").select("*").eq("id", userId).single()
    if (error) throw error
    return data
  },

  async updateProfile(userId: string, updates: Record<string, any>) {
    const { data, error } = await supabase().from("Users").update(updates).eq("id", userId).select().single()
    if (error) throw error
    return data
  },
}

export const officeService = {
  async getById(id: string) {
    const { data, error } = await supabase().from("Offices").select("*").eq("id", id).single()
    if (error) throw error
    return data
  },

  async getByUserId(userId: string) {
    const { data, error } = await supabase().from("Offices").select("*").eq("id", userId).single()
    if (error) throw error
    return data
  },

  async getActive() {
    const { data, error } = await supabase().from("Offices").select("*").eq("is_active", true).order("created_at", { ascending: false })
    if (error) throw error
    return data
  },

  async getAll() {
    const { data, error } = await supabase().from("Offices").select("*").order("created_at", { ascending: false })
    if (error) throw error
    return data
  },

  async toggleActive(officeId: string, is_active: boolean) {
    const { data, error } = await supabase().from("Offices").update({ is_active }).eq("id", officeId).select().single()
    if (error) throw error
    return data
  },
}

export const carService = {
  async getAll(filters?: CarFilters) {
    let query = supabase().from("cars").select("*, office:Offices(*)")
    if (filters?.country) query = query.eq("country", filters.country)
    if (filters?.city) query = query.eq("city", filters.city)
    if (filters?.brand) query = query.eq("brand", filters.brand)
    if (filters?.minPrice) query = query.gte("pricePerDay", filters.minPrice)
    if (filters?.maxPrice) query = query.lte("pricePerDay", filters.maxPrice)
    if (filters?.seats) query = query.gte("seats", filters.seats)
    if (filters?.transmission) query = query.eq("transmission", filters.transmission)
    if (filters?.availableNow) query = query.eq("availableNow", true)
    const { data, error } = await query.order("createdAt", { ascending: false })
    if (error) throw error
    return data
  },

  async getById(id: string) {
    const { data, error } = await supabase().from("cars").select("*, office:offices(*)").eq("id", id).single()
    if (error) throw error
    return data
  },

  async getByOffice(officeId: string) {
    const { data, error } = await supabase().from("cars").select("*").eq("officeId", officeId)
    if (error) throw error
    return data
  },

  async create(car: any) {
    const { data, error } = await supabase().from("cars").insert(car).select().single()
    if (error) throw error
    return data
  },

  async update(id: string, updates: any) {
    const { data, error } = await supabase().from("cars").update(updates).eq("id", id).select().single()
    if (error) throw error
    return data
  },

  async delete(id: string) {
    const { error } = await supabase().from("cars").delete().eq("id", id)
    if (error) throw error
  },

  async updateStatus(id: string, status: CarStatus) {
    const { error } = await supabase().from("cars").update({ status }).eq("id", id)
    if (error) throw error
  },
}

export const locationService = {
  async getCountries() {
    const { data, error } = await supabase().from("countries").select("code, name_ar, name_en").order("name_ar")
    if (error) throw error
    return data || []
  },
  async getCities(countryCode: string) {
    const { data, error } = await supabase().from("cities").select("name_ar, name_en").eq("country_code", countryCode).order("name_ar")
    if (error) throw error
    return data || []
  },
}

export const bookingService = {
  async getByOffice(officeId: string) {
    const { data, error } = await supabase()
      .from("bookings")
      .select("*, car:cars(*), customer:users(*)")
      .eq("officeId", officeId)
      .order("createdAt", { ascending: false })
    if (error) throw error
    return data
  },

  async updateStatus(bookingId: string, status: BookingStatus) {
    const { error } = await supabase()
      .from("bookings")
      .update({ status })
      .eq("id", bookingId)
    if (error) throw error
  },

  async create(booking: any) {
    const { data, error } = await supabase().from("bookings").insert(booking).select().single()
    if (error) throw error
    return data
  },
}
