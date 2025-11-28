import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { validateWorkflowRule, validationErrorResponse } from "@/lib/validation"
import { handleApiError } from "@/lib/error-handler"
import { auditLog } from "@/lib/audit-log"

export async function GET() {
  try {
    return NextResponse.json(db.getWorkflowRules())
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const rule = await request.json()

    const validation = validateWorkflowRule(rule)
    if (!validation.valid) {
      return validationErrorResponse(validation.errors)
    }

    const newRule = db.createWorkflowRule(rule)

    await auditLog.record({
      userId: "system",
      userEmail: "system@smartflow.local",
      action: "CREATE_WORKFLOW",
      entityType: "Workflow",
      entityId: newRule.id,
      changes: { created: newRule },
    })

    return NextResponse.json(newRule, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
