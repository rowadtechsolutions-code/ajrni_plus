export type Role = "CUSTOMER" | "OFFICE" | "ADMIN"
export type OfficeStatus = "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED"
export type BookingStatus = "PENDING" | "ACCEPTED" | "REJECTED" | "CANCELLED" | "COMPLETED"
export type CarStatus = "AVAILABLE" | "BOOKED" | "MAINTENANCE" | "UNAVAILABLE"
export type Transmission = "AUTOMATIC" | "MANUAL"
export type FuelType = "GASOLINE" | "DIESEL" | "ELECTRIC" | "HYBRID"

export interface UserType {
  id: string
  name: string | null
  email: string
  image: string | null
  phone: string | null
  whatsapp: string | null
  role: Role
  locale: string
}

export interface OfficeType {
  id: string
  nameAr: string
  nameEn: string
  slug: string
  email: string
  phone: string
  whatsapp: string | null
  status: OfficeStatus
  logo: string | null
  coverImage: string | null
  descriptionAr: string | null
  descriptionEn: string | null
  country: string
  city: string
  address: string | null
  verified: boolean
  featured: boolean
  responseRate: number
  responseTime: number
  totalCars: number
  totalBookings: number
  rating: number
  views: number
}

export interface CarType {
  id: string
  titleAr: string
  titleEn: string
  slug: string
  brand: string
  model: string
  year: number
  pricePerDay: number
  currency: string
  seats: number
  transmission: Transmission
  fuelType: FuelType
  fuelCapacity: string | null
  mileage: string | null
  color: string | null
  descriptionAr: string | null
  descriptionEn: string | null
  images: string[]
  status: CarStatus
  featured: boolean
  availableNow: boolean
  airportDelivery: boolean
  withDriver: boolean
  insurance: boolean
  unlimitedMileage: boolean
  airConditioning: boolean
  gps: boolean
  bluetooth: boolean
  usbPort: boolean
  views: number
  country: string
  city: string
  pickupLocation: string | null
  office: OfficeType
  officeId: string
}

export interface BookingType {
  id: string
  customerName: string
  customerPhone: string
  customerWhatsapp: string | null
  pickupLocation: string | null
  startDate: string
  endDate: string
  message: string | null
  status: BookingStatus
  totalAmount: number | null
  officeNotes: string | null
  car: CarType
  customer: UserType
  office: OfficeType
}

export interface CarFilters {
  country?: string
  city?: string
  brand?: string
  model?: string
  minPrice?: number
  maxPrice?: number
  seats?: number
  transmission?: Transmission
  fuelType?: FuelType
  availableNow?: boolean
  airportDelivery?: boolean
  withDriver?: boolean
  sortBy?: string
}
