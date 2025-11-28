import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params
  const order = db.getOrder(id)
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 })
  }
  return NextResponse.json(order)
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params
  const updates = await request.json()
  const order = db.getOrder(id)

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 })
  }

  const lowStockAlerts: string[] = []

  if (updates.status === "Completed" && order.status !== "Completed") {
    for (const item of order.items) {
      const product = db.getProduct(item.productId)
      if (product) {
        const newStock = Math.max(0, product.stock - item.quantity)
        db.updateProduct(item.productId, { stock: newStock })

        if (newStock < product.minStock) {
          const alertMessage = `Low stock alert: ${product.name} (${newStock} units remaining)`
          db.addNotification({
            message: alertMessage,
            type: "Stock",
          })
          lowStockAlerts.push(alertMessage)
        }
      }
    }
    const updatedOrder = db.updateOrderStatus(id, updates.status)
    return NextResponse.json({
      ...updatedOrder,
      lowStockAlerts,
    })
  }

  if (updates.items || updates.customerName) {
    if (order.status !== "Pending") {
      return NextResponse.json({ error: "Cannot edit order - only pending orders can be edited" }, { status: 400 })
    }

    const updatedOrder = db.updateOrder(id, updates)
    return NextResponse.json(updatedOrder)
  }

  const updatedOrder = db.updateOrderStatus(id, updates.status)
  return NextResponse.json({
    ...updatedOrder,
    lowStockAlerts,
  })
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params
  const order = db.getOrder(id)

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 })
  }

  for (const item of order.items) {
    const product = db.getProduct(item.productId)
    if (product) {
      const newStock = product.stock + item.quantity
      db.updateProduct(item.productId, { stock: newStock })
    }
  }

  db.deleteOrder(id)
  return NextResponse.json({ success: true, message: "Order deleted and stock returned to inventory" })
}
