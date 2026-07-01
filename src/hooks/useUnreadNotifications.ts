"use client"

import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useAuthStore } from "@/store/useAuthStore"
import { notificationService } from "@/lib/supabase/notifications"

export function useUnreadCount() {
  const { user } = useAuthStore()
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ["unread-notifications", user?.id],
    queryFn: () => notificationService.getUnreadCount(user!.id),
    enabled: !!user?.id,
    refetchInterval: 30000,
  })

  return {
    unreadCount: query.data ?? 0,
    isLoading: query.isLoading,
    invalidate: () => {
      queryClient.invalidateQueries({ queryKey: ["unread-notifications"] })
    },
  }
}
