"use client"

import { useQuery } from "@tanstack/react-query"
import { locationService } from "@/lib/supabase/services"

export function useCountries() {
  return useQuery({
    queryKey: ["countries"],
    queryFn: () => locationService.getCountries(),
    staleTime: 24 * 60 * 60 * 1000,
  })
}

export function useCities(countryCode: string | null | undefined) {
  return useQuery({
    queryKey: ["cities", countryCode],
    queryFn: () => locationService.getCitiesByCountryCode(countryCode!),
    enabled: !!countryCode,
    staleTime: 24 * 60 * 60 * 1000,
  })
}
