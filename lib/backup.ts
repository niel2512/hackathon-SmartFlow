// Database backup and migration utilities for production
import { db, type User, type Product, type Order, type WorkflowRule, type NotificationLog } from "@/lib/db"
import { auditLog } from "@/lib/audit-log"

export interface BackupData {
  version: string
  timestamp: string
  data: {
    users: User[]
    products: Product[]
    orders: Order[]
    workflowRules: WorkflowRule[]
    notificationLogs: NotificationLog[]
  }
}

export interface MigrationRecord {
  id: string
  timestamp: Date
  backupId: string
  description: string
  status: "pending" | "completed" | "failed"
  error?: string
}

const migrationHistory: MigrationRecord[] = []

export const backup = {
  // Create a backup of all data
  createBackup: (): BackupData => {
    return {
      version: "1.0.0",
      timestamp: new Date().toISOString(),
      data: {
        users: db.getAllUsers(),
        products: db.getProducts(),
        orders: db.getOrders(),
        workflowRules: db.getWorkflowRules(),
        notificationLogs: db.getNotifications(),
      },
    }
  },

  // Export backup as JSON string
  exportBackupAsJSON: (): string => {
    const backupData = backup.createBackup()
    return JSON.stringify(backupData, null, 2)
  },

  // Export backup as CSV (for products and orders)
  exportProductsAsCSV: (): string => {
    const products = db.getProducts()
    const headers = ["ID", "Name", "Stock", "Min Stock", "Price", "Created At"]
    const rows = products.map((p) => [
      p.id,
      p.name,
      p.stock.toString(),
      p.minStock.toString(),
      p.price.toString(),
      p.createdAt.toString(),
    ])
    return [headers, ...rows].map((row) => row.join(",")).join("\n")
  },

  exportOrdersAsCSV: (): string => {
    const orders = db.getOrders()
    const headers = ["ID", "Customer Name", "Status", "Total", "Item Count", "Created At"]
    const rows = orders.map((o) => [
      o.id,
      o.customerName,
      o.status,
      o.total.toString(),
      o.items.length.toString(),
      o.createdAt.toString(),
    ])
    return [headers, ...rows].map((row) => row.join(",")).join("\n")
  },

  // Get migration history
  getMigrationHistory: (): MigrationRecord[] => migrationHistory,

  // Record a migration attempt
  recordMigration: (description: string, status: "completed" | "failed", error?: string): MigrationRecord => {
    const record: MigrationRecord = {
      id: Date.now().toString(),
      timestamp: new Date(),
      backupId: `backup-${Date.now()}`,
      description,
      status,
      error,
    }
    migrationHistory.push(record)
    return record
  },

  // Get data statistics
  getDataStatistics: () => {
    return {
      totalUsers: db.getAllUsers().length,
      totalProducts: db.getProducts().length,
      totalOrders: db.getOrders().length,
      totalWorkflows: db.getWorkflowRules().length,
      totalNotifications: db.getNotifications().length,
      auditLogEntries: auditLog.getAllLogs().length,
      backupDate: new Date().toISOString(),
    }
  },
}
