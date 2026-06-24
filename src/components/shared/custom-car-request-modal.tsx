"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Send, CheckCircle, ArrowLeft, ExternalLink } from "lucide-react"
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
  const [errors, setErrors] = useState<Record<string, string>>({})

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

    const errs: Record<string, string> = {}
    if (!form.country) errs.country = locale === "ar" ? "اختر الدولة" : "Select country"
    if (!form.city) errs.city = locale === "ar" ? "اختر المدينة" : "Select city"
    if (!form.carType) errs.carType = locale === "ar" ? "اختر نوع السيارة" : "Select car type"
    if (!form.brand) errs.brand = locale === "ar" ? "اختر الماركة" : "Select brand"
    if (form.brand && brandModels[form.brand] && !form.model) errs.model = locale === "ar" ? "اختر الموديل" : "Select model"
    if (!form.pickupDate) errs.pickupDate = locale === "ar" ? "اختر تاريخ الاستلام" : "Select pickup date"
    if (!form.returnDate) errs.returnDate = locale === "ar" ? "اختر تاريخ الإرجاع" : "Select return date"
    if (!form.budget) errs.budget = locale === "ar" ? "أدخل الميزانية اليومية" : "Enter budget per day"
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({})

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
      if (process.env.NODE_ENV !== "production") console.error("Request error:", err, "message:", err?.message, "details:", err?.details, "hint:", err?.hint, "code:", err?.code, "JSON:", JSON.stringify(err))
      const msg = err?.message || err?.error_description || (typeof err === "string" ? err : JSON.stringify(err))
      alert(msg || (locale === "ar" ? "فشل إرسال الطلب" : "Failed to send request"))
    } finally {
      setSending(false)
    }
  }

  const handleClose = () => {
    setSuccess(false)
    setErrors({})
    setForm({ carType: "", brand: "", model: "", country: profile?.country || "", city: profile?.city || "", pickupDate: "", returnDate: "", budget: "", notes: "" })
    onClose()
  }

  const requiredLabel = (label: string) => `${label} *`
  const requiredLabelJSX = (label: string) => <>{label} <span className="text-error">*</span></>

  return (
    <Modal open={open} onClose={handleClose} title={locale === "ar" ? "طلب سيارة مخصص" : "Custom Car Request"} className="max-w-lg">
      {success ? (
        <div className="text-center py-8 space-y-5">
          <div className="relative mx-auto w-20 h-20">
            <div className="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-40" />
            <div className="relative w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-green-200">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-primary">{locale === "ar" ? "تم إرسال الطلب بنجاح" : "Request Sent Successfully"}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto">
              {locale === "ar"
                ? "تم إرسال طلب السيارة المخصصة بنجاح، يمكنك متابعة حالة الطلب من صفحة \"الطلبات\" في الملف الشخصي."
                : "Your custom car request has been sent successfully. You can track its status from the \"Requests\" page in your profile."}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button onClick={() => { handleClose(); router.push("/my-requests") }} className="flex-1">
              <ExternalLink className="w-4 h-4" />
              {locale === "ar" ? "عرض الطلبات" : "View Requests"}
            </Button>
            <Button onClick={handleClose} variant="outline" className="flex-1">
              {locale === "ar" ? "إغلاق" : "Close"}
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3 max-h-[70vh] sm:max-h-none overflow-y-auto -mx-2 sm:mx-0 px-2 sm:px-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input id="fullName" label={locale === "ar" ? "الاسم" : "Full Name"} value={profile?.full_name || profile?.name || ""} disabled />
            <Input id="phone" label={locale === "ar" ? "رقم الجوال" : "Phone"} value={profile?.phone_number || ""} disabled />
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-primary">{requiredLabelJSX(locale === "ar" ? "الدولة" : "Country")}</label>
              <select value={form.country} onChange={(e) => { setErrors(p => ({ ...p, country: "" })); updateField("country", e.target.value) }} className={`w-full rounded-xl border ${errors.country ? "border-error ring-2 ring-error/20" : "border-gray-200"} bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20`}>
                <option value="">{locale === "ar" ? "اختر الدولة" : "Select country"}</option>
                {gulfCountries.map((c) => (
                  <option key={c.code} value={c.code}>{locale === "ar" ? c.nameAr : c.nameEn}</option>
                ))}
              </select>
              {errors.country && <p className="text-xs text-error">{errors.country}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-primary">{requiredLabelJSX(locale === "ar" ? "المدينة" : "City")}</label>
              <select value={form.city} onChange={(e) => { setErrors(p => ({ ...p, city: "" })); updateField("city", e.target.value) }} disabled={!form.country} className={`w-full rounded-xl border ${errors.city ? "border-error ring-2 ring-error/20" : "border-gray-200"} bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20`}>
                <option value="">{locale === "ar" ? "اختر المدينة" : "Select city"}</option>
                {cities.map((c) => (
                  <option key={c.nameAr} value={c.nameAr}>{locale === "ar" ? c.nameAr : c.nameEn}</option>
                ))}
              </select>
              {errors.city && <p className="text-xs text-error">{errors.city}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-primary">{requiredLabelJSX(locale === "ar" ? "نوع السيارة" : "Car Type")}</label>
              <select value={form.carType} onChange={(e) => { setErrors(p => ({ ...p, carType: "" })); updateField("carType", e.target.value) }} className={`w-full rounded-xl border ${errors.carType ? "border-error ring-2 ring-error/20" : "border-gray-200"} bg-white px-4 py-3 text-sm outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20`}>
                <option value="">{locale === "ar" ? "اختر النوع" : "Select type"}</option>
                {carTypes.map((t) => (
                  <option key={t.id} value={t.id}>{locale === "ar" ? t.ar : t.en}</option>
                ))}
              </select>
              {errors.carType && <p className="text-xs text-error">{errors.carType}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-primary">{requiredLabelJSX(locale === "ar" ? "الماركة" : "Brand")}</label>
              <select value={form.brand} onChange={(e) => { setErrors(p => ({ ...p, brand: "" })); updateField("brand", e.target.value) }} className={`w-full rounded-xl border ${errors.brand ? "border-error ring-2 ring-error/20" : "border-gray-200"} bg-white px-4 py-3 text-sm outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20`}>
                <option value="">{locale === "ar" ? "اختر الماركة" : "Select brand"}</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>{b.label}</option>
                ))}
              </select>
              {errors.brand && <p className="text-xs text-error">{errors.brand}</p>}
            </div>
            {form.brand && brandModels[form.brand] ? (
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-primary">{requiredLabelJSX(locale === "ar" ? "الموديل" : "Model")}</label>
                <select value={form.model} onChange={(e) => { setErrors(p => ({ ...p, model: "" })); updateField("model", e.target.value) }} className={`w-full rounded-xl border ${errors.model ? "border-error ring-2 ring-error/20" : "border-gray-200"} bg-white px-4 py-3 text-sm outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20`}>
                  <option value="">{locale === "ar" ? "اختر الموديل" : "Select model"}</option>
                  {brandModels[form.brand].map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
                {errors.model && <p className="text-xs text-error">{errors.model}</p>}
              </div>
            ) : (
              <Input id="model" label={locale === "ar" ? "الموديل" : "Model"} value={form.model} onChange={(e) => updateField("model", e.target.value)} placeholder={locale === "ar" ? "اختياري" : "Optional"} />
            )}
            <Input id="pickupDate" label={requiredLabel(locale === "ar" ? "تاريخ الاستلام" : "Pickup Date")} type="date" value={form.pickupDate} onChange={(e) => { setErrors(p => ({ ...p, pickupDate: "" })); updateField("pickupDate", e.target.value) }} error={errors.pickupDate} />
            <Input id="returnDate" label={requiredLabel(locale === "ar" ? "تاريخ الإرجاع" : "Return Date")} type="date" value={form.returnDate} onChange={(e) => { setErrors(p => ({ ...p, returnDate: "" })); updateField("returnDate", e.target.value) }} error={errors.returnDate} />
            <Input id="budget" label={requiredLabel(locale === "ar" ? "الميزانية اليومية" : "Budget per Day")} type="number" value={form.budget} onChange={(e) => { setErrors(p => ({ ...p, budget: "" })); updateField("budget", e.target.value) }} placeholder={locale === "ar" ? "مثال: 50" : "e.g. 50"} error={errors.budget} />
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-primary">{locale === "ar" ? "ملاحظات إضافية" : "Additional Notes"}</label>
            <textarea value={form.notes} onChange={(e) => updateField("notes", e.target.value)} className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 min-h-[80px] resize-y" placeholder={locale === "ar" ? "أي متطلبات إضافية..." : "Any additional requirements..."} />
          </div>
          <div className="sticky bottom-0 bg-white pt-2 pb-1">
            <Button type="submit" disabled={sending} className="w-full">
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {locale === "ar" ? "إرسال الطلب" : "Send Request"}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  )
}
