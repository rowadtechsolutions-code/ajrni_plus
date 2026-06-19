"use client"

import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Plus, Pencil, Trash2, AlertTriangle } from "lucide-react"
import { useLocaleStore } from "@/store/useLocaleStore"
import { useAuthStore } from "@/store/useAuthStore"
import { useTranslation } from "@/lib/i18n"
import { carService, officeService } from "@/lib/supabase/services"
import { formatCurrency, getCurrencyByCountry } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Modal } from "@/components/ui/modal"
import { AddCarForm } from "@/components/cars/add-car-form"
import type { CarType } from "@/types"

export default function DashboardCarsPage() {
  const { locale } = useLocaleStore()
  const { t } = useTranslation(locale)
  const queryClient = useQueryClient()
  const { user } = useAuthStore()
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingCar, setEditingCar] = useState<CarType | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<CarType | null>(null)

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

  const deleteMutation = useMutation({
    mutationFn: (id: string) => carService.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["my-office-cars"] }),
  })

  const openEdit = (car: CarType) => {
    setEditingCar(car)
    setShowAddModal(true)
  }

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
        <Button onClick={() => { setEditingCar(null); setShowAddModal(true) }}><Plus className="w-4 h-4 ml-2" />{t("dashboard.add_car")}</Button>
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
                  <th className="text-right p-3 font-medium text-muted-foreground">{locale === "ar" ? "الحالة" : "Status"}</th>
                  <th className="text-right p-3 font-medium text-muted-foreground">{locale === "ar" ? "الصور" : "Images"}</th>
                  <th className="p-3"></th>
                </tr>
              </thead>
              <tbody>
                {(cars as CarType[]).map((car) => (
                  <tr key={car.id} className="border-b border-border hover:bg-muted/50">
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        {car.images?.length ? <img src={car.images[0]} alt="" className="w-10 h-10 rounded-xl object-cover" /> : car.image && <img src={car.image} alt="" className="w-10 h-10 rounded-xl object-cover" />}
                        <div>
                          <p className="font-medium">{car.name}</p>
                          <p className="text-xs text-muted-foreground">{car.brand} {car.year}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 font-semibold text-secondary">
                      {formatCurrency(Number(car.price || 0), getCurrencyByCountry(car.office?.country).code)} {car.rental_type === "monthly" ? (locale === "ar" ? "شهر" : "/month") : (locale === "ar" ? "يوم" : "/day")}
                    </td>
                    <td className="p-3">
                      <Badge variant={car.status === "available" ? "success" : car.status === "rented" ? "warning" : "error"}>
                        {car.status === "available" ? (locale === "ar" ? "متاح" : "Available") : car.status === "rented" ? (locale === "ar" ? "مستأجر" : "Rented") : (locale === "ar" ? "صيانة" : "Maintenance")}
                      </Badge>
                    </td>
                    <td className="p-3 text-muted-foreground text-xs">{car.images?.length ? `${car.images.length} ${locale === "ar" ? "صور" : "images"}` : car.image ? "1" : "-"}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEdit(car)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground"><Pencil className="w-4 h-4" /></button>
                        <button onClick={() => setDeleteTarget(car)} className="p-1.5 rounded-lg hover:bg-muted text-error"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} className="max-w-sm">
        <div className="text-center py-4 space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-primary">{locale === "ar" ? "حذف السيارة" : "Delete Car"}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {locale === "ar"
                ? "هل أنت متأكد من حذف هذه السيارة؟ لا يمكن التراجع عن هذا الإجراء بعد الحذف."
                : "Are you sure you want to delete this car? This action cannot be undone."}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button onClick={() => { if (deleteTarget) { deleteMutation.mutate(deleteTarget.id); setDeleteTarget(null) } }} className="flex-1 bg-red-500 hover:bg-red-600 text-white">
              <Trash2 className="w-4 h-4" />
              {locale === "ar" ? "تأكيد الحذف" : "Confirm Delete"}
            </Button>
            <Button onClick={() => setDeleteTarget(null)} variant="outline" className="flex-1">
              {locale === "ar" ? "إلغاء" : "Cancel"}
            </Button>
          </div>
        </div>
      </Modal>
      <Modal open={showAddModal} onClose={() => setShowAddModal(false)} title={locale === "ar" ? (editingCar ? "تعديل السيارة" : "إضافة سيارة") : editingCar ? "Edit Car" : "Add Car"}>
        {office && <AddCarForm officeId={office.id} editingCar={editingCar} onClose={() => setShowAddModal(false)} />}
      </Modal>
    </div>
  )
}
