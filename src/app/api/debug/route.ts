import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET() {
  const officeId = "04290972-ad52-4b54-a240-19e1da65d8d8"

  const testCar = {
    name: "اختبار",
    brand: "Toyota",
    model: "Camry",
    year: 2024,
    color: "أبيض",
    transmission: "AUTOMATIC",
    fuel_type: "GASOLINE",
    seats: 5,
    plate_number: "TEST" + Date.now(),
    rental_type: "daily",
    price: "50",
    status: "available",
    is_active: true,
    office_id: officeId,
    owner_id: officeId,
  }

  const { data, error } = await supabase.from("cars").insert(testCar).select()

  return NextResponse.json({
    inserted: data,
    error: error ? { message: error.message, details: error.details, hint: error.hint, code: error.code } : null,
  })
}
