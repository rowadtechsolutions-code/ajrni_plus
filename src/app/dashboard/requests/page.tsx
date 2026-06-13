"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useAuthStore } from "@/store/useAuthStore"
import { useLocaleStore } from "@/store/useLocaleStore"
import { useTranslation } from "@/lib/i18n"
import { officeService, bookingService } from "@/lib/supabase/services"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle2, XCircle, MessageCircle } from "lucide-react"
import type { BookingType, BookingStatus } from "@/types"

export default function DashboardRequestsPage() {
  const { locale } = useLocaleStore()
  const { t } = useTranslation(locale)
  const queryClient = useQueryClient()
  const { user } = useAuthStore()

  const { data: office } = useQuery({
    queryKey: ["my-office", user?.id],
    queryFn: () => officeService.getByUserId(user!.id),
    enabled: !!user?.id,
  })

  const { data: requests = [] } = useQuery({
    queryKey: ["my-office-requests", office?.id],
    queryFn: () => bookingService.getByOffice(office!.id),
    enabled: !!office?.id,
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: BookingStatus }) => bookingService.updateStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["my-office-requests"] }),
  })

  const filtered = requests as BookingType[]
  const statusColors: Record<string, "warning" | "success" | "error" | "info"> = { PENDING: "warning", ACCEPTED: "success", REJECTED: "error", COMPLETED: "info", CANCELLED: "error" }

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-xl font-bold text-primary mb-6">{t("dashboard.requests")}</h1>
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>{locale === "ar" ? "لا توجد طلبات حالياً" : "No requests yet"}</p>
          </div>
        ) : (
          filtered.map((req) => (
            <div key={req.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-primary">{req.customerName}</h3>
                  <p className="text-sm text-muted-foreground">{req.car?.name || (locale === "ar" ? "سيارة" : "Car")}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                    <span>{req.startDate} - {req.endDate}</span>
                    {req.totalAmount && <span className="font-semibold text-secondary">{req.totalAmount} {locale === "ar" ? "ريال" : "SAR"}</span>}
                  </div>
                  {req.message && <p className="text-xs text-muted-foreground mt-2 bg-muted p-2 rounded-lg">{req.message}</p>}
                </div>
                <Badge variant={statusColors[req.status]}>{t(`booking.${req.status.toLowerCase()}`)}</Badge>
              </div>
              {req.status === "PENDING" && (
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
                  <Button size="sm" onClick={() => updateMutation.mutate({ id: req.id, status: "ACCEPTED" })}><CheckCircle2 className="w-4 h-4 ml-1" />{t("booking.accepted")}</Button>
                  <Button size="sm" variant="outline" className="text-error" onClick={() => updateMutation.mutate({ id: req.id, status: "REJECTED" })}><XCircle className="w-4 h-4 ml-1" />{t("booking.rejected")}</Button>
                  <button className="p-2 rounded-lg hover:bg-muted"><MessageCircle className="w-4 h-4 text-muted-foreground" /></button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
