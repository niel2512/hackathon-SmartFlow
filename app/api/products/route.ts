import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
  return NextResponse.json(db.getProducts())
}

export async function POST(request: NextRequest) {
  const product = await request.json()
  const newProduct = db.createProduct(product)
  return NextResponse.json(newProduct)
}
