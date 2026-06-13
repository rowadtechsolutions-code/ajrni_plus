const BASE_URL = process.env.NEXT_PUBLIC_API_URL || ""

export async function apiFetch<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${BASE_URL}/api${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: "An error occurred" }))
    throw new Error(error.message || "An error occurred")
  }

  return res.json()
}

export const api = {
  cars: {
    list: (params?: string) => apiFetch<any[]>(`/cars${params ? `?${params}` : ""}`),
    get: (id: string) => apiFetch<any>(`/cars/${id}`),
    create: (data: any) =>
      apiFetch<any>("/cars", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: any) =>
      apiFetch<any>(`/cars/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: string) =>
      apiFetch<any>(`/cars/${id}`, { method: "DELETE" }),
  },
  offices: {
    list: (params?: string) => apiFetch<any[]>(`/offices${params ? `?${params}` : ""}`),
    get: (id: string) => apiFetch<any>(`/offices/${id}`),
  },
  bookings: {
    create: (data: any) =>
      apiFetch<any>("/bookings", { method: "POST", body: JSON.stringify(data) }),
    list: (params?: string) => apiFetch<any[]>(`/bookings${params ? `?${params}` : ""}`),
    update: (id: string, data: any) =>
      apiFetch<any>(`/bookings/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  },
  admin: {
    offices: {
      list: (params?: string) => apiFetch<any[]>(`/admin/offices${params ? `?${params}` : ""}`),
      update: (id: string, data: any) =>
        apiFetch<any>(`/admin/offices/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    },
    users: {
      list: () => apiFetch<any[]>("/admin/users"),
    },
    cars: {
      list: () => apiFetch<any[]>("/admin/cars"),
    },
  },
}
