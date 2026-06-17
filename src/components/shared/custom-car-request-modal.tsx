"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Send, CheckCircle } from "lucide-react"
import { Modal } from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useLocaleStore } from "@/store/useLocaleStore"
import { useAuthStore } from "@/store/useAuthStore"
import { gulfCountries } from "@/lib/locations"
import { brands, brandModels } from "@/lib/brands"
import { bookingRequestService } from "@/lib/supabase/services"

const carTypes = [
  { id: "sedan", ar: "سيدان", en: "Sedan" },
  { id: "suv", ar: "دفع رباعي", en: "SUV" },
  { id: "hatchback", ar: "هاتشباك", en: "Hatchback" },
  { id: "pickup", ar: "بيك أب", en: "Pickup" },
  { id: "luxury", ar: "فخمة", en: "Luxury" },
  { id: "sports", ar: "رياضية", en: "Sports" },
  { id: "van", ar: "فان", en: "Van" },
  { id: "coupe", ar: "كوبيه", en: "Coupe" },
  { id: "convertible", ar: "مكشوفة", en: "Convertible" },
]

interface CustomCarRequestModalProps {
  open: boolean
  onClose: () => void
}

export function CustomCarRequestModal({ open, onClose }: CustomCarRequestModalProps) {
  const { locale } = useLocaleStore()
  const { user, profile } = useAuthStore()
  const router = useRouter()
  const [sending, setSending] = useState(false)
  const [success, setSuccess] = useState(false)

  const [form, setForm] = useState({
    carType: "",
    brand: "",
    model: "",
    country: profile?.country || user?.user_metadata?.country || "",
    city: profile?.city || user?.user_metadata?.city || "",
    pickupDate: "",
    returnDate: "",
    budget: "",
    notes: "",
  })

  const cities = form.country ? (gulfCountries.find((c) => c.code === form.country)?.cities || []) : []

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (field === "country") setForm((prev) => ({ ...prev, city: "" }))
    if (field === "brand") setForm((prev) => ({ ...prev, model: "" }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.id) {
      router.push("/auth/login")
      return
    }
    setSending(true)
    try {
      await bookingRequestService.create({
        user_id: user.id,
        country: form.country,
        city: form.city,
        car_type: form.carType,
        brand: form.brand,
        model: form.model,
        pickup_date: form.pickupDate || undefined,
        return_date: form.returnDate || undefined,
        budget_per_day: form.budget ? Number(form.budget) : undefined,
        notes: form.notes || undefined,
        full_name: profile?.full_name || profile?.name || undefined,
        phone_number: profile?.phone_number || undefined,
      })
      setSuccess(true)
    } catch (err: any) {
      console.error("Request error:", err, "message:", err?.message, "details:", err?.details, "hint:", err?.hint, "code:", err?.code, "JSON:", JSON.stringify(err))
      const msg = err?.message || err?.error_description || (typeof err === "string" ? err : JSON.stringify(err))
      alert(msg || (locale === "ar" ? "فشل إرسال الطلب" : "Failed to send request"))
    } finally {
      setSending(false)
    }
  }

  const handleClose = () => {
    setSuccess(false)
    setForm({ carType: "", brand: "", model: "", country: profile?.country || "", city: profile?.city || "", pickupDate: "", returnDate: "", budget: "", notes: "" })
    onClose()
  }

  return (
    <Modal open={open} onClose={handleClose} title={locale === "ar" ? "طلب سيارة مخصص" : "Custom Car Request"} className="max-w-lg">
      {success ? (
        <div className="text-center py-6 space-y-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-lg font-bold text-primary">{locale === "ar" ? "تم إرسال الطلب" : "Request Sent"}</h3>
          <p className="text-sm text-muted-foreground">{locale === "ar" ? "سيتم إعلامك عند ورود عروض من المكاتب" : "You will be notified when offices send their offers"}</p>
          <Button onClick={handleClose} className="mt-2">{locale === "ar" ? "تم" : "Done"}</Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input id="fullName" label={locale === "ar" ? "الاسم" : "Full Name"} value={profile?.full_name || profile?.name || ""} disabled />
            <Input id="phone" label={locale === "ar" ? "رقم الجوال" : "Phone"} value={profile?.phone_number || ""} disabled />
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-primary">{locale === "ar" ? "الدولة" : "Country"}</label>
              <select value={form.country} onChange={(e) => updateField("country", e.target.value)} className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20">
                <option value="">{locale === "ar" ? "اختر الدولة" : "Select country"}</option>
                {gulfCountries.map((c) => (
                  <option key={c.code} value={c.code}>{locale === "ar" ? c.nameAr : c.nameEn}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-primary">{locale === "ar" ? "المدينة" : "City"}</label>
              <select value={form.city} onChange={(e) => updateField("city", e.target.value)} disabled={!form.country} className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20">
                <option value="">{locale === "ar" ? "اختر المدينة" : "Select city"}</option>
                {cities.map((c) => (
                  <option key={c.nameAr} value={c.nameAr}>{locale === "ar" ? c.nameAr : c.nameEn}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-primary">{locale === "ar" ? "نوع السيارة" : "Car Type"}</label>
              <select value={form.carType} onChange={(e) => updateField("carType", e.target.value)} className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20">
                <option value="">{locale === "ar" ? "اختر النوع" : "Select type"}</option>
                {carTypes.map((t) => (
                  <option key={t.id} value={t.id}>{locale === "ar" ? t.ar : t.en}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-primary">{locale === "ar" ? "الماركة" : "Brand"}</label>
              <select value={form.brand} onChange={(e) => updateField("brand", e.target.value)} className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20">
                <option value="">{locale === "ar" ? "اختر الماركة" : "Select brand"}</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>{b.label}</option>
                ))}
              </select>
            </div>
            {form.brand && brandModels[form.brand] ? (
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-primary">{locale === "ar" ? "الموديل" : "Model"}</label>
                <select value={form.model} onChange={(e) => updateField("model", e.target.value)} className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20">
                  <option value="">{locale === "ar" ? "اختر الموديل" : "Select model"}</option>
                  {brandModels[form.brand].map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
            ) : (
              <Input id="model" label={locale === "ar" ? "الموديل" : "Model"} value={form.model} onChange={(e) => updateField("model", e.target.value)} placeholder={locale === "ar" ? "اختياري" : "Optional"} />
            )}
            <Input id="pickupDate" label={locale === "ar" ? "تاريخ الاستلام" : "Pickup Date"} type="date" value={form.pickupDate} onChange={(e) => updateField("pickupDate", e.target.value)} />
            <Input id="returnDate" label={locale === "ar" ? "تاريخ الإرجاع" : "Return Date"} type="date" value={form.returnDate} onChange={(e) => updateField("returnDate", e.target.value)} />
            <Input id="budget" label={locale === "ar" ? "الميزانية اليومية" : "Budget per Day"} type="number" value={form.budget} onChange={(e) => updateField("budget", e.target.value)} placeholder={locale === "ar" ? "مثال: 50" : "e.g. 50"} />
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-primary">{locale === "ar" ? "ملاحظات إضافية" : "Additional Notes"}</label>
            <textarea value={form.notes} onChange={(e) => updateField("notes", e.target.value)} className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 min-h-[80px] resize-y" placeholder={locale === "ar" ? "أي متطلبات إضافية..." : "Any additional requirements..."} />
          </div>
          <Button type="submit" disabled={sending} className="w-full">
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            {locale === "ar" ? "إرسال الطلب" : "Send Request"}
          </Button>
        </form>
      )}
    </Modal>
  )
}
