"use client"

import { useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import Link from "next/link"
import { MessageCircle, CheckCircle, XCircle, Clock, ArrowLeft, Car, MapPin, Calendar } from "lucide-react"
import { useLocaleStore } from "@/store/useLocaleStore"
import { useAuthStore } from "@/store/useAuthStore"
import { useTranslation } from "@/lib/i18n"
import { bookingRequestService, bookingOfferService } from "@/lib/supabase/services"
import { Modal } from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import { getCurrencyByCountry } from "@/lib/utils"
import { CurrencySymbol } from "@/components/shared/currency-symbol"
import type { BookingRequestType, BookingOfferType } from "@/types"

export default function MyRequestsPage() {
  const { locale } = useLocaleStore()
  const { t } = useTranslation(locale)
  const { user } = useAuthStore()
  const queryClient = useQueryClient()
  const [selectedRequest, setSelectedRequest] = useState<any>(null)

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ["my-requests", user?.id],
    queryFn: () => bookingRequestService.getByUser(user!.id),
    enabled: !!user?.id,
  })

  const { data: selectedOffers = [] } = useQuery({
    queryKey: ["request-offers", selectedRequest?.id],
    queryFn: () => bookingRequestService.getOffersByRequest(selectedRequest!.id),
    enabled: !!selectedRequest?.id,
  })

  const handleAccept = async (offer: any, req: any) => {
    if (process.env.NODE_ENV !== "production") console.log("[handleAccept] clicked", { offerId: offer?.id, reqId: req?.id, officeId: offer?.office_id })
    try {
      await bookingOfferService.acceptOffer(offer.id, req.id)
      if (process.env.NODE_ENV !== "production") console.log("[handleAccept] acceptOffer succeeded")
      queryClient.invalidateQueries({ queryKey: ["my-requests", user?.id] })
      queryClient.invalidateQueries({ queryKey: ["request-offers", req.id] })
      setSelectedRequest(null)
    } catch (err: any) {
      if (process.env.NODE_ENV !== "production") console.error("[handleAccept] acceptOffer threw:", err)
      alert(err?.message || (locale === "ar" ? "فشل قبول العرض" : "Failed to accept offer"))
    }
  }

  const requestCurrencyCode = (country?: string | null) => getCurrencyByCountry(country || "").code

  if (!user) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 text-center">
        <p className="text-muted-foreground mb-4">{locale === "ar" ? "يرجى تسجيل الدخول لعرض طلباتك" : "Please login to view your requests"}</p>
        <Link href="/auth/login" className="text-secondary hover:underline">{locale === "ar" ? "تسجيل الدخول" : "Login"}</Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/profile" className="p-2 rounded-xl hover:bg-muted text-muted-foreground"><ArrowLeft className="w-5 h-5" /></Link>
        <div>
          <h1 className="text-2xl font-bold text-primary">{locale === "ar" ? "طلباتي" : "My Requests"}</h1>
          <p className="text-sm text-muted-foreground">{requests.length} {locale === "ar" ? "طلب" : "requests"}</p>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-16 animate-pulse text-muted-foreground">{locale === "ar" ? "جاري التحميل..." : "Loading..."}</div>
      ) : requests.length === 0 ? (
        <div className="text-center py-16">
          <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground mb-2">{locale === "ar" ? "لا توجد طلبات بعد" : "No requests yet"}</p>
          <Link href="/" className="text-secondary hover:underline text-sm">{locale === "ar" ? "طلب سيارة الآن" : "Request a car now"}</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {(requests as any[]).map((req) => {
            const acceptedOffer = req.offers?.find((o: any) => o.status === "accepted")
            return (
              <div key={req.id} className={`relative bg-white rounded-2xl border border-gray-200 shadow-sm p-5 hover:shadow-md transition-all cursor-pointer overflow-hidden ${req.status === "completed" ? "border-r-4 border-r-green-500" : req.status === "cancelled" ? "border-r-4 border-r-red-400" : req.offers?.length ? "border-r-4 border-r-blue-400" : ""}`} onClick={() => setSelectedRequest(req)}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Car className="w-4 h-4 text-muted-foreground shrink-0" />
                      <h3 className="font-semibold text-primary truncate">{req.car_type || (locale === "ar" ? "طلب سيارة" : "Car Request")}</h3>
                    </div>
                    <div className="flex flex-wrap gap-x-3 gap-y-1.5 mt-2 text-xs text-muted-foreground">
                      {req.city && (
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="w-3 h-3" />{req.city}
                        </span>
                      )}
                      {req.brand && (
                        <span className="inline-flex items-center gap-1">
                          <Car className="w-3 h-3" />{req.brand}{req.model ? ` ${req.model}` : ""}
                        </span>
                      )}
                      {req.budget_per_day && (
                        <span className="inline-flex items-center gap-1 whitespace-nowrap">
                          {req.budget_per_day} <CurrencySymbol currency={requestCurrencyCode(req.country)} size="compact" />/{locale === "ar" ? "يوم" : "day"}
                        </span>
                      )}
                      {req.pickup_date && (
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="w-3 h-3" />{req.pickup_date}{req.return_date ? ` → ${req.return_date}` : ""}
                        </span>
                      )}
                    </div>
                    {acceptedOffer && (
                        <div className="mt-3 flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-3 py-2">
                          <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
                          <span className="text-xs text-green-700 font-medium">
                            {locale === "ar" ? `تم قبول عرض: ${acceptedOffer.car_name || "سيارة"}` : `Accepted: ${acceptedOffer.car_name || "Car"}`}
                          </span>
                          {acceptedOffer.price_per_day && (
                            <span className="inline-flex items-center gap-1 whitespace-nowrap text-[10px] bg-green-200 text-green-800 font-semibold px-2 py-0.5 rounded-lg">{acceptedOffer.price_per_day} <CurrencySymbol currency={requestCurrencyCode(req.country)} size="compact" />/{locale === "ar" ? "يوم" : "day"}</span>
                          )}
                        </div>
                    )}
                  </div>
                  <span className={`shrink-0 text-[10px] font-semibold px-2.5 py-1 rounded-full ${
                    req.status === "completed" ? "bg-green-100 text-green-700" :
                    req.status === "cancelled" ? "bg-red-100 text-red-700" :
                    req.offers?.length ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"
                  }`}>
                    {req.status === "completed" ? (locale === "ar" ? "مكتمل" : "Completed") :
                     req.status === "cancelled" ? (locale === "ar" ? "ملغي" : "Cancelled") :
                     req.offers?.length ? `${req.offers.length} ${locale === "ar" ? "عروض" : "offers"}` :
                     (locale === "ar" ? "قيد الانتظار" : "Pending")}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <Modal open={!!selectedRequest} onClose={() => setSelectedRequest(null)} title={locale === "ar" ? "تفاصيل الطلب" : "Request Details"} className="max-w-lg">
        {selectedRequest && (
          <div className="space-y-5 max-h-[60vh] sm:max-h-none overflow-y-auto -mx-2 sm:mx-0 px-2 sm:px-0">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-muted/30 rounded-xl p-3">
                <p className="text-muted-foreground text-[10px] uppercase tracking-wide">{locale === "ar" ? "نوع السيارة" : "Car Type"}</p>
                <p className="font-semibold mt-1">{selectedRequest.car_type || "-"}</p>
              </div>
              <div className="bg-muted/30 rounded-xl p-3">
                <p className="text-muted-foreground text-[10px] uppercase tracking-wide">{locale === "ar" ? "الماركة" : "Brand"}</p>
                <p className="font-semibold mt-1">{selectedRequest.brand || "-"}</p>
              </div>
              <div className="bg-muted/30 rounded-xl p-3">
                <p className="text-muted-foreground text-[10px] uppercase tracking-wide">{locale === "ar" ? "الموديل" : "Model"}</p>
                <p className="font-semibold mt-1">{selectedRequest.model || "-"}</p>
              </div>
              <div className="bg-muted/30 rounded-xl p-3">
                <p className="text-muted-foreground text-[10px] uppercase tracking-wide">{locale === "ar" ? "الميزانية" : "Budget"}</p>
                <p className="font-semibold mt-1">{selectedRequest.budget_per_day ? <span className="inline-flex items-center gap-1 whitespace-nowrap">{selectedRequest.budget_per_day} <CurrencySymbol currency={requestCurrencyCode(selectedRequest.country)} size="compact" />/{locale === "ar" ? "يوم" : "day"}</span> : "-"}</p>
              </div>
              <div className="bg-muted/30 rounded-xl p-3">
                <p className="text-muted-foreground text-[10px] uppercase tracking-wide">{locale === "ar" ? "المدينة" : "City"}</p>
                <p className="font-semibold mt-1">{selectedRequest.city || "-"}</p>
              </div>
              <div className="bg-muted/30 rounded-xl p-3 col-span-2 sm:col-span-1">
                <p className="text-muted-foreground text-[10px] uppercase tracking-wide">{locale === "ar" ? "التواريخ" : "Dates"}</p>
                <p className="font-semibold mt-1">{selectedRequest.pickup_date || ""}{selectedRequest.return_date ? ` → ${selectedRequest.return_date}` : locale === "ar" ? "غير محدد" : "Not set"}</p>
              </div>
            </div>
            {selectedRequest.notes && (
              <div className="bg-muted/20 rounded-xl p-3">
                <p className="text-muted-foreground text-[10px] uppercase tracking-wide mb-1">{locale === "ar" ? "ملاحظات" : "Notes"}</p>
                <p className="text-sm">{selectedRequest.notes}</p>
              </div>
            )}

            <div className="border-t pt-4">
              <h4 className="font-semibold text-sm text-primary mb-3 flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                {locale === "ar" ? "العروض" : "Offers"}
                {selectedOffers.length > 0 && <span className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full">{selectedOffers.length}</span>}
              </h4>
              {selectedOffers.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">{locale === "ar" ? "لا توجد عروض بعد، سيتم إشعارك عند وصول عرض" : "No offers yet. You'll be notified when an offer arrives."}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedOffers.map((offer: any) => (
                    <div key={offer.id} className={`relative border rounded-xl p-4 transition-all ${offer.status === "accepted" ? "border-green-300 bg-green-50/30" : offer.status === "rejected" ? "border-red-200 bg-red-50/20 opacity-70" : "border-gray-200 hover:border-gray-300"}`}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <Car className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                            <p className="font-medium text-sm truncate">{offer.car_name || (locale === "ar" ? "سيارة" : "Car")}</p>
                          </div>
                          {offer.car_model && <p className="text-xs text-muted-foreground mt-0.5 mr-5">{offer.car_model}</p>}
                          <div className="flex flex-wrap gap-2 mt-2">
                            {offer.price_per_day && (
                              <span className="inline-flex items-center gap-1 whitespace-nowrap text-xs bg-secondary/10 text-secondary font-semibold px-2.5 py-0.5 rounded-lg">
                                {offer.price_per_day} <CurrencySymbol currency={requestCurrencyCode(selectedRequest?.country)} size="compact" />/{locale === "ar" ? "يوم" : "day"}
                              </span>
                            )}
                            {offer.total_price && (
                              <span className="inline-flex items-center gap-1 whitespace-nowrap text-xs bg-secondary/10 text-secondary font-semibold px-2.5 py-0.5 rounded-lg">
                                {locale === "ar" ? "إجمالي" : "Total"}: {offer.total_price} <CurrencySymbol currency={requestCurrencyCode(selectedRequest?.country)} size="compact" />
                              </span>
                            )}
                          </div>
                          {offer.notes && <p className="text-xs text-muted-foreground mt-2">{offer.notes}</p>}
                          {offer.status === "accepted" && offer.office?.phone_number && (
                            <div className="mt-3">
                              <a href={`https://wa.me/${offer.office.phone_number.replace(/[^0-9]/g, "")}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs bg-green-50 text-green-700 px-3 py-1.5 rounded-lg hover:bg-green-100 transition-all font-medium border border-green-200">
                                <MessageCircle className="w-3.5 h-3.5" />
                                WhatsApp
                              </a>
                            </div>
                          )}
                        </div>
                        <div className="shrink-0 flex flex-col items-end gap-2">
                          {offer.status === "accepted" ? (
                            <span className="text-[10px] bg-green-100 text-green-700 px-2.5 py-1 rounded-full font-medium flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" />{locale === "ar" ? "مقبول" : "Accepted"}
                            </span>
                          ) : offer.status === "rejected" ? (
                            <span className="text-[10px] bg-red-100 text-red-700 px-2.5 py-1 rounded-full font-medium flex items-center gap-1">
                              <XCircle className="w-3 h-3" />{locale === "ar" ? "مرفوض" : "Rejected"}
                            </span>
                          ) : selectedRequest.status !== "completed" ? (
                            <Button size="sm" onClick={(e) => { e.stopPropagation(); handleAccept(offer, selectedRequest) }}>
                              <CheckCircle className="w-3.5 h-3.5" />
                              {locale === "ar" ? "قبول" : "Accept"}
                            </Button>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
