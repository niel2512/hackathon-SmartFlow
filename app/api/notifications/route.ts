import { NextResponse } from "next/server"
import { getNotifications } from "@/lib/supabase-service"

export async function GET() {
  try {
    const notifications = await getNotifications()
    return NextResponse.json(notifications)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 })
  }
}
