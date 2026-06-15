import { z } from "zod"

export const loginSchema = z.object({
  email: z.string().email("البريد الإلكتروني غير صحيح"),
  password: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
})

export const registerSchema = z.object({
  name: z.string().optional(),
  email: z.string().email("البريد الإلكتروني غير صحيح"),
  phone: z.string().min(7, "رقم الهاتف غير صحيح"),
  password: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
  confirmPassword: z.string().optional(),
  role: z.enum(["CUSTOMER", "OFFICE"]),
  officeName: z.string().optional(),
  commercialRegistrationNumber: z.string().optional(),
  country: z.string().optional(),
  city: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.password !== data.confirmPassword) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "كلمة المرور غير متطابقة", path: ["confirmPassword"] })
  }
  if (data.role === "CUSTOMER") {
    if (!data.name?.trim()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "الاسم مطلوب", path: ["name"] })
    }
    if (!data.country) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "الدولة مطلوبة", path: ["country"] })
    }
    if (data.country && !data.city) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "المدينة مطلوبة", path: ["city"] })
    }
  }
  if (data.role === "OFFICE") {
    if (!data.officeName?.trim()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "اسم المكتب مطلوب", path: ["officeName"] })
    }
    if (!data.commercialRegistrationNumber?.trim()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "رقم السجل التجاري مطلوب", path: ["commercialRegistrationNumber"] })
    }
    if (!data.country) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "الدولة مطلوبة", path: ["country"] })
    }
    if (!data.city) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "المدينة مطلوبة", path: ["city"] })
    }
  }
})

export const officeRegisterSchema = z.object({
  nameAr: z.string().min(2, "اسم المكتب بالعربية مطلوب"),
  nameEn: z.string().min(2, "اسم المكتب بالإنجليزية مطلوب"),
  email: z.string().email("البريد الإلكتروني غير صحيح"),
  phone: z.string().min(7, "رقم الهاتف غير صحيح"),
  whatsapp: z.string().optional(),
  password: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
  country: z.string().min(1, "الدولة مطلوبة"),
  city: z.string().min(1, "المدينة مطلوبة"),
  descriptionAr: z.string().optional(),
  descriptionEn: z.string().optional(),
})

export const carSchema = z.object({
  name: z.string().min(2, "اسم السيارة مطلوب"),
  brand: z.string().min(1, "اختر العلامة التجارية"),
  model: z.string().min(1, "الموديل مطلوب"),
  year: z.string().min(1, "سنة الصنع مطلوبة"),
  color: z.string().optional(),
  transmission: z.string().min(1, "اختر نوع القير"),
  fuel_type: z.string().min(1, "اختر نوع الوقود"),
  seats: z.string().min(1, "عدد المقاعد مطلوب"),
  price_per_day: z.string().min(1, "السعر اليومي مطلوب"),
  status: z.enum(["available", "rented", "maintenance"]),
})

export const carStep1Schema = z.object({ name: z.string().min(2, "اسم السيارة مطلوب"), brand: z.string().min(1, "اختر العلامة التجارية"), model: z.string().optional() })
export const carStep2Schema = z.object({ year: z.string().min(1, "سنة الصنع مطلوبة"), color: z.string().optional(), transmission: z.string().min(1, "اختر نوع القير"), fuel_type: z.string().min(1, "اختر نوع الوقود"), seats: z.string().min(1, "عدد المقاعد مطلوب"), plate_number: z.string().optional() })
export const carStep3Schema = z.object({ rental_type: z.enum(["daily", "monthly"]), price: z.string().min(1, "السعر مطلوب"), status: z.enum(["available", "rented", "maintenance"]) })

export type CarStep1Data = z.infer<typeof carStep1Schema>
export type CarStep2Data = z.infer<typeof carStep2Schema>
export type CarStep3Data = z.infer<typeof carStep3Schema>

export const bookingSchema = z.object({
  carId: z.string(),
  customerName: z.string().min(2, "الاسم مطلوب"),
  customerPhone: z.string().min(7, "رقم الهاتف مطلوب"),
  customerWhatsapp: z.string().optional(),
  pickupLocation: z.string().optional(),
  startDate: z.string().min(1, "تاريخ البداية مطلوب"),
  endDate: z.string().min(1, "تاريخ النهاية مطلوب"),
  message: z.string().optional(),
})

export type LoginFormData = z.infer<typeof loginSchema>
export type RegisterFormData = z.infer<typeof registerSchema>
export type OfficeRegisterFormData = z.infer<typeof officeRegisterSchema>
export type CarFormData = z.infer<typeof carSchema>
export type BookingFormData = z.infer<typeof bookingSchema>
