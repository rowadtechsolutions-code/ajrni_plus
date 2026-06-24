"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { MessageCircle, Eye, Send, CheckCircle, XCircle, Loader2, Check } from "lucide-react"
import { useLocaleStore } from "@/store/useLocaleStore"
import { useAuthStore } from "@/store/useAuthStore"
import { useTranslation } from "@/lib/i18n"
import { bookingRequestService, bookingOfferService } from "@/lib/supabase/services"
import { getClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Modal } from "@/components/ui/modal"
import { formatPhoneNumber } from "@/lib/utils"
import type { BookingRequestType, BookingOfferType } from "@/types"

const supabase = getClient()

export default function DashboardRequestsPage() {
  const { locale } = useLocaleStore()
  const { t } = useTranslation(locale)
  const { user } = useAuthStore()
  const queryClient = useQueryClient()
  const [selectedRequest, setSelectedRequest] = useState<any>(null)
  const [offerModal, setOfferModal] = useState(false)
  const [offerForm, setOfferForm] = useState({ carName: "", carYear: "", pricePerDay: "", totalPrice: "", notes: "" })
  const [offerErrors, setOfferErrors] = useState<Record<string, string>>({})
  const [offerSent, setOfferSent] = useState(false)

  const { data: assignments = [], isLoading } = useQuery({
    queryKey: ["office-requests", user?.id],
    queryFn: () => bookingRequestService.getByOffice(user!.id),
    enabled: !!user?.id,
  })

  const { data: myOffersMap = {} } = useQuery({
    queryKey: ["my-offered-requests", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("BookingOffers").select("request_id, status, id, car_name").eq("office_id", user!.id)
      const map: Record<string, any> = {}
      ;(data || []).forEach((o: any) => { map[o.request_id] = o })
      return map
    },
    enabled: !!user?.id,
  })

  const { data: myOffers = [] } = useQuery({
    queryKey: ["my-offers", selectedRequest?.request_id, user?.id],
    queryFn: () => bookingRequestService.getOffersByRequest(selectedRequest!.request_id),
    enabled: !!selectedRequest?.request_id,
  })

  const hasSentOffer = myOffers.some((o: any) => o.office_id === user?.id)

  const sendOfferMutation = useMutation({
    mutationFn: async () => {
      if (!selectedRequest || !user?.id) return
      const errors: Record<string, string> = {}
      if (!offerForm.carName.trim()) errors.carName = locale === "ar" ? "اسم السيارة مطلوب" : "Car name is required"
      if (!offerForm.carYear.trim()) errors.carYear = locale === "ar" ? "سنة الصنع مطلوبة" : "Year is required"
      if (!offerForm.pricePerDay.trim()) errors.pricePerDay = locale === "ar" ? "السعر اليومي مطلوب" : "Price per day is required"
      if (!offerForm.totalPrice.trim()) errors.totalPrice = locale === "ar" ? "السعر الإجمالي مطلوب" : "Total price is required"
      if (Object.keys(errors).length) { setOfferErrors(errors); throw new Error("validation") }
      setOfferErrors({})
      await bookingOfferService.create({
        request_id: selectedRequest.request_id,
        office_id: user.id,
        car_name: offerForm.carName,
        car_model: offerForm.carYear,
        price_per_day: offerForm.pricePerDay ? Number(offerForm.pricePerDay) : undefined,
        total_price: offerForm.totalPrice ? Number(offerForm.totalPrice) : undefined,
        notes: offerForm.notes || undefined,
      })
    },
    onSuccess: () => {
      setOfferSent(true)
      setOfferForm({ carName: "", carYear: "", pricePerDay: "", totalPrice: "", notes: "" })
      setOfferErrors({})
      queryClient.invalidateQueries({ queryKey: ["office-requests"] })
      queryClient.invalidateQueries({ queryKey: ["my-offered-requests"] })
      queryClient.invalidateQueries({ queryKey: ["my-offers"] })
    },
    onError: (err: any) => {
      if (err?.message !== "validation") {
        if (process.env.NODE_ENV !== "production") console.error("Send offer error:", err)
        alert(err?.message || (locale === "ar" ? "فشل إرسال العرض" : "Failed to send offer"))
      }
    },
  })

  const openRequest = async (assignment: any) => {
    setSelectedRequest(assignment)
    await bookingRequestService.markViewed(assignment.id)
    queryClient.invalidateQueries({ queryKey: ["office-requests"] })
  }

  if (!user) {
    return (
      <div className="p-4 md:p-6">
        <p className="text-muted-foreground">{locale === "ar" ? "يرجى تسجيل الدخول" : "Please log in"}</p>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-xl font-bold text-primary mb-6">{locale === "ar" ? "طلبات العملاء" : "Customer Requests"}</h1>
      {isLoading ? (
        <div className="p-8 text-center text-muted-foreground animate-pulse">{locale === "ar" ? "جاري التحميل..." : "Loading..."}</div>
      ) : assignments.length === 0 ? (
        <div className="text-center py-16">
          <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">{locale === "ar" ? "لا توجد طلبات حالياً" : "No requests yet"}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {assignments.filter((a: any) => a.request).map((a: any) => {
            const req = a.request as BookingRequestType
            return (
              <div key={a.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 hover:shadow-md transition-all">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0" onClick={() => openRequest(a)}>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-primary">{req.full_name || (locale === "ar" ? "طلب جديد" : "New Request")}</h3>
                      {a.status === "sent" && <span className="w-2 h-2 rounded-full bg-error" />}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{req.car_type}{req.brand ? ` • ${req.brand}` : ""}{req.model ? ` • ${req.model}` : ""}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {req.city && <span className="text-[10px] bg-muted px-2 py-0.5 rounded-lg text-muted-foreground">{req.city}</span>}
                      {req.budget_per_day && <span className="text-[10px] bg-muted px-2 py-0.5 rounded-lg text-muted-foreground">{req.budget_per_day} {locale === "ar" ? "ريال/يوم" : "/day"}</span>}
                      {req.pickup_date && <span className="text-[10px] bg-muted px-2 py-0.5 rounded-lg text-muted-foreground">{req.pickup_date}{req.return_date ? ` → ${req.return_date}` : ""}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {myOffersMap[a.request_id] ? (
                      <>
                        {myOffersMap[a.request_id].status === "accepted" ? (
                          <span className="text-[10px] bg-green-100 text-green-700 font-semibold px-2.5 py-1 rounded-full">{locale === "ar" ? "مقبول" : "Accepted"}</span>
                        ) : myOffersMap[a.request_id].status === "rejected" ? (
                          <span className="text-[10px] bg-red-100 text-red-700 font-semibold px-2.5 py-1 rounded-full">{locale === "ar" ? "مرفوض" : "Rejected"}</span>
                        ) : null}
                        <Button size="sm" onClick={() => openRequest(a)}>
                          <Eye className="w-3.5 h-3.5" />
                        </Button>
                      </>
                    ) : (
                      <Button size="sm" onClick={() => openRequest(a)}>
                        <Send className="w-3.5 h-3.5" />
                        {locale === "ar" ? "عرض" : "Offer"}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <Modal open={!!selectedRequest && !offerModal} onClose={() => setSelectedRequest(null)} title={locale === "ar" ? "تفاصيل الطلب" : "Request Details"} className="max-w-lg">
        {selectedRequest?.request && (
          <div className="space-y-4 max-h-[60vh] sm:max-h-none overflow-y-auto -mx-2 sm:mx-0 px-2 sm:px-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="bg-muted/30 rounded-xl p-3"><p className="text-muted-foreground text-[10px] uppercase tracking-wide">{locale === "ar" ? "الاسم" : "Name"}</p><p className="font-medium mt-1">{selectedRequest.request.full_name || "-"}</p></div>
              <div className="bg-muted/30 rounded-xl p-3"><p className="text-muted-foreground text-[10px] uppercase tracking-wide">{locale === "ar" ? "الجوال" : "Phone"}</p><p className="font-medium mt-1" dir="ltr">{selectedRequest.request.phone_number || "-"}</p></div>
              <div className="bg-muted/30 rounded-xl p-3"><p className="text-muted-foreground text-[10px] uppercase tracking-wide">{locale === "ar" ? "الدولة" : "Country"}</p><p className="font-medium mt-1">{selectedRequest.request.country || "-"}</p></div>
              <div className="bg-muted/30 rounded-xl p-3"><p className="text-muted-foreground text-[10px] uppercase tracking-wide">{locale === "ar" ? "المدينة" : "City"}</p><p className="font-medium mt-1">{selectedRequest.request.city || "-"}</p></div>
              <div className="bg-muted/30 rounded-xl p-3"><p className="text-muted-foreground text-[10px] uppercase tracking-wide">{locale === "ar" ? "نوع السيارة" : "Car Type"}</p><p className="font-medium mt-1">{selectedRequest.request.car_type || "-"}</p></div>
              <div className="bg-muted/30 rounded-xl p-3"><p className="text-muted-foreground text-[10px] uppercase tracking-wide">{locale === "ar" ? "الماركة" : "Brand"}</p><p className="font-medium mt-1">{selectedRequest.request.brand || "-"}</p></div>
              <div className="bg-muted/30 rounded-xl p-3"><p className="text-muted-foreground text-[10px] uppercase tracking-wide">{locale === "ar" ? "الموديل" : "Model"}</p><p className="font-medium mt-1">{selectedRequest.request.model || "-"}</p></div>
              <div className="bg-muted/30 rounded-xl p-3"><p className="text-muted-foreground text-[10px] uppercase tracking-wide">{locale === "ar" ? "الميزانية" : "Budget"}</p><p className="font-medium mt-1">{selectedRequest.request.budget_per_day ? `${selectedRequest.request.budget_per_day}/day` : "-"}</p></div>
            </div>
            {selectedRequest.request.notes && (
              <div className="bg-muted/20 rounded-xl p-3"><p className="text-muted-foreground text-[10px] uppercase tracking-wide mb-1">{locale === "ar" ? "ملاحظات" : "Notes"}</p><p className="text-sm">{selectedRequest.request.notes}</p></div>
            )}
            {myOffers.length > 0 && (
              <div className="border-t pt-3">
                <h4 className="font-semibold text-sm text-primary mb-2">{locale === "ar" ? "عروضي" : "My Offers"}</h4>
                <div className="space-y-2">
                  {myOffers.filter((o: any) => o.office_id === user?.id).map((offer: any) => (
                    <div key={offer.id} className="flex items-center justify-between border border-gray-200 rounded-xl p-3">
                      <div>
                        <p className="text-sm font-medium">{offer.car_name || "-"}{offer.car_model ? ` (${offer.car_model})` : ""}</p>
                        <div className="flex gap-2 mt-1">
                          {offer.price_per_day && <span className="text-xs bg-secondary/10 text-secondary font-semibold px-2 py-0.5 rounded-lg">{offer.price_per_day}/day</span>}
                          {offer.total_price && <span className="text-xs bg-secondary/10 text-secondary font-semibold px-2 py-0.5 rounded-lg">{locale === "ar" ? "إجمالي" : "Total"}: {offer.total_price}</span>}
                        </div>
                      </div>
                      <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${
                        offer.status === "accepted" ? "bg-green-100 text-green-700" :
                        offer.status === "rejected" ? "bg-red-100 text-red-700" :
                        "bg-amber-100 text-amber-700"
                      }`}>
                        {offer.status === "accepted" ? (locale === "ar" ? "مقبول" : "Accepted") :
                         offer.status === "rejected" ? (locale === "ar" ? "مرفوض" : "Rejected") :
                         (locale === "ar" ? "قيد الانتظار" : "Pending")}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {hasSentOffer ? (
              <Button className="w-full" disabled><Check className="w-4 h-4" />{locale === "ar" ? "تم إرسال عرضك" : "Offer Sent"}</Button>
            ) : (
              <Button className="w-full" onClick={() => { setOfferSent(false); setOfferModal(true) }}><Send className="w-4 h-4" />{locale === "ar" ? "إرسال عرض" : "Send Offer"}</Button>
            )}
          </div>
        )}
      </Modal>

      <Modal open={offerModal} onClose={() => { if (!sendOfferMutation.isPending) { setOfferModal(false); setOfferErrors({}); setOfferSent(false) } }} title={locale === "ar" ? "إرسال عرض" : "Send Offer"} className="max-w-md">
        {offerSent ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-bold text-primary">{locale === "ar" ? "تم إرسال العرض" : "Offer Sent"}</h3>
            <p className="text-sm text-muted-foreground">{locale === "ar" ? "بانتظار رد المستخدم" : "Waiting for user response"}</p>
            <Button onClick={() => { setOfferModal(false); setOfferSent(false) }} className="mt-2">{locale === "ar" ? "تم" : "Done"}</Button>
          </div>
        ) : (
        <div className="space-y-3">
          <div>
            <input value={offerForm.carName} onChange={(e) => { setOfferErrors(p => ({ ...p, carName: "" })); setOfferForm(p => ({ ...p, carName: e.target.value })) }} placeholder={locale === "ar" ? "اسم السيارة *" : "Car name *"} className={`w-full rounded-xl border ${offerErrors.carName ? "border-error ring-2 ring-error/20" : "border-gray-200"} bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20`} />
            {offerErrors.carName && <p className="text-xs text-error mt-1">{offerErrors.carName}</p>}
          </div>
          <div>
            <input value={offerForm.carYear} onChange={(e) => { setOfferErrors(p => ({ ...p, carYear: "" })); setOfferForm(p => ({ ...p, carYear: e.target.value })) }} type="number" placeholder={locale === "ar" ? "سنة الصنع *" : "Year *"} className={`w-full rounded-xl border ${offerErrors.carYear ? "border-error ring-2 ring-error/20" : "border-gray-200"} bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20`} />
            {offerErrors.carYear && <p className="text-xs text-error mt-1">{offerErrors.carYear}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <input value={offerForm.pricePerDay} onChange={(e) => { setOfferErrors(p => ({ ...p, pricePerDay: "" })); setOfferForm(p => ({ ...p, pricePerDay: e.target.value })) }} type="number" placeholder={locale === "ar" ? "السعر اليومي *" : "Price/day *"} className={`w-full rounded-xl border ${offerErrors.pricePerDay ? "border-error ring-2 ring-error/20" : "border-gray-200"} bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20`} />
              {offerErrors.pricePerDay && <p className="text-xs text-error mt-1">{offerErrors.pricePerDay}</p>}
            </div>
            <div>
              <input value={offerForm.totalPrice} onChange={(e) => { setOfferErrors(p => ({ ...p, totalPrice: "" })); setOfferForm(p => ({ ...p, totalPrice: e.target.value })) }} type="number" placeholder={locale === "ar" ? "السعر الإجمالي *" : "Total price *"} className={`w-full rounded-xl border ${offerErrors.totalPrice ? "border-error ring-2 ring-error/20" : "border-gray-200"} bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20`} />
              {offerErrors.totalPrice && <p className="text-xs text-error mt-1">{offerErrors.totalPrice}</p>}
            </div>
          </div>
          <textarea value={offerForm.notes} onChange={(e) => setOfferForm(p => ({ ...p, notes: e.target.value }))} placeholder={locale === "ar" ? "ملاحظات إضافية" : "Additional notes"} className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 min-h-[80px] resize-y" />
          <Button onClick={() => sendOfferMutation.mutate()} disabled={sendOfferMutation.isPending} className="w-full">
            {sendOfferMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            {locale === "ar" ? "إرسال العرض" : "Submit Offer"}
          </Button>
        </div>
        )}
      </Modal>
    </div>
  )
}
