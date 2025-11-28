// Admin database management endpoints
import { type NextRequest, NextResponse } from "next/server"
import { databaseUtils } from "@/lib/database-utils"
import { handleApiError, createErrorResponse, ErrorCodes } from "@/lib/error-handler"
import { auditLog } from "@/lib/audit-log"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const action = searchParams.get("action")

    switch (action) {
      case "health":
        return NextResponse.json(databaseUtils.healthCheck())

      case "summary":
        return NextResponse.json(databaseUtils.getSummary())

      case "integrity":
        return NextResponse.json(databaseUtils.validateIntegrity())

      case "audit-logs":
        const limit = searchParams.get("limit") ? Number.parseInt(searchParams.get("limit")!) : 50
        const allLogs = auditLog.getAllLogs()
        return NextResponse.json(allLogs.slice(-limit))

      default:
        return createErrorResponse(400, ErrorCodes.VALIDATION_ERROR, "Invalid action parameter")
    }
  } catch (error) {
    return handleApiError(error)
  }
}
