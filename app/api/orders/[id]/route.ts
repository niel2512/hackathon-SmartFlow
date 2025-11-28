import { type NextRequest, NextResponse } from "next/server"
import {
  getOrder,
  updateOrderStatus,
  deleteOrder,
  getProduct,
  updateProduct,
  addNotification,
} from "@/lib/supabase-service"
import { handleApiError, createErrorResponse, ErrorCodes } from "@/lib/error-handler"
import { auditLog } from "@/lib/audit-log"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const order = await getOrder(id)
    if (!order) {
      return createErrorResponse(404, ErrorCodes.NOT_FOUND, "Order not found")
    }
    return NextResponse.json(order)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const updates = await request.json()
    const order = await getOrder(id)

    if (!order) {
      return createErrorResponse(404, ErrorCodes.NOT_FOUND, "Order not found")
    }

    const lowStockAlerts: string[] = []

    if (updates.status === "Completed" && order.status !== "Completed") {
      for (const item of order.items) {
        const product = await getProduct(item.productId)
        if (product) {
          const newStock = Math.max(0, product.stock - item.quantity)
          await updateProduct(item.productId, { stock: newStock })

          if (newStock < product.minStock) {
            const alertMessage = `Low stock alert: ${product.name} (${newStock} units remaining)`
            await addNotification({
              message: alertMessage,
              type: "Stock",
            })
            lowStockAlerts.push(alertMessage)
          }
        }
      }
      const updatedOrder = await updateOrderStatus(id, updates.status)

      await auditLog.record({
        userId: "system",
        userEmail: "system@smartflow.local",
        action: "UPDATE_ORDER_STATUS",
        entityType: "Order",
        entityId: id,
        changes: { status: updates.status, previousStatus: order.status },
      })

      return NextResponse.json({
        ...updatedOrder,
        lowStockAlerts,
      })
    }

    const updatedOrder = await updateOrderStatus(id, updates.status)
    return NextResponse.json({
      ...updatedOrder,
      lowStockAlerts,
    })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const order = await getOrder(id)

    if (!order) {
      return createErrorResponse(404, ErrorCodes.NOT_FOUND, "Order not found")
    }

    for (const item of order.items) {
      const product = await getProduct(item.productId)
      if (product) {
        const newStock = product.stock + item.quantity
        await updateProduct(item.productId, { stock: newStock })
      }
    }

    await deleteOrder(id)

    await auditLog.record({
      userId: "system",
      userEmail: "system@smartflow.local",
      action: "DELETE_ORDER",
      entityType: "Order",
      entityId: id,
      changes: { deleted: order },
    })

    return NextResponse.json({ success: true, message: "Order deleted and stock returned to inventory" })
  } catch (error) {
    return handleApiError(error)
  }
}
