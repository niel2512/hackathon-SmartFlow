// Audit logging for admin and staff actions
export interface AuditLog {
  id: string
  userId: string
  userEmail: string
  action: string
  entityType: "User" | "Product" | "Order" | "Workflow" | "Notification"
  entityId: string
  changes: Record<string, any>
  timestamp: Date
  ipAddress?: string
}

// In-memory audit log storage (will be replaced with database in full production)
const auditLogs: AuditLog[] = []

export const auditLog = {
  // Record an action
  record: (log: Omit<AuditLog, "id" | "timestamp">) => {
    const newLog: AuditLog = {
      ...log,
      id: Date.now().toString(),
      timestamp: new Date(),
    }
    auditLogs.push(newLog)
    return newLog
  },

  // Get audit logs for a user
  getUserLogs: (userId: string) => {
    return auditLogs.filter((log) => log.userId === userId)
  },

  // Get audit logs for an entity
  getEntityLogs: (entityType: AuditLog["entityType"], entityId: string) => {
    return auditLogs.filter((log) => log.entityType === entityType && log.entityId === entityId)
  },

  // Get all audit logs (for admin review)
  getAllLogs: () => auditLogs,

  // Get logs by date range
  getLogsByDateRange: (startDate: Date, endDate: Date) => {
    return auditLogs.filter((log) => log.timestamp >= startDate && log.timestamp <= endDate)
  },

  // Get logs by action type
  getLogsByAction: (action: string) => {
    return auditLogs.filter((log) => log.action === action)
  },
}
