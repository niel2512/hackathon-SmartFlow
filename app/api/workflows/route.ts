import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
  return NextResponse.json(db.getWorkflowRules())
}

export async function POST(request: NextRequest) {
  const rule = await request.json()
  const newRule = db.createWorkflowRule(rule)
  return NextResponse.json(newRule)
}
