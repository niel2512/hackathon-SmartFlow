import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { generateToken } from "@/lib/auth"

export async function POST(request: NextRequest) {
  const { name, email, password, role } = await request.json()

  const existing = await db.getUser(email)
  if (existing) {
    return NextResponse.json({ error: "Email already exists" }, { status: 400 })
  }

  const user = await db.createUser({ name, email, password, role })
  const token = generateToken(user.id)

  return NextResponse.json({
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  })
}
