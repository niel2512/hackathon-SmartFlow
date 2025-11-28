import { type NextRequest, NextResponse } from "next/server"
import { getProduct, updateProduct, deleteProduct } from "@/lib/supabase-service"
import { validateProduct, validationErrorResponse } from "@/lib/validation"
import { handleApiError, createErrorResponse, ErrorCodes } from "@/lib/error-handler"
import { auditLog } from "@/lib/audit-log"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const product = await getProduct(id)
    if (!product) {
      return createErrorResponse(404, ErrorCodes.NOT_FOUND, "Product not found")
    }
    return NextResponse.json(product)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const updates = await request.json()

    const existingProduct = await getProduct(id)
    if (!existingProduct) {
      return createErrorResponse(404, ErrorCodes.NOT_FOUND, "Product not found")
    }

    if (Object.keys(updates).length > 0) {
      const validation = validateProduct({ ...existingProduct, ...updates })
      if (!validation.valid) {
        return validationErrorResponse(validation.errors)
      }
    }

    const product = await updateProduct(id, updates)

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

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const product = await getProduct(id)

    if (!product) {
      return createErrorResponse(404, ErrorCodes.NOT_FOUND, "Product not found")
    }

    await deleteProduct(id)

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
