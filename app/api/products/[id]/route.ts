import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const product = db.getProduct(id)
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 })
  }
  return NextResponse.json(product)
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const updates = await request.json()
  const product = db.updateProduct(id, updates)
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 })
  }
  return NextResponse.json(product)
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  db.deleteProduct(id)
  return NextResponse.json({ success: true })
}
