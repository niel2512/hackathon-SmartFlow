import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { validateOrder, validationErrorResponse } from "@/lib/validation"
import { handleApiError, createErrorResponse, ErrorCodes } from "@/lib/error-handler"
import { auditLog } from "@/lib/audit-log"

export async function GET() {
  try {
    return NextResponse.json(await db.getOrders())
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const order = await request.json()

    const validation = validateOrder(order)
    if (!validation.valid) {
      return validationErrorResponse(validation.errors)
    }

    if (order.items && Array.isArray(order.items)) {
      for (const item of order.items) {
        const product = await db.getProduct(item.productId)
        if (!product) {
          return createErrorResponse(400, ErrorCodes.NOT_FOUND, `Product with ID ${item.productId} not found`)
        }
        if (item.quantity > product.stock) {
          return createErrorResponse(
            400,
            ErrorCodes.INSUFFICIENT_STOCK,
            `Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`,
          )
        }
      }
    }

    const newOrder = await db.createOrder(order)

    await auditLog.record({
      userId: "system",
      userEmail: "system@smartflow.local",
      action: "CREATE_ORDER",
      entityType: "Order",
      entityId: newOrder.id,
      changes: { created: newOrder },
    })

    return NextResponse.json(newOrder, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
