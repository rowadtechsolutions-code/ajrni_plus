"use client"

import { useLocaleStore } from "@/store/useLocaleStore"
import { useTranslation } from "@/lib/i18n"
import { Badge } from "@/components/ui/badge"

const users = [
  { id: "1", name: "أحمد محمد", email: "ahmed@example.com", role: "CUSTOMER", joined: "2024-01-01" },
  { id: "2", name: "خالد العلي", email: "khalid@office.com", role: "OFFICE", joined: "2024-01-05" },
  { id: "3", name: "Admin", email: "admin@ajrni.com", role: "ADMIN", joined: "2024-01-01" },
]

export default function AdminUsersPage() {
  const { locale } = useLocaleStore()
  const { t } = useTranslation(locale)
  const roleLabels: Record<string, string> = { CUSTOMER: locale === "ar" ? "مستأجر" : "Customer", OFFICE: locale === "ar" ? "مكتب" : "Office", ADMIN: locale === "ar" ? "مدير" : "Admin" }

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-xl font-bold text-primary mb-6">{t("admin.users")}</h1>
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="text-right p-3 font-medium text-muted-foreground">{locale === "ar" ? "الاسم" : "Name"}</th>
              <th className="text-right p-3 font-medium text-muted-foreground">{t("auth.email")}</th>
              <th className="text-right p-3 font-medium text-muted-foreground">{locale === "ar" ? "الدور" : "Role"}</th>
              <th className="text-right p-3 font-medium text-muted-foreground">{locale === "ar" ? "تاريخ التسجيل" : "Joined"}</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-border hover:bg-muted/50">
                <td className="p-3 font-medium">{user.name}</td>
                <td className="p-3 text-muted-foreground">{user.email}</td>
                <td className="p-3"><Badge variant={user.role === "ADMIN" ? "info" : user.role === "OFFICE" ? "warning" : "default"}>{roleLabels[user.role]}</Badge></td>
                <td className="p-3 text-muted-foreground">{user.joined}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
