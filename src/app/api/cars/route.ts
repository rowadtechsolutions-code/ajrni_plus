import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

export async function GET(req: Request) {
  const supabase = getSupabase()
  const url = new URL(req.url)
  const officeId = url.searchParams.get("officeId")
  const country = url.searchParams.get("country")

  let query = supabase.from("cars").select("*")
  if (officeId) query = query.eq("office_id", officeId)
  query = query.order("created_at", { ascending: false })

  const { data: cars, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  let result: any[] = cars || []
  result = result.filter((c: any) => c.is_active !== false)

  if (result.length > 0) {
    const officeIds = [...new Set(result.map((c: any) => c.office_id).filter(Boolean))]
    const { data: offices } = await supabase.from("Offices").select("*").in("id", officeIds)
    const officeMap = Object.fromEntries((offices || []).map((o: any) => [o.id, o]))
    result = result.map((c: any) => ({ ...c, office: officeMap[c.office_id] || null }))
  }

  if (country) result = result.filter((c: any) => c.office?.country === country)

  return NextResponse.json(result)
}
