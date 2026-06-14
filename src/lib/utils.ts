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

const countryDialCode: Record<string, string> = {
  SA: "966",
  AE: "971",
  QA: "974",
  KW: "965",
  BH: "973",
  OM: "968",
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

const WHATSAPP_BUSINESS_NUMBER = "96876791559"

export function buildWhatsAppReservationMessage(car: {
  id?: string | null
  name: string
  brand?: string | null
  model?: string | null
  year?: string | number | null
  price?: string | null
  rental_type?: string | null
  transmission?: string | null
  fuel_type?: string | null
  seats?: number | null
  color?: string | null
  plate_number?: string | null
  office?: { office_name?: string | null; country?: string | null; city?: string | null; phone_number?: string | null } | null
}, userPhone?: string) {
  const { amount, isMonthly } = formatCarPrice(car)
  const locale = "ar"
  const lines: string[] = []
  const carUrl = car.id ? `https://ajrni.com/cars/${car.id}` : null
  if (carUrl) lines.push(`🔗 ${locale === "ar" ? "رابط السيارة" : "Car link"}: ${carUrl}`)
  lines.push(`🚗 ${locale === "ar" ? "حجز سيارة" : "Car Reservation"}`)
  lines.push(``)
  lines.push(`📋 ${locale === "ar" ? "السيارة" : "Car"}: ${car.name}`)
  if (car.brand) lines.push(`🏭 ${locale === "ar" ? "الماركة" : "Brand"}: ${car.brand}`)
  if (car.model) lines.push(`📦 ${locale === "ar" ? "الموديل" : "Model"}: ${car.model}`)
  if (car.year) lines.push(`📅 ${locale === "ar" ? "السنة" : "Year"}: ${car.year}`)
  if (car.transmission) lines.push(`⚙️ ${locale === "ar" ? "القير" : "Transmission"}: ${car.transmission === "AUTOMATIC" ? "أوتوماتيك" : car.transmission === "MANUAL" ? "يدوي" : car.transmission}`)
  if (car.fuel_type) {
    const fuelMap: Record<string, string> = { GASOLINE: "بنزين", DIESEL: "ديزل", ELECTRIC: "كهرباء", HYBRID: "هايبرد" }
    lines.push(`⛽ ${locale === "ar" ? "الوقود" : "Fuel"}: ${fuelMap[car.fuel_type] || car.fuel_type}`)
  }
  if (car.seats) lines.push(`👥 ${locale === "ar" ? "المقاعد" : "Seats"}: ${car.seats}`)
  if (car.color) lines.push(`🎨 ${locale === "ar" ? "اللون" : "Color"}: ${car.color}`)
  if (car.plate_number) lines.push(`🔢 ${locale === "ar" ? "رقم اللوحة" : "Plate"}: ${car.plate_number}`)
  lines.push(`💰 ${locale === "ar" ? "السعر" : "Price"}: ${amount} ${isMonthly ? (locale === "ar" ? "/شهر" : "/month") : (locale === "ar" ? "/يوم" : "/day")}`)
  if (car.office?.office_name || car.office?.city || car.office?.country) {
    const loc = [car.office.city, car.office.country].filter(Boolean).join("، ")
    lines.push(`🏢 ${locale === "ar" ? "المكتب" : "Office"}: ${car.office.office_name || ""} ${loc ? `(${loc})` : ""}`)
  }
  lines.push(``)
  lines.push(locale === "ar" ? "أرغب في حجز هذه السيارة. يرجى التواصل معي." : "I would like to reserve this car. Please contact me.")
  if (userPhone) {
    lines.push(`📞 ${locale === "ar" ? "رقم الجوال" : "Phone"}: ${userPhone}`)
  } else {
    lines.push(`📞 ${locale === "ar" ? "رقم الجوال" : "Phone"}: [يرجى إدخال رقمك]`)
  }
  return encodeURIComponent(lines.join("\n"))
}

export function formatPhoneNumber(phone: string | null | undefined, country?: string | null): string {
  if (!phone) return WHATSAPP_BUSINESS_NUMBER
  const digits = phone.replace(/[^\d]/g, "").replace(/^00/, "")
  if (digits.length >= 10) return digits
  const dial = country ? countryDialCode[country] : null
  if (dial) return dial + digits
  return digits || WHATSAPP_BUSINESS_NUMBER
}

export function openWhatsAppReservation(car: {
  id?: string | null
  name: string
  brand?: string | null
  model?: string | null
  year?: string | number | null
  price?: string | null
  rental_type?: string | null
  transmission?: string | null
  fuel_type?: string | null
  seats?: number | null
  color?: string | null
  plate_number?: string | null
  office?: { office_name?: string | null; country?: string | null; city?: string | null; phone_number?: string | null } | null
}, userPhone?: string) {
  const message = buildWhatsAppReservationMessage(car, userPhone)
  const targetPhone = formatPhoneNumber(car?.office?.phone_number, car?.office?.country)
  const url = `https://wa.me/${targetPhone}?text=${message}`
  window.open(url, "_blank")
}
