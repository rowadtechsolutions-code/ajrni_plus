"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/store/useAuthStore"

export default function DashboardPage() {
  const router = useRouter()
  const { isAuthenticated, profile, loading } = useAuthStore()

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated || profile?.role !== "OFFICE") {
        router.replace("/auth/login")
      } else {
        router.replace("/dashboard/cars")
      }
    }
  }, [loading, isAuthenticated, profile, router])

  return null
}
