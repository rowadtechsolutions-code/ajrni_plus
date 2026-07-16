"use client"

import { useState, useEffect, useRef } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Camera, Loader2, Save, CheckCircle2, AlertCircle, Upload, ImageIcon, LogOut, Building2, Shield, ChevronLeft, AlertTriangle } from "lucide-react"
import { useLocaleStore } from "@/store/useLocaleStore"
import { useAuthStore } from "@/store/useAuthStore"
import { useAuth } from "@/hooks/useAuth"
import { useTranslation } from "@/lib/i18n"
import { officeService, officeStorageService } from "@/lib/supabase/services"
import { useCountries, useCities } from "@/hooks/useLocations"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Modal } from "@/components/ui/modal"
import { cn, getPhoneConfig, stripPhoneDialCode, reconstructFullPhone } from "@/lib/utils"

export default function DashboardProfilePage() {
  const { locale } = useLocaleStore()
  const { t } = useTranslation(locale)
  const queryClient = useQueryClient()
  const { user } = useAuthStore()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const coverInputRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({
    office_name: "",
    email: "",
    phone_number: "",
    country: "",
    city: "",
    bio: "",
  })
  const [crNumber, setCrNumber] = useState("")
  const [uploadingImage, setUploadingImage] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null)
  const [existingImage, setExistingImage] = useState<string | null>(null)
  const [uploadingCover, setUploadingCover] = useState(false)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)
  const [uploadedCoverUrl, setUploadedCoverUrl] = useState<string | null>(null)
  const [existingCover, setExistingCover] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [successMsg, setSuccessMsg] = useState("")
  const [showMobileForm, setShowMobileForm] = useState(false)
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const { signOut } = useAuth()

  const { data: office, isLoading } = useQuery({
    queryKey: ["office-profile", user?.id],
    queryFn: () => officeService.getByUserId(user!.id),
    enabled: !!user?.id,
  })

  useEffect(() => {
    if (office) {
      const rawPhone = office.phone_number || ""
      const country = office.country || ""
      const config = country ? getPhoneConfig(country) : null
      setForm({
        office_name: office.office_name || "",
        email: office.email || "",
        phone_number: config ? stripPhoneDialCode(rawPhone, config.dialCode) : rawPhone,
        country: country,
        city: office.city || "",
        bio: office.bio || "",
      })
      setCrNumber(office.commercial_registration_number || "")
      setExistingImage(office.image || null)
      setExistingCover(office.cover || null)
    }
  }, [office])

  const { data: countries = [], isLoading: countriesLoading } = useCountries()
  const { data: cities = [], isLoading: citiesLoading } = useCities(form.country)
  const phoneConfig = form.country ? getPhoneConfig(form.country) : null

  const handleChange = (field: string, value: string) => {
    if (field === "phone_number" && phoneConfig) {
      const digits = value.replace(/[^\d]/g, "")
      const dialDigits = phoneConfig.dialCode.replace(/[^\d]/g, "")
      let local = digits
      if (local.startsWith("00" + dialDigits)) local = local.slice(2 + dialDigits.length)
      else if (local.startsWith(dialDigits)) local = local.slice(dialDigits.length)
      local = local.slice(0, phoneConfig.maxLength)
      value = local
    }
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
      const oldUrl = existingImage || uploadedImageUrl
      const url = await officeStorageService.uploadProfileImage(user.id, file, oldUrl)
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

  const handleCoverSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user?.id) return

    const allowed = ["image/jpeg", "image/png", "image/webp"]
    if (!allowed.includes(file.type)) {
      setErrors({ _form: locale === "ar" ? "الصيغة غير مدعومة. استخدم jpg, png أو webp" : "Unsupported format. Use jpg, png or webp" })
      return
    }

    const reader = new FileReader()
    reader.onload = () => setCoverPreview(reader.result as string)
    reader.readAsDataURL(file)

    setUploadingCover(true)
    setErrors((prev) => ({ ...prev, _form: "" }))

    try {
      const oldUrl = existingCover || uploadedCoverUrl
      const url = await officeStorageService.uploadCoverImage(user.id, file, oldUrl)
      setUploadedCoverUrl(url)
      setExistingCover(null)
    } catch (err: any) {
      setCoverPreview(null)
      setErrors({ _form: err.message || (locale === "ar" ? "فشل رفع صورة الغلاف" : "Cover upload failed") })
    } finally {
      setUploadingCover(false)
      if (coverInputRef.current) coverInputRef.current.value = ""
    }
  }

  const handleCancelCover = () => {
    setCoverPreview(null)
    setUploadedCoverUrl(null)
    if (coverInputRef.current) coverInputRef.current.value = ""
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
    if (!form.phone_number.trim())
      errs.phone_number = t("auth.phone_required")
    else if (phoneConfig) {
      const digits = form.phone_number.replace(/[^\d]/g, "")
      if (digits.length !== phoneConfig.maxLength)
        errs.phone_number = locale === "ar"
          ? `رقم الهاتف يجب أن يتكون من ${phoneConfig.maxLength} أرقام`
          : `Phone number must be ${phoneConfig.maxLength} digits`
    }
    if (!form.country)
      errs.country = locale === "ar" ? "الدولة مطلوبة" : "Country is required"
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error("Not authenticated")
      const finalImageUrl = uploadedImageUrl || existingImage
      const finalCoverUrl = uploadedCoverUrl || existingCover
      const phone = phoneConfig
        ? reconstructFullPhone(form.phone_number, phoneConfig.dialCode)
        : form.phone_number.trim()
      const updates: Record<string, any> = {
        office_name: form.office_name.trim(),
        phone_number: phone,
        country: form.country,
        city: form.city,
        bio: form.bio.trim(),
      }
      if (finalImageUrl) updates.image = finalImageUrl
      else updates.image = null
      if (finalCoverUrl) updates.cover = finalCoverUrl
      else updates.cover = null
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

      <div className="lg:hidden">
        {!showMobileForm ? (
          <div>
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 mb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl overflow-hidden shrink-0 border border-gray-100">
                  {office?.image ? (
                    <img src={office.image} alt="" className="w-full h-full object-cover" loading="lazy" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-secondary/20 to-blue-600/20 flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-secondary" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="font-bold text-primary text-lg leading-snug truncate">{office?.office_name || (locale === "ar" ? "المكتب" : "Office")}</h2>
                  <p className="text-sm text-muted-foreground truncate mt-0.5">{office?.email}</p>
                  <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full mt-1.5 ${office?.is_active ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                    {office?.is_active ? (locale === "ar" ? "نشط" : "Active") : (locale === "ar" ? "غير نشط" : "Inactive")}
                  </span>
                </div>
              </div>
            </div>

            <div className="mb-2 px-1">
              <h3 className="text-sm font-semibold text-muted-foreground">{locale === "ar" ? "الحساب" : "Account"}</h3>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden divide-y divide-gray-100">
              <button onClick={() => setShowMobileForm(true)} className="flex items-center justify-between w-full p-4 hover:bg-muted/50 transition-colors active:bg-muted/80 group">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center shrink-0 group-hover:bg-secondary/20 transition-colors">
                    <Building2 className="w-5 h-5 text-secondary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-primary">{locale === "ar" ? "تعديل بيانات المكتب" : "Edit Office Data"}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{locale === "ar" ? "تحديث معلومات المكتب" : "Update office information"}</p>
                  </div>
                </div>
                <ChevronLeft className="w-4 h-4 text-muted-foreground group-hover:-translate-x-0.5 transition-transform shrink-0" />
              </button>
            </div>

            <div className="mt-6 mb-2 px-1">
              <h3 className="text-sm font-semibold text-muted-foreground">{locale === "ar" ? "إعدادات الحساب" : "Account Settings"}</h3>
            </div>

            <button onClick={() => setShowLogoutModal(true)} className="w-full flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-200 shadow-sm hover:bg-red-50/50 transition-colors active:bg-red-50/80 group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-error/10 flex items-center justify-center shrink-0 group-hover:bg-error/20 transition-colors">
                  <LogOut className="w-5 h-5 text-error" />
                </div>
                <p className="text-sm font-medium text-error">{locale === "ar" ? "تسجيل الخروج" : "Logout"}</p>
              </div>
              <ChevronLeft className="w-4 h-4 text-error/60 group-hover:-translate-x-0.5 transition-transform shrink-0" />
            </button>
          </div>
        ) : (
          <button onClick={() => setShowMobileForm(false)} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-4">
            {locale === "ar" ? "العودة للحساب" : "Back to Account"}
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className={!showMobileForm ? 'hidden lg:block' : ''}>
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-6">
          <div className="border-b border-gray-100 pb-6">
            <h3 className="text-sm font-semibold text-primary mb-4">{locale === "ar" ? "صورة الغلاف" : "Cover Image"}</h3>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <div className="relative w-full sm:max-w-md h-28 sm:h-32 shrink-0 rounded-2xl overflow-hidden border border-gray-200 bg-muted">
                {(coverPreview || existingCover) ? (
                  <img src={coverPreview || existingCover!} alt="" className="w-full h-full object-cover" loading="lazy" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="w-8 h-8 text-muted-foreground" />
                  </div>
                )}
                {uploadingCover && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <Loader2 className="w-6 h-6 animate-spin text-white" />
                  </div>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <input ref={coverInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleCoverSelect} disabled={uploadingCover} />
                <Button type="button" variant="outline" size="sm" onClick={() => coverInputRef.current?.click()} disabled={uploadingCover}>
                  {uploadingCover ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> {locale === "ar" ? "جاري الرفع..." : "Uploading..."}</> : <><Upload className="w-3.5 h-3.5" /> {locale === "ar" ? "رفع غلاف" : "Upload cover"}</>}
                </Button>
                {(coverPreview || uploadedCoverUrl) && (
                  <Button type="button" variant="ghost" size="sm" onClick={handleCancelCover} disabled={uploadingCover}>
                    {locale === "ar" ? "إلغاء" : "Cancel"}
                  </Button>
                )}
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-primary mb-4">{locale === "ar" ? "صورة الملف الشخصي" : "Profile Image"}</h3>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 shrink-0">
                {currentImage ? (
                  <img src={currentImage} alt="" className="w-full h-full rounded-2xl object-cover border border-gray-200" loading="lazy" />
                ) : (
                  <div className="w-full h-full rounded-2xl bg-gradient-to-br from-secondary/20 to-secondary/5 flex items-center justify-center border border-gray-200">
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
              disabled
              className="bg-gray-50 text-muted-foreground cursor-not-allowed"
            />
            <div className="space-y-1.5">
              <label htmlFor="phone_number" className="block text-sm font-medium text-primary">
                {t("auth.phone")}
              </label>
              <div className="flex rounded-xl border border-gray-200 bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all overflow-hidden">
                {phoneConfig && (
                  <span dir="ltr" className="flex items-center px-3 text-sm text-muted-foreground bg-muted/50 border-l border-gray-200 shrink-0">
                    {phoneConfig.dialCode}
                  </span>
                )}
                <input
                  id="phone_number"
                  type="tel"
                  dir="ltr"
                  placeholder={phoneConfig ? phoneConfig.placeholder : (locale === "ar" ? "رقم الهاتف" : "Phone number")}
                  maxLength={20}
                  className="flex-1 px-4 py-3 text-sm outline-none border-0 bg-transparent min-w-0"
                  value={form.phone_number}
                  onChange={(e) => handleChange("phone_number", e.target.value)}
                />
              </div>
              {errors.phone_number && <p className="text-xs text-error mt-1">{errors.phone_number}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-primary">
                {locale === "ar" ? "الدولة" : "Country"}
              </label>
              <select
                dir={locale === "ar" ? "rtl" : "ltr"}
                className={cn(
                  "w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%222%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-[length:16px] bg-no-repeat",
                  locale === "ar" ? "pl-10" : "pr-10",
                  errors.country && "border-error",
                  countriesLoading && "opacity-60 cursor-not-allowed"
                )}
                style={{ backgroundPosition: locale === "ar" ? "left 12px center" : "right 12px center", textAlign: locale === "ar" ? "right" : "left" }}
                value={form.country}
                onChange={(e) => handleChange("country", e.target.value)}
                disabled={countriesLoading}
              >
                {countriesLoading ? (
                  <option value="">جاري التحميل...</option>
                ) : (
                  <option value="">
                    {locale === "ar" ? "اختر الدولة" : "Select country"}
                  </option>
                )}
                {!countriesLoading && countries.map((c) => (
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
                dir={locale === "ar" ? "rtl" : "ltr"}
                className={cn(
                  "w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%222%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-[length:16px] bg-no-repeat",
                  locale === "ar" ? "pl-10" : "pr-10",
                  citiesLoading && "opacity-60 cursor-not-allowed"
                )}
                style={{ backgroundPosition: locale === "ar" ? "left 12px center" : "right 12px center", textAlign: locale === "ar" ? "right" : "left" }}
                value={form.city}
                onChange={(e) => handleChange("city", e.target.value)}
                disabled={!form.country || citiesLoading}
              >
                {citiesLoading ? (
                  <option value="">جاري التحميل...</option>
                ) : (
                  <option value="">
                    {locale === "ar" ? "اختر المدينة" : "Select city"}
                  </option>
                )}
                {!citiesLoading && cities.map((c) => (
                  <option key={c.nameAr} value={c.nameAr}>
                    {locale === "ar" ? c.nameAr : c.nameEn}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-primary">
              {locale === "ar" ? "رقم السجل التجاري" : "Commercial Registration No."}
            </label>
            <div className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-muted-foreground cursor-not-allowed">
              {crNumber || "-"}
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

      <Modal open={showLogoutModal} onClose={() => setShowLogoutModal(false)}>
        <div className="text-center py-2">
          <div className="w-14 h-14 rounded-full bg-error/10 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-7 h-7 text-error" />
          </div>
          <p className="text-base font-semibold text-primary mb-1">
            {locale === "ar" ? "تسجيل الخروج" : "Log out"}
          </p>
          <p className="text-sm text-muted-foreground mb-6">
            {locale === "ar" ? "هل أنت متأكد من تسجيل الخروج؟" : "Are you sure you want to log out?"}
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <Button variant="outline" onClick={() => setShowLogoutModal(false)} className="w-full sm:w-auto">
              {locale === "ar" ? "إلغاء" : "Cancel"}
            </Button>
            <Button variant="danger" onClick={() => { setShowLogoutModal(false); signOut() }} className="w-full sm:w-auto">
              <LogOut className="w-4 h-4" />
              {locale === "ar" ? "تسجيل الخروج" : "Log out"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
