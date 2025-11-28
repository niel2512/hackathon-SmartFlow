// Production database utilities and helpers
import { db } from "@/lib/db"
import { auditLog } from "@/lib/audit-log"

export interface DatabaseHealthCheck {
  status: "healthy" | "warning" | "critical"
  timestamp: string
  stats: {
    users: number
    products: number
    orders: number
    workflows: number
    notifications: number
  }
  warnings: string[]
}

export const databaseUtils = {
  // Perform a health check on the database
  healthCheck: (): DatabaseHealthCheck => {
    const warnings: string[] = []
    const stats = {
      users: db.getAllUsers().length,
      products: db.getProducts().length,
      orders: db.getOrders().length,
      workflows: db.getWorkflowRules().length,
      notifications: db.getNotifications().length,
    }

    // Add warnings for potential issues
    if (stats.products === 0) {
      warnings.push("No products in inventory")
    }

    const lowStockProducts = db.getProducts().filter((p) => p.stock < p.minStock)
    if (lowStockProducts.length > 0) {
      warnings.push(`${lowStockProducts.length} product(s) have low stock`)
    }

    const pendingOrders = db.getOrders().filter((o) => o.status === "Pending")
    if (pendingOrders.length > 0) {
      warnings.push(`${pendingOrders.length} pending order(s) awaiting processing`)
    }

    return {
      status: warnings.length === 0 ? "healthy" : warnings.length > 1 ? "warning" : "critical",
      timestamp: new Date().toISOString(),
      stats,
      warnings,
    }
  },

  // Get data summary for admin dashboard
  getSummary: () => {
    const orders = db.getOrders()
    const products = db.getProducts()

    return {
      totalOrders: orders.length,
      completedOrders: orders.filter((o) => o.status === "Completed").length,
      processingOrders: orders.filter((o) => o.status === "Processing").length,
      pendingOrders: orders.filter((o) => o.status === "Pending").length,
      totalRevenue: orders.reduce((sum, o) => sum + o.total, 0),
      totalProducts: products.length,
      lowStockProducts: products.filter((p) => p.stock < p.minStock).length,
      averageOrderValue: orders.length > 0 ? orders.reduce((sum, o) => sum + o.total, 0) / orders.length : 0,
    }
  },

  // Get audit trail for an entity
  getAuditTrail: (entityType: string, entityId: string) => {
    return auditLog.getEntityLogs(entityType as any, entityId)
  },

  // Get user activity log
  getUserActivity: (userId: string) => {
    return auditLog.getUserLogs(userId)
  },

  // Validate data integrity
  validateIntegrity: () => {
    const issues: string[] = []
    const orders = db.getOrders()

    // Check for orders with products that don't exist
    for (const order of orders) {
      for (const item of order.items) {
        if (!db.getProduct(item.productId)) {
          issues.push(`Order ${order.id} references non-existent product ${item.productId}`)
        }
      }
    }

    return {
      valid: issues.length === 0,
      issuesFound: issues.length,
      issues,
      checkedAt: new Date().toISOString(),
    }
  },
}
