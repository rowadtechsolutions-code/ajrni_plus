"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Plus, Pencil, Trash2, Eye } from "lucide-react"
import { useLocaleStore } from "@/store/useLocaleStore"
import { useAuthStore } from "@/store/useAuthStore"
import { useTranslation } from "@/lib/i18n"
import { carService, officeService } from "@/lib/supabase/services"
import { carSchema, type CarFormData } from "@/lib/validations"
import { formatCurrency } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Modal } from "@/components/ui/modal"
import type { CarType } from "@/types"

export default function DashboardCarsPage() {
  const { locale } = useLocaleStore()
  const { t } = useTranslation(locale)
  const queryClient = useQueryClient()
  const { user } = useAuthStore()
  const [showAddModal, setShowAddModal] = useState(false)

  const { data: office } = useQuery({
    queryKey: ["my-office", user?.id],
    queryFn: () => officeService.getByUserId(user!.id),
    enabled: !!user?.id,
  })

  const { data: cars = [], isLoading } = useQuery({
    queryKey: ["my-office-cars", office?.id],
    queryFn: () => carService.getByOffice(office!.id),
    enabled: !!office?.id,
  })

  const createMutation = useMutation({
    mutationFn: (data: CarFormData) => carService.create({ ...data, officeId: office!.id }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["my-office-cars"] }); setShowAddModal(false) },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => carService.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["my-office-cars"] }),
  })

  const form = useForm<CarFormData>({ resolver: zodResolver(carSchema) })
  const onSubmit = (data: CarFormData) => createMutation.mutate(data)

  if (!office && !isLoading) {
    return (
      <div className="p-4 md:p-6 text-center py-16">
        <p className="text-muted-foreground">{locale === "ar" ? "ليس لديك مكتب" : "You don't have an office"}</p>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-primary">{t("dashboard.my_cars")}</h1>
          <p className="text-sm text-muted-foreground">{(cars as CarType[]).length} {locale === "ar" ? "سيارة" : "cars"}</p>
        </div>
        <Button onClick={() => setShowAddModal(true)}><Plus className="w-4 h-4 ml-2" />{t("dashboard.add_car")}</Button>
      </div>
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground animate-pulse">{locale === "ar" ? "جاري التحميل..." : "Loading..."}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-right p-3 font-medium text-muted-foreground">{locale === "ar" ? "السيارة" : "Car"}</th>
                  <th className="text-right p-3 font-medium text-muted-foreground">{t("cars.price")}</th>
                  <th className="text-right p-3 font-medium text-muted-foreground">{t("cars.seats")}</th>
                  <th className="text-right p-3 font-medium text-muted-foreground">{locale === "ar" ? "الحالة" : "Status"}</th>
                  <th className="text-right p-3 font-medium text-muted-foreground">{locale === "ar" ? "المشاهدات" : "Views"}</th>
                  <th className="p-3"></th>
                </tr>
              </thead>
              <tbody>
                {(cars as CarType[]).map((car) => (
                  <tr key={car.id} className="border-b border-border hover:bg-muted/50">
                    <td className="p-3"><p className="font-medium">{locale === "ar" ? car.titleAr : car.titleEn}</p><p className="text-xs text-muted-foreground">{car.brand} {car.model} {car.year}</p></td>
                    <td className="p-3 font-semibold text-secondary">{formatCurrency(car.pricePerDay)}</td>
                    <td className="p-3">{car.seats}</td>
                    <td className="p-3"><Badge variant={car.status === "AVAILABLE" ? "success" : "warning"}>{car.status === "AVAILABLE" ? (locale === "ar" ? "متاح" : "Available") : (locale === "ar" ? "محجوز" : "Booked")}</Badge></td>
                    <td className="p-3 text-muted-foreground"><span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" />{car.views}</span></td>
                    <td className="p-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => deleteMutation.mutate(car.id)} className="p-1.5 rounded-lg hover:bg-muted text-error"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <Modal open={showAddModal} onClose={() => setShowAddModal(false)} title={t("dashboard.add_car")}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <Input id="titleAr" label={locale === "ar" ? "عنوان السيارة (عربي)" : "Car Title (Arabic)"} {...form.register("titleAr")} />
          <Input id="titleEn" label={locale === "ar" ? "عنوان السيارة (إنجليزي)" : "Car Title (English)"} {...form.register("titleEn")} />
          <div className="grid grid-cols-2 gap-2">
            <Input id="brand" label={t("cars.brand")} {...form.register("brand")} />
            <Input id="model" label={t("cars.model")} {...form.register("model")} />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <Input id="year" label={locale === "ar" ? "السنة" : "Year"} type="number" {...form.register("year", { valueAsNumber: true })} />
            <Input id="pricePerDay" label={locale === "ar" ? "السعر/اليوم" : "Price/Day"} type="number" {...form.register("pricePerDay", { valueAsNumber: true })} />
            <Input id="seats" label={t("cars.seats")} type="number" {...form.register("seats", { valueAsNumber: true })} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Input id="country" label={t("auth.country")} {...form.register("country")} />
            <Input id="city" label={t("auth.city")} {...form.register("city")} />
          </div>
          <Button type="submit" className="w-full" loading={createMutation.isPending}>{t("common.save")}</Button>
        </form>
      </Modal>
    </div>
  )
}
