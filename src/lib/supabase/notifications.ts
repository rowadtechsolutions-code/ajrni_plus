import { getClient } from "./client"

const supabase = getClient()
const NOTIFICATIONS_PER_PAGE = 20

export const notificationService = {
  async getNotifications(userId: string, page = 1) {
    const from = (page - 1) * NOTIFICATIONS_PER_PAGE
    const to = from + NOTIFICATIONS_PER_PAGE - 1

    const { data, error, count } = await supabase
      .from("notifications")
      .select("*", { count: "exact" })
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .range(from, to)

    if (error) throw error
    return { data: data || [], count: count || 0 }
  },

  async getRecentNotifications(userId: string, limit = 5) {
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit)

    if (error) throw error
    return data || []
  },

  async getUnreadCount(userId: string) {
    const { count, error } = await supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("is_read", false)

    if (error) throw error
    return count || 0
  },

  async markAsRead(notificationId: string, userId: string) {
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq("id", notificationId)
      .eq("user_id", userId)

    if (error) throw error
  },

  async markAllAsRead(userId: string) {
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq("user_id", userId)
      .eq("is_read", false)

    if (error) throw error
  },
}
