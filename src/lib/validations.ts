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
  role: z.enum(["CUSTOMER", "OFFICE"]),
  officeName: z.string().optional(),
  country: z.string().optional(),
  city: z.string().optional(),
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
  titleAr: z.string().min(2, "عنوان السيارة بالعربية مطلوب"),
  titleEn: z.string().min(2, "عنوان السيارة بالإنجليزية مطلوب"),
  brand: z.string().min(1, "العلامة التجارية مطلوبة"),
  model: z.string().min(1, "الموديل مطلوب"),
  year: z.number().min(2000).max(2030),
  pricePerDay: z.number().positive("السعر يجب أن يكون أكبر من صفر"),
  seats: z.number().min(1).max(50),
  transmission: z.enum(["AUTOMATIC", "MANUAL"]),
  fuelType: z.enum(["GASOLINE", "DIESEL", "ELECTRIC", "HYBRID"]),
  color: z.string().optional(),
  descriptionAr: z.string().optional(),
  descriptionEn: z.string().optional(),
  airportDelivery: z.boolean().optional(),
  withDriver: z.boolean().optional(),
  country: z.string().min(1, "الدولة مطلوبة"),
  city: z.string().min(1, "المدينة مطلوبة"),
})

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
