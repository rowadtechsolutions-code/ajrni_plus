"use client"

import { useState, useEffect, useRef } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Camera, Loader2, Save, CheckCircle2, AlertCircle, Upload } from "lucide-react"
import { useLocaleStore } from "@/store/useLocaleStore"
import { useAuthStore } from "@/store/useAuthStore"
import { useTranslation } from "@/lib/i18n"
import { officeService, officeStorageService } from "@/lib/supabase/services"
import { gulfCountries, getCitiesByCountryCode } from "@/lib/locations"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export default function DashboardProfilePage() {
  const { locale } = useLocaleStore()
  const { t } = useTranslation(locale)
  const queryClient = useQueryClient()
  const { user } = useAuthStore()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({
    office_name: "",
    email: "",
    phone_number: "",
    country: "",
    city: "",
    bio: "",
  })
  const [uploadingImage, setUploadingImage] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null)
  const [existingImage, setExistingImage] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [successMsg, setSuccessMsg] = useState("")

  const { data: office, isLoading } = useQuery({
    queryKey: ["office-profile", user?.id],
    queryFn: () => officeService.getByUserId(user!.id),
    enabled: !!user?.id,
  })

  useEffect(() => {
    if (office) {
      setForm({
        office_name: office.office_name || "",
        email: office.email || "",
        phone_number: office.phone_number || "",
        country: office.country || "",
        city: office.city || "",
        bio: office.bio || "",
      })
      setExistingImage(office.image || null)
    }
  }, [office])

  const cities = form.country ? getCitiesByCountryCode(form.country) : []

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: "" }))
    if (field === "country") setForm((prev) => ({ ...prev, city: "" }))
  }

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user?.id) return

    const allowed = ["image/jpeg", "image/png", "image/webp"]
    if (!allowed.includes(file.type)) {
      setErrors({ _form: locale === "ar" ? "الصيغة غير مدعومة. استخدم jpg, png أو webp" : "Unsupported format. Use jpg, png or webp" })
      return
    }

    const reader = new FileReader()
    reader.onload = () => setImagePreview(reader.result as string)
    reader.readAsDataURL(file)

    setUploadingImage(true)
    setErrors((prev) => ({ ...prev, _form: "" }))

    try {
      const url = await officeStorageService.uploadProfileImage(user.id, file, existingImage)
      setUploadedImageUrl(url)
      setExistingImage(null)
    } catch (err: any) {
      setImagePreview(null)
      setErrors({ _form: err.message || (locale === "ar" ? "فشل رفع الصورة" : "Image upload failed") })
    } finally {
      setUploadingImage(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  const handleCancelImage = () => {
    setImagePreview(null)
    setUploadedImageUrl(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const validate = (): boolean => {
    const errs: Record<string, string> = {}
    if (!form.office_name.trim())
      errs.office_name = locale === "ar" ? "اسم المكتب مطلوب" : "Office name is required"
    if (!form.email.trim())
      errs.email = locale === "ar" ? "البريد الإلكتروني مطلوب" : "Email is required"
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = locale === "ar" ? "بريد إلكتروني غير صالح" : "Invalid email"
    if (!form.phone_number.trim())
      errs.phone_number = locale === "ar" ? "رقم الهاتف مطلوب" : "Phone number is required"
    if (!form.country)
      errs.country = locale === "ar" ? "الدولة مطلوبة" : "Country is required"
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error("Not authenticated")
      const finalImageUrl = uploadedImageUrl || existingImage
      const updates: Record<string, any> = {
        office_name: form.office_name.trim(),
        email: form.email.trim(),
        phone_number: form.phone_number.trim(),
        country: form.country,
        city: form.city,
        bio: form.bio.trim(),
      }
      if (finalImageUrl) updates.image = finalImageUrl
      else updates.image = null
      return officeService.updateProfile(user.id, updates)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["office-profile"] })
      setSuccessMsg(
        locale === "ar"
          ? "تم تحديث الملف الشخصي بنجاح"
          : "Profile updated successfully"
      )
      setTimeout(() => setSuccessMsg(""), 4000)
    },
    onError: (err: Error) => {
      setErrors({
        _form:
          err.message ||
          (locale === "ar"
            ? "حدث خطأ أثناء الحفظ"
            : "An error occurred while saving"),
      })
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSuccessMsg("")
    if (!validate()) return
    updateMutation.mutate()
  }

  const currentImage = imagePreview || existingImage

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-secondary" />
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto">
      <h1 className="text-xl font-bold text-primary mb-6">
        {locale === "ar" ? "الملف الشخصي" : "Profile"}
      </h1>

      {successMsg && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-6 text-sm">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          {successMsg}
        </div>
      )}

      {errors._form && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {errors._form}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-6">
          <div className="flex items-center gap-5">
            <div className="relative w-24 h-24 shrink-0">
              {currentImage ? (
                <img
                  src={currentImage}
                  alt=""
                  className="w-24 h-24 rounded-2xl object-cover border border-gray-200"
                />
              ) : (
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-secondary/20 to-secondary/5 flex items-center justify-center border border-gray-200">
                  <Camera className="w-8 h-8 text-muted-foreground" />
                </div>
              )}
              {uploadingImage && (
                <div className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-white" />
                </div>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleImageSelect}
                disabled={uploadingImage}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingImage}
              >
                {uploadingImage ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    {locale === "ar" ? "جاري الرفع..." : "Uploading..."}
                  </>
                ) : currentImage ? (
                  <>
                    <Upload className="w-3.5 h-3.5" />
                    {locale === "ar" ? "تغيير الصورة" : "Change image"}
                  </>
                ) : (
                  <>
                    <Upload className="w-3.5 h-3.5" />
                    {locale === "ar" ? "رفع صورة" : "Upload image"}
                  </>
                )}
              </Button>
              {(imagePreview || uploadedImageUrl) && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleCancelImage}
                  disabled={uploadingImage}
                >
                  {locale === "ar" ? "إلغاء" : "Cancel"}
                </Button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              id="office_name"
              label={locale === "ar" ? "اسم المكتب" : "Office name"}
              value={form.office_name}
              onChange={(e) => handleChange("office_name", e.target.value)}
              error={errors.office_name}
            />
            <Input
              id="email"
              label={locale === "ar" ? "البريد الإلكتروني" : "Email"}
              type="email"
              value={form.email}
              onChange={(e) => handleChange("email", e.target.value)}
              error={errors.email}
            />
            <Input
              id="phone_number"
              label={locale === "ar" ? "رقم الهاتف" : "Phone number"}
              type="tel"
              value={form.phone_number}
              onChange={(e) => handleChange("phone_number", e.target.value)}
              error={errors.phone_number}
            />
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-primary">
                {locale === "ar" ? "الدولة" : "Country"}
              </label>
              <select
                className={cn(
                  "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20",
                  errors.country && "border-error"
                )}
                value={form.country}
                onChange={(e) => handleChange("country", e.target.value)}
              >
                <option value="">
                  {locale === "ar" ? "اختر الدولة" : "Select country"}
                </option>
                {gulfCountries.map((c) => (
                  <option key={c.code} value={c.code}>
                    {locale === "ar" ? c.nameAr : c.nameEn}
                  </option>
                ))}
              </select>
              {errors.country && (
                <p className="text-xs text-error mt-1">{errors.country}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-primary">
                {locale === "ar" ? "المدينة" : "City"}
              </label>
              <select
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                value={form.city}
                onChange={(e) => handleChange("city", e.target.value)}
                disabled={!form.country}
              >
                <option value="">
                  {locale === "ar" ? "اختر المدينة" : "Select city"}
                </option>
                {cities.map((c) => (
                  <option key={c.nameAr} value={c.nameAr}>
                    {locale === "ar" ? c.nameAr : c.nameEn}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-primary">
              {locale === "ar" ? "نبذة عن المكتب" : "Bio"}
            </label>
            <textarea
              value={form.bio}
              onChange={(e) => handleChange("bio", e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 min-h-[120px] resize-y"
              placeholder={
                locale === "ar"
                  ? "اكتب نبذة عن مكتبك..."
                  : "Write a brief about your office..."
              }
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Button
              type="submit"
              disabled={updateMutation.isPending || uploadingImage}
              className="min-w-[140px]"
            >
              {updateMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {locale === "ar" ? "حفظ التعديلات" : "Save changes"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
