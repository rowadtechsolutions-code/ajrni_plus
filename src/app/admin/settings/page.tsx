"use client"

import { useLocaleStore } from "@/store/useLocaleStore"
import { useTranslation } from "@/lib/i18n"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function AdminSettingsPage() {
  const { locale } = useLocaleStore()
  const { t } = useTranslation(locale)
  return (
    <div className="p-4 md:p-6 max-w-2xl">
      <h1 className="text-xl font-bold text-primary mb-6">{t("admin.settings")}</h1>
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <h3 className="font-semibold text-primary mb-4">{locale === "ar" ? "إعدادات عامة" : "General Settings"}</h3>
        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <Input id="siteName" label={locale === "ar" ? "اسم الموقع" : "Site Name"} defaultValue="أجرني | Ajrni" />
          <Input id="siteEmail" label={locale === "ar" ? "البريد الإلكتروني" : "Site Email"} defaultValue="info@ajrni.com" />
          <Button type="submit">{t("common.save")}</Button>
        </form>
      </div>
    </div>
  )
}
