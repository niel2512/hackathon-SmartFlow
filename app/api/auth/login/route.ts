import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { generateToken } from "@/lib/auth"

export async function POST(request: NextRequest) {
  const { email, password } = await request.json()

  const user = db.getUser(email)
  if (!user || user.password !== password) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
  }

  const token = generateToken(user.id)
  return NextResponse.json({
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  })
}
