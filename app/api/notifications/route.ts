import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
  return NextResponse.json(db.getNotifications(), {
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
      Pragma: "no-cache",
      Expires: "0",
    },
  })
}
