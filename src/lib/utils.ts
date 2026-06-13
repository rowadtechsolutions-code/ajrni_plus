import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const countryCurrency: Record<string, { code: string; symbol: string; nameAr: string }> = {
  OM: { code: "OMR", symbol: "ر.ع.", nameAr: "ريال عماني" },
  SA: { code: "SAR", symbol: "ر.س.", nameAr: "ريال سعودي" },
  AE: { code: "AED", symbol: "د.إ.", nameAr: "درهم إماراتي" },
  QA: { code: "QAR", symbol: "ر.ق.", nameAr: "ريال قطري" },
  KW: { code: "KWD", symbol: "د.ك.", nameAr: "دينار كويتي" },
  BH: { code: "BHD", symbol: "د.ب.", nameAr: "دينار بحريني" },
}

export function getCurrencyByCountry(country: string | null | undefined) {
  if (country && countryCurrency[country]) return countryCurrency[country]
  return { code: "SAR", symbol: "ر.س.", nameAr: "ريال سعودي" }
}

export function formatCurrency(amount: number, currency = "SAR") {
  return new Intl.NumberFormat("ar-SA", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
  }).format(amount)
}

export function formatCarPrice(car: { price?: string | null; rental_type?: string | null; office?: { country?: string | null } | null }) {
  const cur = getCurrencyByCountry(car.office?.country)
  const amount = Number(car.price || 0)
  const formatted = formatCurrency(amount, cur.code)
  return { amount: formatted, isMonthly: car.rental_type === "monthly", currency: cur }
}

export function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export function getImageUrl(path: string | null | undefined) {
  if (!path) return "/placeholder.svg"
  if (path.startsWith("http")) return path
  return path
}

export function truncate(text: string, length = 100) {
  if (text.length <= length) return text
  return text.slice(0, length) + "..."
}

export function daysBetween(start: Date, end: Date) {
  const diff = end.getTime() - start.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

export function getInitials(name: string | null) {
  if (!name) return "?"
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

export function formatDate(date: string | Date, locale = "ar") {
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-SA" : "en-US", {
    dateStyle: "medium",
  }).format(new Date(date))
}

const WHATSAPP_BUSINESS_NUMBER = "96876972871"

export function buildWhatsAppReservationMessage(car: { name: string; brand?: string | null; model?: string | null; year?: string | number | null; price?: string | null; rental_type?: string | null; office?: { country?: string | null } | null }, userPhone?: string) {
  const { amount, isMonthly, currency } = formatCarPrice(car)
  const locale = userPhone ? "ar" : "ar"
  const carInfo = `${car.name} (${car.brand || ""} ${car.model || ""} ${car.year || ""})`.trim()
  const priceInfo = `${amount} ${isMonthly ? (locale === "ar" ? "/شهر" : "/month") : (locale === "ar" ? "/يوم" : "/day")}`

  let message = `🚗 ${locale === "ar" ? "حجز سيارة" : "Car Reservation"}\n\n`
  message += `📋 ${locale === "ar" ? "السيارة" : "Car"}: ${carInfo}\n`
  message += `💰 ${locale === "ar" ? "السعر" : "Price"}: ${priceInfo}\n\n`
  message += `${locale === "ar" ? "أرغب في حجز هذه السيارة. يرجى التواصل معي." : "I would like to reserve this car. Please contact me."}`

  if (userPhone) {
    message += `\n📞 ${locale === "ar" ? "رقم الجوال" : "Phone"}: ${userPhone}`
  } else {
    message += `\n📞 ${locale === "ar" ? "رقم الجوال" : "Phone"}: [يرجى إدخال رقمك]`
  }

  return encodeURIComponent(message)
}

export function openWhatsAppReservation(car: { name: string; brand?: string | null; model?: string | null; year?: string | number | null; price?: string | null; rental_type?: string | null; office?: { country?: string | null } | null }, userPhone?: string) {
  const message = buildWhatsAppReservationMessage(car, userPhone)
  const url = `https://wa.me/${WHATSAPP_BUSINESS_NUMBER}?text=${message}`
  window.open(url, "_blank")
}
