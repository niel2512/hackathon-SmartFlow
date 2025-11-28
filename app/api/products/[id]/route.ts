import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { validateProduct, validationErrorResponse } from "@/lib/validation"
import { handleApiError, createErrorResponse, ErrorCodes } from "@/lib/error-handler"
import { auditLog } from "@/lib/audit-log"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const product = db.getProduct(id)
    if (!product) {
      return createErrorResponse(404, ErrorCodes.NOT_FOUND, "Product not found")
    }
    return NextResponse.json(product, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
        Pragma: "no-cache",
        Expires: "0",
      },
    })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const updates = await request.json()

    if (Object.keys(updates).length > 0) {
      const validation = validateProduct({ ...db.getProduct(id), ...updates })
      if (!validation.valid) {
        return validationErrorResponse(validation.errors)
      }
    }

    const product = db.updateProduct(id, updates)
    if (!product) {
      return createErrorResponse(404, ErrorCodes.NOT_FOUND, "Product not found")
    }

    await auditLog.record({
      userId: "system",
      userEmail: "system@smartflow.local",
      action: "UPDATE_PRODUCT",
      entityType: "Product",
      entityId: id,
      changes: updates,
    })

    return NextResponse.json(product)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const product = db.getProduct(id)

    if (!product) {
      return createErrorResponse(404, ErrorCodes.NOT_FOUND, "Product not found")
    }

    db.deleteProduct(id)

    await auditLog.record({
      userId: "system",
      userEmail: "system@smartflow.local",
      action: "DELETE_PRODUCT",
      entityType: "Product",
      entityId: id,
      changes: { deleted: product },
    })

    return NextResponse.json({ success: true, message: "Product deleted successfully" })
  } catch (error) {
    return handleApiError(error)
  }
}
