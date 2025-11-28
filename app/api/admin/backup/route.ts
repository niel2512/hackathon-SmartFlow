// Admin endpoint for data backups and exports
import { type NextRequest, NextResponse } from "next/server"
import { backup } from "@/lib/backup"
import { handleApiError, createErrorResponse, ErrorCodes } from "@/lib/error-handler"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const action = searchParams.get("action")

    switch (action) {
      case "statistics":
        return NextResponse.json(backup.getDataStatistics())

      case "export-json":
        const jsonBackup = backup.exportBackupAsJSON()
        return new NextResponse(jsonBackup, {
          headers: {
            "Content-Type": "application/json",
            "Content-Disposition": 'attachment; filename="smartflow-backup.json"',
          },
        })

      case "export-products-csv":
        const productsCsv = backup.exportProductsAsCSV()
        return new NextResponse(productsCsv, {
          headers: {
            "Content-Type": "text/csv",
            "Content-Disposition": 'attachment; filename="products-backup.csv"',
          },
        })

      case "export-orders-csv":
        const ordersCsv = backup.exportOrdersAsCSV()
        return new NextResponse(ordersCsv, {
          headers: {
            "Content-Type": "text/csv",
            "Content-Disposition": 'attachment; filename="orders-backup.csv"',
          },
        })

      case "migration-history":
        return NextResponse.json(backup.getMigrationHistory())

      default:
        return createErrorResponse(400, ErrorCodes.VALIDATION_ERROR, "Invalid action parameter")
    }
  } catch (error) {
    return handleApiError(error)
  }
}
