import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  db.deleteWorkflowRule(id)
  return NextResponse.json({ success: true })
}
