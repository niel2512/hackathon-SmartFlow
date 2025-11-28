import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { handleApiError, createErrorResponse, ErrorCodes } from "@/lib/error-handler"
import { auditLog } from "@/lib/audit-log"

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const rule = db.getWorkflowRules().find((r) => r.id === id)

    if (!rule) {
      return createErrorResponse(404, ErrorCodes.NOT_FOUND, "Workflow rule not found")
    }

    db.deleteWorkflowRule(id)

    await auditLog.record({
      userId: "system",
      userEmail: "system@smartflow.local",
      action: "DELETE_WORKFLOW",
      entityType: "Workflow",
      entityId: id,
      changes: { deleted: rule },
    })

    return NextResponse.json(
      { success: true, message: "Workflow rule deleted successfully" },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
          Pragma: "no-cache",
          Expires: "0",
        },
      },
    )
  } catch (error) {
    return handleApiError(error)
  }
}
