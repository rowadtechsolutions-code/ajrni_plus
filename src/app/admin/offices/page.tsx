"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { CheckCircle2, XCircle } from "lucide-react"
import { useLocaleStore } from "@/store/useLocaleStore"
import { useTranslation } from "@/lib/i18n"
import { officeService } from "@/lib/supabase/services"
import { Badge } from "@/components/ui/badge"

export default function AdminOfficesPage() {
  const { locale } = useLocaleStore()
  const { t } = useTranslation(locale)
  const queryClient = useQueryClient()

  const { data: offices = [], isLoading } = useQuery({
    queryKey: ["admin-offices"],
    queryFn: () => officeService.getAll(),
  })

  const toggleMutation = useMutation({
    mutationFn: ({ id, is_active }: { id: string; is_active: boolean }) => officeService.toggleActive(id, is_active),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-offices"] }),
  })

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-xl font-bold text-primary mb-6">{t("admin.offices")}</h1>
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground animate-pulse">{locale === "ar" ? "جاري التحميل..." : "Loading..."}</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-right p-3 font-medium text-muted-foreground">{locale === "ar" ? "المكتب" : "Office"}</th>
                <th className="text-right p-3 font-medium text-muted-foreground">{locale === "ar" ? "البريد" : "Email"}</th>
                <th className="text-right p-3 font-medium text-muted-foreground">{locale === "ar" ? "الحالة" : "Status"}</th>
                <th className="p-3">{locale === "ar" ? "الإجراءات" : "Actions"}</th>
              </tr>
            </thead>
            <tbody>
              {(offices as any[]).map((office) => (
                <tr key={office.id} className="border-b border-border hover:bg-muted/50">
                  <td className="p-3"><p className="font-medium">{office.office_name}</p></td>
                  <td className="p-3 text-muted-foreground">{office.email}</td>
                  <td className="p-3">
                    <Badge variant={office.is_active ? "success" : "warning"}>
                      {office.is_active ? (locale === "ar" ? "نشط" : "Active") : (locale === "ar" ? "غير نشط" : "Inactive")}
                    </Badge>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-1">
                      {office.is_active ? (
                        <button onClick={() => toggleMutation.mutate({ id: office.id, is_active: false })} className="p-1.5 rounded-lg hover:bg-error/10 text-error"><XCircle className="w-4 h-4" /></button>
                      ) : (
                        <button onClick={() => toggleMutation.mutate({ id: office.id, is_active: true })} className="p-1.5 rounded-lg hover:bg-success/10 text-success"><CheckCircle2 className="w-4 h-4" /></button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
