"use client"

import { useState } from "react"
import { MessageCircle, Loader2, Send } from "lucide-react"
import { Modal } from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useLocaleStore } from "@/store/useLocaleStore"
import { useAuthStore } from "@/store/useAuthStore"
import { brands } from "@/lib/brands"
import { gulfCountries } from "@/lib/locations"
import { getClient } from "@/lib/supabase/client"

const WHATSAPP_NUMBER = "96876791559"

const carTypes = [
  { id: "sedan", labelAr: "سيدان", labelEn: "Sedan" },
  { id: "suv", labelAr: "دفع رباعي", labelEn: "SUV" },
  { id: "hatchback", labelAr: "هاتشباك", labelEn: "Hatchback" },
  { id: "coupe", labelAr: "كوبيه", labelEn: "Coupe" },
  { id: "convertible", labelAr: "مكشوف", labelEn: "Convertible" },
  { id: "pickup", labelAr: "بيك أب", labelEn: "Pickup" },
  { id: "van", labelAr: "فان", labelEn: "Van" },
  { id: "luxury", labelAr: "فاخرة", labelEn: "Luxury" },
  { id: "economy", labelAr: "اقتصادية", labelEn: "Economy" },
  { id: "other", labelAr: "أخرى", labelEn: "Other" },
]

interface CarRequestModalProps {
  open: boolean
  onClose: () => void
}

export function CarRequestModal({ open, onClose }: CarRequestModalProps) {
  const { locale } = useLocaleStore()
  const { user, profile } = useAuthStore()
  const [sending, setSending] = useState(false)

  const [form, setForm] = useState({
    carType: "",
    brand: "",
    model: "",
    year: "",
    budget: "",
    pickupCountry: "",
    pickupCity: "",
    rentalDuration: "",
    name: profile?.full_name || profile?.name || "",
    phone: profile?.phone_number || "",
    notes: "",
  })

  const cities = form.pickupCountry ? (gulfCountries.find((c) => c.code === form.pickupCountry)?.cities || []) : []

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (field === "pickupCountry") setForm((prev) => ({ ...prev, pickupCity: "" }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSending(true)

    const country = gulfCountries.find(c => c.code === form.pickupCountry)
    const pickupLocation = form.pickupCity
      ? `${form.pickupCity}${country ? `, ${locale === "ar" ? country.nameAr : country.nameEn}` : ""}`
      : form.pickupCountry || (locale === "ar" ? "غير محدد" : "Not specified")

    const carTypeLabel = carTypes.find((t) => t.id === form.carType)
    const brandLabel = brands.find((b) => b.id === form.brand)

    const message = locale === "ar"
      ? `🚗 طلب سيارة جديدة\n\n` +
        `نوع السيارة: ${carTypeLabel ? carTypeLabel.labelAr : form.carType || "غير محدد"}\n` +
        `العلامة التجارية: ${brandLabel ? brandLabel.label : form.brand || "غير محدد"}\n` +
        `الموديل: ${form.model || "غير محدد"}\n` +
        `السنة: ${form.year || "غير محدد"}\n` +
        `الميزانية اليومية: ${form.budget || "غير محدد"}\n` +
        `موقع الاستلام: ${pickupLocation}\n` +
        `مدة الإيجار: ${form.rentalDuration || "غير محدد"}\n` +
        `\n👤 الاسم: ${form.name || "غير محدد"}\n` +
        `📞 الجوال: ${form.phone || "غير محدد"}\n` +
        `${form.notes ? `\n📝 ملاحظات: ${form.notes}` : ""}\n` +
        `\nيرجى التواصل معي لتأكيد الطلب.`
      : `🚗 New Car Request\n\n` +
        `Car type: ${carTypeLabel ? carTypeLabel.labelEn : form.carType || "Not specified"}\n` +
        `Brand: ${brandLabel ? brandLabel.label : form.brand || "Not specified"}\n` +
        `Model: ${form.model || "Not specified"}\n` +
        `Year: ${form.year || "Not specified"}\n` +
        `Daily budget: ${form.budget || "Not specified"}\n` +
        `Pickup location: ${pickupLocation}\n` +
        `Rental duration: ${form.rentalDuration || "Not specified"}\n` +
        `\n👤 Name: ${form.name || "Not specified"}\n` +
        `📞 Phone: ${form.phone || "Not specified"}\n` +
        `${form.notes ? `\n📝 Notes: ${form.notes}` : ""}\n` +
        `\nPlease contact me to confirm the request.`

    const supabase = getClient()
    let query = supabase.from("Offices").select("phone_number").eq("is_active", true)
    if (form.pickupCountry) query = query.eq("country", form.pickupCountry)
    if (form.pickupCity) query = query.eq("city", form.pickupCity)
    const { data: offices } = await query

    const phones = offices?.map((o: any) => o.phone_number).filter(Boolean) as string[]
    if (phones.length === 0) phones.push(WHATSAPP_NUMBER)
    const encoded = encodeURIComponent(message)
    phones.forEach((phone, i) => {
      const clean = phone.replace(/[^\d]/g, "").replace(/^00/, "")
      setTimeout(() => window.open(`https://wa.me/${clean}?text=${encoded}`, "_blank"), i * 500)
    })

    setSending(false)
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title={locale === "ar" ? "طلب سيارة" : "Car Request"} className="max-w-lg">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-primary">{locale === "ar" ? "نوع السيارة" : "Car type"}</label>
            <select value={form.carType} onChange={(e) => updateField("carType", e.target.value)} className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20">
              <option value="">{locale === "ar" ? "اختر النوع" : "Select type"}</option>
              {carTypes.map((t) => (
                <option key={t.id} value={t.id}>{locale === "ar" ? t.labelAr : t.labelEn}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-primary">{locale === "ar" ? "العلامة التجارية" : "Brand"}</label>
            <select value={form.brand} onChange={(e) => updateField("brand", e.target.value)} className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20">
              <option value="">{locale === "ar" ? "اختر العلامة" : "Select brand"}</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>{b.label}</option>
              ))}
            </select>
          </div>
          <Input
            id="model"
            label={locale === "ar" ? "الموديل" : "Model"}
            value={form.model}
            onChange={(e) => updateField("model", e.target.value)}
            placeholder={locale === "ar" ? "مثال: كامري" : "e.g. Camry"}
          />
          <Input
            id="year"
            label={locale === "ar" ? "السنة" : "Year"}
            value={form.year}
            onChange={(e) => updateField("year", e.target.value)}
            placeholder="2024"
          />
          <Input
            id="budget"
            label={locale === "ar" ? "الميزانية اليومية" : "Daily budget"}
            value={form.budget}
            onChange={(e) => updateField("budget", e.target.value)}
            placeholder={locale === "ar" ? "مثال: 50 ر.ع." : "e.g. 130 SAR"}
          />
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-primary">{locale === "ar" ? "الدولة" : "Country"}</label>
            <select value={form.pickupCountry} onChange={(e) => updateField("pickupCountry", e.target.value)} className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20">
              <option value="">{locale === "ar" ? "اختر الدولة" : "Select country"}</option>
              {gulfCountries.map((c) => (
                <option key={c.code} value={c.code}>{locale === "ar" ? c.nameAr : c.nameEn}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-primary">{locale === "ar" ? "المدينة" : "City"}</label>
            <select value={form.pickupCity} onChange={(e) => updateField("pickupCity", e.target.value)} disabled={!form.pickupCountry} className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20">
              <option value="">{locale === "ar" ? "اختر المدينة" : "Select city"}</option>
              {cities.map((city) => (
                <option key={city.nameAr} value={city.nameAr}>{locale === "ar" ? city.nameAr : city.nameEn}</option>
              ))}
            </select>
          </div>
          <Input
            id="rentalDuration"
            label={locale === "ar" ? "مدة الإيجار" : "Rental duration"}
            value={form.rentalDuration}
            onChange={(e) => updateField("rentalDuration", e.target.value)}
            placeholder={locale === "ar" ? "مثال: 3 أيام" : "e.g. 3 days"}
          />
          <Input
            id="name"
            label={locale === "ar" ? "الاسم" : "Name"}
            value={form.name}
            onChange={(e) => updateField("name", e.target.value)}
            required
          />
          <Input
            id="phone"
            label={locale === "ar" ? "رقم الجوال" : "Phone"}
            type="tel"
            value={form.phone}
            onChange={(e) => updateField("phone", e.target.value)}
            required
          />
        </div>
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-primary">
            {locale === "ar" ? "ملاحظات إضافية" : "Additional notes"}
          </label>
          <textarea
            value={form.notes}
            onChange={(e) => updateField("notes", e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 min-h-[80px] resize-y"
            placeholder={locale === "ar" ? "أي متطلبات إضافية..." : "Any additional requirements..."}
          />
        </div>
        <Button type="submit" disabled={sending} className="w-full">
          {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          {locale === "ar" ? "إرسال الطلب عبر واتساب" : "Send request via WhatsApp"}
        </Button>
      </form>
    </Modal>
  )
}
