"use client"

import { useState, useRef, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Upload, X, ChevronLeft, ChevronRight, Check, Car, Settings, DollarSign, Image as ImageIcon } from "lucide-react"
import { useLocaleStore } from "@/store/useLocaleStore"
import { useAuthStore } from "@/store/useAuthStore"
import { carService, storageService } from "@/lib/supabase/services"
import { carStep1Schema, carStep2Schema, carStep3Schema, type CarStep1Data, type CarStep2Data, type CarStep3Data } from "@/lib/validations"
import { brands, brandModels } from "@/lib/brands"
import { Button } from "@/components/ui/button"
import type { CarType } from "@/types"

interface AddCarFormProps {
  officeId: string
  editingCar?: CarType | null
  onClose: () => void
}

const steps = [
  { icon: Car, key: "info", ar: "السيارة", en: "Car" },
  { icon: Settings, key: "specs", ar: "المواصفات", en: "Specs" },
  { icon: DollarSign, key: "pricing", ar: "السعر", en: "Pricing" },
  { icon: ImageIcon, key: "images", ar: "الصور", en: "Images" },
]

export function AddCarForm({ officeId, editingCar, onClose }: AddCarFormProps) {
  const { locale } = useLocaleStore()
  const { user } = useAuthStore()
  const queryClient = useQueryClient()
  const [step, setStep] = useState(0)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const step1 = useForm<CarStep1Data>({ resolver: zodResolver(carStep1Schema), defaultValues: { name: editingCar?.name || "", brand: editingCar?.brand || "", model: editingCar?.model || "" } })
  const step2 = useForm<CarStep2Data>({ resolver: zodResolver(carStep2Schema), defaultValues: { year: editingCar?.year?.toString() || "", color: editingCar?.color || "", transmission: editingCar?.transmission || "", fuel_type: editingCar?.fuel_type || "", seats: editingCar?.seats?.toString() || "", plate_number: editingCar?.plate_number || "" } })
  const step3 = useForm<CarStep3Data>({ resolver: zodResolver(carStep3Schema), defaultValues: { rental_type: "daily", price: editingCar?.price?.toString() || "", status: (editingCar?.status as any) || "available" } })

  useEffect(() => {
    if (editingCar) {
      step1.reset({ name: editingCar.name, brand: editingCar.brand || "", model: editingCar.model || "" })
      step2.reset({ year: editingCar.year?.toString() || "", color: editingCar.color || "", transmission: editingCar.transmission || "", fuel_type: editingCar.fuel_type || "", seats: editingCar.seats?.toString() || "", plate_number: editingCar.plate_number || "" })
      step3.reset({ rental_type: editingCar.rental_type as any || "daily", price: editingCar.price?.toString() || "", status: editingCar.status as any })
      if (editingCar.image) {
        setImagePreview(editingCar.image)
      }
    }
  }, [editingCar])

  const rentalType = step3.watch("rental_type")

  const createMutation = useMutation({
    mutationFn: async () => {
      const s1 = step1.getValues()
      const s2 = step2.getValues()
      const s3 = step3.getValues()
      const ownerId = user!.id

      let imageUrl: string | null = editingCar?.image || null
      if (imageFile) {
        const ext = imageFile.name.split(".").pop()
        const path = `${ownerId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
        try {
          imageUrl = await storageService.uploadCarImage(imageFile, path)
          setImagePreview(null)
          setImageFile(null)
        } catch (e: any) {
          throw new Error(e?.message || "فشل رفع الصورة")
        }
      }

      const price = s3.price

      const payload: Record<string, any> = {
        name: s1.name,
        brand: s1.brand,
        model: s1.model || null,
        year: Number(s2.year),
        color: s2.color || null,
        transmission: s2.transmission,
        fuel_type: s2.fuel_type,
        seats: Number(s2.seats),
        plate_number: s2.plate_number || null,
        rental_type: s3.rental_type,
        price: price,
        status: s3.status,
        is_active: true,
        image: imageUrl,
      }

      if (editingCar) {
        await carService.update(editingCar.id, payload)
      } else {
        payload.owner_id = ownerId
        payload.office_id = officeId
        await carService.create(payload)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-office-cars"] })
      onClose()
    },
    onError: (err: any) => {
      console.error("Add car error:", err)
      alert(err?.message || "فشلت إضافة السيارة")
    },
  })

  const validateStep = async () => {
    if (step === 0) return step1.trigger()
    if (step === 1) return step2.trigger()
    if (step === 2) return step3.trigger()
    return true
  }

  const next = async () => {
    const valid = await validateStep()
    if (valid) setStep((s) => Math.min(s + 1, 3))
  }

  const prev = () => setStep((s) => Math.max(s - 1, 0))

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const removeImage = () => {
    setImageFile(null)
    setImagePreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const selectedBrand = step1.watch("brand")

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        {steps.map((s, i) => (
          <div key={s.key} className="flex items-center gap-2">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold transition-all ${i < step ? "bg-success text-white" : i === step ? "bg-secondary text-white" : "bg-gray-100 text-muted-foreground"}`}>
              {i < step ? <Check className="w-4 h-4" /> : <s.icon className="w-4 h-4" />}
            </div>
            <span className={`hidden sm:inline text-xs font-medium ${i === step ? "text-primary" : "text-muted-foreground"}`}>
              {locale === "ar" ? s.ar : s.en}
            </span>
            {i < steps.length - 1 && <div className={`hidden sm:block w-8 h-0.5 mx-1 ${i < step ? "bg-success" : "bg-gray-200"}`} />}
          </div>
        ))}
      </div>

      {step === 0 && (
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-primary mb-1.5">{locale === "ar" ? "اسم السيارة" : "Car Name"}</label>
            <input className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all" placeholder={locale === "ar" ? "مثال: كامري 2024" : "e.g. Camry 2024"} {...step1.register("name")} />
            {step1.formState.errors.name && <p className="text-xs text-error mt-1">{step1.formState.errors.name.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-primary mb-2">{locale === "ar" ? "العلامة التجارية" : "Brand"}</label>
            {selectedBrand && (() => {
              const b = brands.find(x => x.id === selectedBrand)
              return b ? (
                <div className="flex items-center gap-2 mb-3 px-3 py-2 rounded-2xl bg-secondary/10 border border-secondary/30">
                  <img src={b.logo} alt={b.label} className="w-6 h-6 object-contain rounded" onError={(e) => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${b.label[0]}&background=${b.color.slice(1)}&color=fff&size=24` }} />
                  <span className="text-sm font-semibold text-secondary">{b.label}</span>
                </div>
              ) : null
            })()}
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-64 overflow-y-auto">
              {brands.map((b) => (
                <button key={b.id} type="button" onClick={() => step1.setValue("brand", b.id, { shouldValidate: true })} className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border transition-all ${selectedBrand === b.id ? "border-secondary bg-secondary/5 ring-2 ring-secondary/20" : "border-gray-200 bg-white hover:border-gray-300"}`}>
                  <img src={b.logo} alt={b.label} className="w-8 h-8 object-contain" onError={(e) => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${b.label[0]}&background=${b.color.slice(1)}&color=fff&size=32` }} />
                  <span className="text-[11px] font-medium text-muted-foreground truncate w-full text-center">{b.label}</span>
                </button>
              ))}
            </div>
            {step1.formState.errors.brand && <p className="text-xs text-error mt-1">{step1.formState.errors.brand.message}</p>}
          </div>
          {selectedBrand && brandModels[selectedBrand] && (
            <div>
              <label className="block text-sm font-medium text-primary mb-2">{locale === "ar" ? "الموديل" : "Model"}</label>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto">
                {brandModels[selectedBrand].map((m) => (
                  <button key={m} type="button" onClick={() => step1.setValue("model", m)} className={`py-2 px-3 rounded-2xl text-xs font-medium border transition-all ${step1.watch("model") === m ? "bg-secondary text-white border-secondary" : "bg-white text-muted-foreground border-gray-200 hover:border-secondary"}`}>
                    {m}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {step === 1 && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium text-primary mb-1.5">{locale === "ar" ? "سنة الصنع" : "Year"}</label>
              <input type="number" className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all" placeholder="2024" {...step2.register("year")} />
              {step2.formState.errors.year && <p className="text-xs text-error mt-1">{step2.formState.errors.year.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-primary mb-1.5">{locale === "ar" ? "اللون" : "Color"}</label>
              <input className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all" placeholder={locale === "ar" ? "أبيض" : "White"} {...step2.register("color")} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium text-primary mb-1.5">{locale === "ar" ? "القير" : "Transmission"}</label>
              <select className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all" {...step2.register("transmission")}>
                <option value="">{locale === "ar" ? "اختر" : "Select"}</option>
                <option value="AUTOMATIC">{locale === "ar" ? "أوتوماتيك" : "Automatic"}</option>
                <option value="MANUAL">{locale === "ar" ? "يدوي" : "Manual"}</option>
              </select>
              {step2.formState.errors.transmission && <p className="text-xs text-error mt-1">{step2.formState.errors.transmission.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-primary mb-1.5">{locale === "ar" ? "الوقود" : "Fuel Type"}</label>
              <select className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all" {...step2.register("fuel_type")}>
                <option value="">{locale === "ar" ? "اختر" : "Select"}</option>
                <option value="GASOLINE">{locale === "ar" ? "بنزين" : "Gasoline"}</option>
                <option value="DIESEL">{locale === "ar" ? "ديزل" : "Diesel"}</option>
                <option value="ELECTRIC">{locale === "ar" ? "كهرباء" : "Electric"}</option>
                <option value="HYBRID">{locale === "ar" ? "هايبرد" : "Hybrid"}</option>
              </select>
              {step2.formState.errors.fuel_type && <p className="text-xs text-error mt-1">{step2.formState.errors.fuel_type.message}</p>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium text-primary mb-1.5">{locale === "ar" ? "عدد المقاعد" : "Seats"}</label>
              <select className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all" {...step2.register("seats")}>
                <option value="">{locale === "ar" ? "اختر" : "Select"}</option>
                {[2, 3, 4, 5, 6, 7, 8].map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
              {step2.formState.errors.seats && <p className="text-xs text-error mt-1">{step2.formState.errors.seats.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-primary mb-1.5">{locale === "ar" ? "رقم اللوحة" : "Plate Number"}</label>
              <input className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all" placeholder={locale === "ar" ? "أ ب ج 1234" : "ABC 1234"} {...step2.register("plate_number")} />
            </div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-primary mb-3">{locale === "ar" ? "نوع الإيجار" : "Rental Type"}</label>
            <div className="flex gap-2">
              <button type="button" onClick={() => step3.setValue("rental_type", "daily")} className={`flex-1 py-3 px-4 rounded-2xl text-sm font-medium border transition-all ${rentalType === "daily" ? "bg-secondary text-white border-secondary" : "bg-white text-muted-foreground border-gray-200 hover:border-secondary"}`}>
                {locale === "ar" ? "يومي" : "Daily"}
              </button>
              <button type="button" onClick={() => step3.setValue("rental_type", "monthly")} className={`flex-1 py-3 px-4 rounded-2xl text-sm font-medium border transition-all ${rentalType === "monthly" ? "bg-secondary text-white border-secondary" : "bg-white text-muted-foreground border-gray-200 hover:border-secondary"}`}>
                {locale === "ar" ? "شهري" : "Monthly"}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-primary mb-1.5">
              {rentalType === "daily" ? (locale === "ar" ? "السعر في اليوم" : "Price per Day") : (locale === "ar" ? "السعر في الشهر" : "Price per Month")}
            </label>
            <input type="number" className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all" placeholder="0" {...step3.register("price")} />
            {step3.formState.errors.price && <p className="text-xs text-error mt-1">{step3.formState.errors.price.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-primary mb-1.5">{locale === "ar" ? "الحالة" : "Status"}</label>
            <div className="flex gap-2">
              {(["available", "rented", "maintenance"] as const).map((s) => (
                <button key={s} type="button" onClick={() => step3.setValue("status", s)} className={`flex-1 py-3 px-4 rounded-2xl text-sm font-medium border transition-all ${step3.watch("status") === s ? "bg-secondary text-white border-secondary" : "bg-white text-muted-foreground border-gray-200 hover:border-secondary"}`}>
                  {s === "available" ? (locale === "ar" ? "متاح" : "Available") : s === "rented" ? (locale === "ar" ? "مستأجر" : "Rented") : (locale === "ar" ? "صيانة" : "Maintenance")}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-primary mb-1.5">{locale === "ar" ? "صورة السيارة" : "Car Image"}</label>
            <button type="button" onClick={() => fileInputRef.current?.click()} className="w-full flex flex-col items-center gap-2 p-8 rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 text-muted-foreground hover:border-secondary hover:bg-secondary/5 transition-all cursor-pointer">
              <Upload className="w-8 h-8" />
              <span className="text-sm font-medium">{locale === "ar" ? "اختر صورة" : "Choose image"}</span>
              <span className="text-xs">{locale === "ar" ? "PNG, JPG" : "PNG, JPG"}</span>
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImage} />
            {imagePreview && (
              <div className="relative mt-3 aspect-video rounded-xl overflow-hidden border border-gray-200 group">
                <img src={imagePreview} alt="" className="w-full h-full object-cover" />
                <button type="button" onClick={removeImage} className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"><X className="w-4 h-4 text-white" /></button>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        {step > 0 ? (
          <button type="button" onClick={prev} className="flex items-center gap-1 px-4 py-2.5 rounded-2xl text-sm font-medium text-muted-foreground hover:bg-gray-100 transition-all">
            <ChevronRight className="w-4 h-4" />
            {locale === "ar" ? "السابق" : "Back"}
          </button>
        ) : <div />}
        {step < 3 ? (
          <button type="button" onClick={next} className="flex items-center gap-1 px-6 py-2.5 rounded-2xl bg-secondary text-white text-sm font-medium hover:bg-secondary/90 transition-all">
            {locale === "ar" ? "التالي" : "Next"}
            <ChevronLeft className="w-4 h-4" />
          </button>
        ) : (
          <Button onClick={() => createMutation.mutate()} loading={createMutation.isPending} className="px-6">
            {locale === "ar" ? (editingCar ? "حفظ التعديلات" : "إضافة السيارة") : editingCar ? "Save Changes" : "Add Car"}
          </Button>
        )}
      </div>
    </div>
  )
}
