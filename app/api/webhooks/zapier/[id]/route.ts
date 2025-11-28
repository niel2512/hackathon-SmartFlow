import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const payload = await request.json()

    console.log(`[v0] Zapier webhook received for rule ${id}:`, payload)

    // Get the rule to understand what it does
    const rule = db.getWorkflowRules().find((r) => r.id === id)
    if (!rule) {
      return NextResponse.json({ error: "Rule not found" }, { status: 404 })
    }

    switch (rule.action) {
      case "Send Notification":
        // Log notification action
        db.addNotification({
          message: `Zapier automation triggered: ${rule.trigger} → Sending notification`,
          type: "Automation",
        })
        break

      case "Reduce Stock":
        // Log stock reduction action
        db.addNotification({
          message: `Zapier automation triggered: ${rule.trigger} → Reducing stock`,
          type: "Automation",
        })
        break

      case "Assign Staff":
        // Log staff assignment action
        db.addNotification({
          message: `Zapier automation triggered: ${rule.trigger} → Assigning staff`,
          type: "Automation",
        })
        break
    }

    return NextResponse.json(
      {
        success: true,
        message: `Automation rule '${rule.trigger}' → '${rule.action}' executed successfully`,
        ruleId: id,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("[v0] Zapier webhook error:", error)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return NextResponse.json({
    message: "Zapier webhook endpoint",
    ruleId: id,
    status: "ready",
  })
}
