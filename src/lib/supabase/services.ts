import { getClient } from "./client"
import type { CarFilters } from "@/types"

const supabase = getClient()

export const userService = {
  async getProfile(userId: string) {
    const { data, error } = await supabase.from("Users").select("*").eq("id", userId).single()
    if (error) throw error
    return data
  },

  async updateProfile(userId: string, updates: Record<string, any>) {
    const { data, error } = await supabase.from("Users").update(updates).eq("id", userId).select().single()
    if (error) throw error
    return data
  },
}

export const officeService = {
  async getById(id: string) {
    const { data, error } = await supabase.from("Offices").select("*").eq("id", id).single()
    if (error) throw error
    return data
  },

  async getByUserId(userId: string) {
    const { data, error } = await supabase.from("Offices").select("*").eq("id", userId).single()
    if (error) throw error
    return data
  },

  async getActive() {
    const { data, error } = await supabase.from("Offices").select("*").eq("is_active", true).order("created_at", { ascending: false })
    if (error) throw error
    return data
  },

  async getAll() {
    const { data, error } = await supabase.from("Offices").select("*").order("created_at", { ascending: false })
    if (error) throw error
    return data
  },

  async toggleActive(officeId: string, is_active: boolean) {
    const { data, error } = await supabase.from("Offices").update({ is_active }).eq("id", officeId).select().single()
    if (error) throw error
    const { error: carsError } = await supabase.from("cars").update({ is_active }).eq("office_id", officeId)
    if (carsError) console.error("[toggleActive] cars update error:", carsError)
    return data
  },

  async updateProfile(officeId: string, updates: Record<string, any>) {
    const { data, error } = await supabase.from("Offices").update(updates).eq("id", officeId).select().single()
    if (error) throw error
    return data
  },
}

const BUCKET = "cars"

export const storageService = {
  async uploadCarImage(file: File, path: string) {
    const { data, error } = await supabase.storage.from(BUCKET).upload(path, file, { upsert: true })
    if (error) throw new Error(error.message || JSON.stringify(error))
    const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(data.path)
    return urlData.publicUrl
  },

  async deleteCarImage(path: string) {
    const { error } = await supabase.storage.from(BUCKET).remove([path])
    if (error) throw new Error(error.message || JSON.stringify(error))
  },

  async deleteCarImageByUrl(publicUrl: string) {
    const path = extractStoragePath(publicUrl, BUCKET)
    if (!path) return
    const { error } = await supabase.storage.from(BUCKET).remove([path])
    if (error) console.error("[deleteCarImageByUrl] error:", error)
  },
}

const OFFICES_BUCKET = "Offices"
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"]

export const officeStorageService = {
  async uploadOfficeImage(file: File, path: string) {
    const { data, error } = await supabase.storage.from(OFFICES_BUCKET).upload(path, file, { upsert: true })
    if (error) throw new Error(error.message || JSON.stringify(error))
    const { data: urlData } = supabase.storage.from(OFFICES_BUCKET).getPublicUrl(data.path)
    return urlData.publicUrl
  },

  async deleteOfficeImage(path: string) {
    const { error } = await supabase.storage.from(OFFICES_BUCKET).remove([path])
    if (error) throw new Error(error.message || JSON.stringify(error))
  },

  async uploadProfileImage(userId: string, file: File, oldImageUrl?: string | null) {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      throw new Error("Unsupported image format. Use jpg, png, or webp.")
    }
    const ext = file.name.split(".").pop() || "jpg"
    const timestamp = Date.now()
    const path = `offices/${userId}/profile-${timestamp}.${ext}`

    if (oldImageUrl) {
      const oldPath = extractStoragePath(oldImageUrl)
      if (oldPath) {
        await supabase.storage.from(OFFICES_BUCKET).remove([oldPath]).catch(() => {})
      }
    }

    const { data, error } = await supabase.storage.from(OFFICES_BUCKET).upload(path, file, { upsert: true })
    if (error) throw new Error(error.message || JSON.stringify(error))
    const { data: urlData } = supabase.storage.from(OFFICES_BUCKET).getPublicUrl(data.path)
    return urlData.publicUrl
  },
}

function extractStoragePath(publicUrl: string, bucket: string = OFFICES_BUCKET): string | null {
  const marker = `${bucket}/`
  const idx = publicUrl.indexOf(marker)
  if (idx === -1) return null
  return publicUrl.slice(idx + marker.length)
}

export const carService = {
  async getAll(filters?: CarFilters) {
    try {
      let query = supabase.from("cars").select("*")
      if (filters?.brand) query = query.eq("brand", filters.brand)
      if (filters?.fuel_type) query = query.eq("fuel_type", filters.fuel_type)
      if (filters?.transmission) query = query.eq("transmission", filters.transmission)
      if (filters?.seats) query = query.gte("seats", filters.seats)
      const { data, error } = await query.order("created_at", { ascending: false })
      if (error) throw error
      console.log("[carService.getAll] count:", data?.length, "first:", data?.[0]?.name)
      let result: any[] = data || []
      result = result.filter((c: any) => c.is_active !== false)
      if (result.length > 0) {
        const officeIds = [...new Set(result.map((c: any) => c.office_id).filter(Boolean))]
        if (officeIds.length > 0) {
          const { data: offices } = await supabase.from("Offices").select("*").in("id", officeIds)
          const officeMap = Object.fromEntries((offices || []).map((o: any) => [o.id, o]))
          result = result.map((c: any) => ({ ...c, office: officeMap[c.office_id] || null }))
          result = result.filter((c: any) => c.office?.is_active !== false)
        }
      }
      if (filters?.country) result = result.filter((c: any) => c.office?.country === filters.country)
      if (filters?.city) result = result.filter((c: any) => c.office?.city === filters.city)
      return result
    } catch (e) {
      console.error("[carService.getAll] exception:", e)
      throw e
    }
  },

  async getById(id: string) {
    try {
      const { data, error } = await supabase.from("cars").select("*").eq("id", id).single()
      if (error) throw error
      if (data?.office_id) {
        const { data: office } = await supabase.from("Offices").select("*").eq("id", data.office_id).single()
        if (office && office.is_active === false) return null
        return { ...data, office: office || null }
      }
      return { ...data, office: null }
    } catch (e) {
      console.error("[carService.getById] error:", e)
      throw e
    }
  },

  async getByOffice(officeId: string) {
    try {
      console.log("[carService.getByOffice] officeId:", officeId)
      const { data, error } = await supabase.from("cars").select("*").eq("office_id", officeId).order("created_at", { ascending: false })
      if (error) throw error
      console.log("[carService.getByOffice] cars count:", data?.length)
      if (!data || data.length === 0) return []
      const { data: office } = await supabase.from("Offices").select("*").eq("id", officeId).single()
      return data.map((c: any) => ({ ...c, office: office || null }))
    } catch (e) {
      console.error("[carService.getByOffice] exception:", e)
      throw e
    }
  },

  async create(car: any) {
    const { data, error } = await supabase.from("cars").insert(car).select().single()
    if (error) throw new Error(error.message || JSON.stringify(error))
    return data
  },

  async update(id: string, updates: any) {
    const { data, error } = await supabase.from("cars").update(updates).eq("id", id).select().single()
    if (error) throw new Error(error.message || JSON.stringify(error))
    return data
  },

  async delete(id: string) {
    const { error } = await supabase.from("cars").delete().eq("id", id)
    if (error) throw error
  },
}

export const favoriteService = {
  async toggle(userId: string, carId: string) {
    const existing = await supabase
      .from("Favorites")
      .select("id")
      .eq("user_id", userId)
      .eq("car_id", carId)
      .maybeSingle()

    if (existing.data) {
      await supabase.from("Favorites").delete().eq("id", existing.data.id)
      return false
    } else {
      await supabase.from("Favorites").insert({ user_id: userId, car_id: carId })
      return true
    }
  },

  async getByUser(userId: string) {
    const { data, error } = await supabase
      .from("Favorites")
      .select("*, car:cars(*)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
    if (error) throw error
    return (data || []) as any[]
  },

  async getIds(userId: string) {
    const { data, error } = await supabase
      .from("Favorites")
      .select("car_id")
      .eq("user_id", userId)
    if (error) throw error
    return (data || []).map((f: any) => f.car_id) as string[]
  },
}

export const bookingService = {
  async getByOffice(officeId: string) {
    const { data, error } = await supabase
      .from("bookings")
      .select("*, car:cars(*), customer:users(*)")
      .eq("officeId", officeId)
      .order("createdAt", { ascending: false })
    if (error) throw error
    return data
  },
  async updateStatus(bookingId: string, status: any) {
    const { error } = await supabase
      .from("bookings")
      .update({ status })
      .eq("id", bookingId)
    if (error) throw error
  },
  async create(booking: any) {
    const { data, error } = await supabase.from("bookings").insert(booking).select().single()
    if (error) throw error
    return data
  },
}
