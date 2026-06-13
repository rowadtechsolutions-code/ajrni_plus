"use client"

import { useLocaleStore } from "@/store/useLocaleStore"
import { useTranslation } from "@/lib/i18n"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function DashboardProfilePage() {
  const { locale } = useLocaleStore()
  const { t } = useTranslation(locale)
  return (
    <div className="p-4 md:p-6 max-w-2xl">
      <h1 className="text-xl font-bold text-primary mb-6">{t("dashboard.profile")}</h1>
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center text-2xl font-bold text-muted-foreground">M</div>
            <div><Button variant="outline" size="sm">{locale === "ar" ? "تغيير الشعار" : "Change Logo"}</Button></div>
          </div>
          <Input id="nameAr" label={locale === "ar" ? "اسم المكتب (عربي)" : "Office Name (Arabic)"} defaultValue="مكتب الرياض" />
          <Input id="nameEn" label={locale === "ar" ? "اسم المكتب (إنجليزي)" : "Office Name (English)"} defaultValue="Riyadh Office" />
          <Input id="phone" label={t("booking.phone")} type="tel" defaultValue="+966 55 123 4567" />
          <Input id="country" label={t("auth.country")} defaultValue="السعودية" />
          <Input id="city" label={t("auth.city")} defaultValue="الرياض" />
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-primary">{locale === "ar" ? "وصف المكتب" : "Office Description"}</label>
            <textarea className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 min-h-[100px]" defaultValue="مكتب متخصص في تأجير السيارات في الرياض." />
          </div>
          <Button type="submit">{t("common.save")}</Button>
        </form>
      </div>
    </div>
  )
}
