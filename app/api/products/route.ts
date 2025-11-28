import { type NextRequest, NextResponse } from "next/server"
import { getProducts, createProduct } from "@/lib/supabase-service"
import { validateProduct, validationErrorResponse } from "@/lib/validation"
import { handleApiError } from "@/lib/error-handler"
import { auditLog } from "@/lib/audit-log"

export async function GET() {
  try {
    const products = await getProducts()
    return NextResponse.json(products)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const product = await request.json()

    const validation = validateProduct(product)
    if (!validation.valid) {
      return validationErrorResponse(validation.errors)
    }

    const newProduct = await createProduct(product)

    await auditLog.record({
      userId: "system",
      userEmail: "system@smartflow.local",
      action: "CREATE_PRODUCT",
      entityType: "Product",
      entityId: newProduct.id,
      changes: { created: newProduct },
    })

    return NextResponse.json(newProduct, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
