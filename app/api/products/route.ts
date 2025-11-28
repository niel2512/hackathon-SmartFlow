import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { validateProduct, validationErrorResponse } from "@/lib/validation"
import { handleApiError } from "@/lib/error-handler"
import { auditLog } from "@/lib/audit-log"

export async function GET() {
  try {
    const products = db.getProducts()
    return NextResponse.json(products, {
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

export async function POST(request: NextRequest) {
  try {
    const product = await request.json()

    const validation = validateProduct(product)
    if (!validation.valid) {
      return validationErrorResponse(validation.errors)
    }

    const newProduct = db.createProduct(product)

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
