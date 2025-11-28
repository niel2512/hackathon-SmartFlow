import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { generateZapierWebhookUrl } from "@/lib/zapier"

export async function GET() {
  const rules = db.getWorkflowRules()

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  const rulesWithWebhooks = rules.map((rule) => ({
    ...rule,
    zapierWebhookUrl: generateZapierWebhookUrl(rule.id, baseUrl),
  }))

  return NextResponse.json(rulesWithWebhooks)
}

export async function POST(request: NextRequest) {
  const rule = await request.json()
  const newRule = db.createWorkflowRule(rule)

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

  return NextResponse.json({
    ...newRule,
    zapierWebhookUrl: generateZapierWebhookUrl(newRule.id, baseUrl),
    zapierSetupInstructions: `Configure this automation in Zapier using the webhook URL above`,
  })
}
