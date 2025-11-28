import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
  return NextResponse.json(db.getOrders())
}

export async function POST(request: NextRequest) {
  const order = await request.json()

  if (order.items && Array.isArray(order.items)) {
    for (const item of order.items) {
      const product = db.getProduct(item.productId)
      if (!product) {
        return NextResponse.json({ error: `Product with ID ${item.productId} not found` }, { status: 400 })
      }
      if (item.quantity > product.stock) {
        return NextResponse.json(
          { error: `Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}` },
          { status: 400 },
        )
      }
    }
  }

  const newOrder = db.createOrder(order)
  return NextResponse.json(newOrder)
}
