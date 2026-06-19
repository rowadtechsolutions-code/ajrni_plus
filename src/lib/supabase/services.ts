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

  async uploadCoverImage(userId: string, file: File, oldCoverUrl?: string | null) {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      throw new Error("Unsupported image format. Use jpg, png, or webp.")
    }
    const ext = file.name.split(".").pop() || "jpg"
    const timestamp = Date.now()
    const path = `offices/${userId}/cover-${timestamp}.${ext}`

    if (oldCoverUrl) {
      const oldPath = extractStoragePath(oldCoverUrl)
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
    const { data: car } = await supabase.from("cars").select("images, image").eq("id", id).single()
    const urls = [...(car?.images || []), ...(car?.image ? [car.image] : [])]
    for (const url of urls) {
      if (url) await storageService.deleteCarImageByUrl(url).catch(() => {})
    }
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

export const bookingRequestService = {
  async create(data: {
    user_id: string; country?: string; city?: string; car_type?: string
    brand?: string; model?: string; pickup_date?: string; return_date?: string
    budget_per_day?: number; notes?: string; full_name?: string; phone_number?: string
  }) {
    const payload = { ...data }
    if (payload.full_name === null) delete payload.full_name
    if (payload.phone_number === null) delete payload.phone_number
    const { data: request, error } = await supabase.from("BookingRequests").insert(payload).select().single()
    if (error) {
      console.error("[bookingRequestService.create] Supabase error:", error, "details:", (error as any)?.details, "message:", (error as any)?.message, "code:", (error as any)?.code)
      throw new Error((error as any)?.message || (error as any)?.details || JSON.stringify(error) || "Failed to create booking request")
    }
    return request
  },

  async getByUser(userId: string) {
    const { data, error } = await supabase
      .from("BookingRequests")
      .select("*, offers:BookingOffers(*)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
    if (error) throw error
    return data || []
  },

  async getByOffice(officeId: string) {
    const { data, error } = await supabase
      .from("BookingRequestOffices")
      .select("*, request:BookingRequests(*)")
      .eq("office_id", officeId)
      .neq("status", "rejected")
      .order("created_at", { ascending: false })
    if (error) throw error
    return data || []
  },

  async getOffersByRequest(requestId: string) {
    const { data, error } = await supabase
      .from("BookingOffers")
      .select("*, office:Offices(*)")
      .eq("request_id", requestId)
      .order("created_at", { ascending: false })
    if (error) throw error
    return data || []
  },

  async getUnviewedCount(officeId: string) {
    const { data, error } = await supabase
      .from("BookingRequestOffices")
      .select("id, request:BookingRequests!inner(id, status)")
      .eq("office_id", officeId)
      .eq("status", "sent")
      .neq("request.status", "completed")
    if (error) throw error
    return data?.length || 0
  },

  async markViewed(assignmentId: string) {
    const { error } = await supabase
      .from("BookingRequestOffices")
      .update({ status: "viewed" })
      .eq("id", assignmentId)
    if (error) throw error
  },
}

export const bookingOfferService = {
  async create(data: { request_id: string; office_id: string; car_name?: string; car_model?: string; price_per_day?: number; total_price?: number; notes?: string }) {
    const { data: offer, error } = await supabase.from("BookingOffers").insert(data).select()
    if (error) throw new Error((error as any)?.message || JSON.stringify(error))
    return offer?.[0] || null
  },

  async getUserRequestsWithOffers(userId: string) {
    const requests = await bookingRequestService.getByUser(userId)
    for (const req of requests as any[]) {
      req.offers = await bookingRequestService.getOffersByRequest(req.id)
    }
    return requests
  },

  async acceptOffer(offerId: string, requestId: string) {
    console.log("[acceptOffer] starting", { offerId, requestId })
    const r1 = await supabase.from("BookingOffers").update({ status: "accepted" }).eq("id", offerId)
    console.log("[acceptOffer] step1 (accept offer)", { data: r1.data, error: r1.error })
    if (r1.error) throw new Error(`step1 accept offer: ${r1.error.message}`)
    const r2 = await supabase.from("BookingOffers").update({ status: "rejected" }).eq("request_id", requestId).neq("id", offerId)
    console.log("[acceptOffer] step2 (reject others)", { data: r2.data, error: r2.error })
    if (r2.error) throw new Error(`step2 reject others: ${r2.error.message}`)
    const r3 = await supabase.from("BookingRequests").update({ status: "completed" }).eq("id", requestId)
    console.log("[acceptOffer] step3 (complete request)", { data: r3.data, error: r3.error })
    if (r3.error) throw new Error(`step3 complete request: ${r3.error.message}`)
    try {
      const { data: offer } = await supabase.from("BookingOffers").select("office_id").eq("id", offerId).single()
      if (offer?.office_id) {
        await supabase.from("BookingRequestOffices").update({ status: "completed" }).eq("request_id", requestId).eq("office_id", offer.office_id)
        await supabase.from("BookingRequestOffices").update({ status: "rejected" }).eq("request_id", requestId).neq("office_id", offer.office_id)
      }
    } catch (e) {
      console.error("[acceptOffer] office assignment update failed (non-critical):", e)
    }
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
