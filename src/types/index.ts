export type Role = "CUSTOMER" | "OFFICE" | "ADMIN"
export type CarStatus = "available" | "rented" | "maintenance"

export interface UserType {
  id: string
  created_at: string
  full_name: string | null
  email: string | null
  phone_number: string | null
  country: string | null
  city: string | null
}

export interface OfficeType {
  id: string
  created_at: string
  office_name: string | null
  email: string | null
  phone_number: string | null
  country: string | null
  city: string | null
  is_active: boolean | null
  bio: string | null
  image: string | null
  cover: string | null
  commercial_registration_number: string | null
}

export interface CarType {
  id: string
  created_at: string
  name: string
  brand: string | null
  model: string | null
  year: number | null
  color: string | null
  transmission: string | null
  fuel_type: string | null
  seats: number | null
  plate_number: string | null
  rental_type: string
  price: string | null
  status: string
  is_active: boolean
  owner_id: string
  office_id: string | null
  image: string | null
  images: string[]
  office: OfficeType | null
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
  car: CarType
  customer: UserType
  office: OfficeType
}

export type BookingStatus = "PENDING" | "ACCEPTED" | "REJECTED" | "CANCELLED" | "COMPLETED"
export type Transmission = "AUTOMATIC" | "MANUAL"
export type FuelType = "GASOLINE" | "DIESEL" | "ELECTRIC" | "HYBRID"

export interface CarFilters {
  brand?: string
  minPrice?: number
  maxPrice?: number
  seats?: number
  transmission?: string
  fuel_type?: string
  status?: string
  country?: string
  city?: string
}

export interface FavoriteType {
  id: string
  created_at: string
  user_id: string
  car_id: string
  car: CarType | null
}

export type BookingRequestStatus = "pending" | "viewed" | "completed" | "cancelled"

export interface BookingRequestType {
  id: string
  created_at: string
  user_id: string
  country: string | null
  city: string | null
  car_type: string | null
  brand: string | null
  model: string | null
  pickup_date: string | null
  return_date: string | null
  budget_per_day: number | null
  notes: string | null
  status: BookingRequestStatus
  full_name: string | null
  phone_number: string | null
  offices?: BookingRequestOfficeType[]
  offers?: BookingOfferType[]
}

export interface BookingRequestOfficeType {
  id: string
  request_id: string
  office_id: string
  status: string
  created_at: string
}

export interface BookingOfferType {
  id: string
  request_id: string
  office_id: string
  car_name: string | null
  car_model: string | null
  price_per_day: number | null
  total_price: number | null
  notes: string | null
  status: string
  created_at: string
}
