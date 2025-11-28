import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
  const orders = db.getOrders()
  const products = db.getProducts()
  const notifications = db.getNotifications()

  const totalOrders = orders.length
  const lowStockAlerts = products.filter((p) => p.stock < p.minStock).length
  const staffTasks = orders.filter((o) => o.status === "Processing").length
  const revenue = orders.filter((o) => o.status === "Completed").reduce((sum, o) => sum + o.total, 0)

  const salesByMonth: { [key: string]: number } = {}
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

  orders.forEach((order) => {
    const date = new Date(order.createdAt)
    const monthIndex = date.getMonth()
    const monthName = monthNames[monthIndex]

    if (!salesByMonth[monthName]) {
      salesByMonth[monthName] = 0
    }
    salesByMonth[monthName] += order.total
  })

  const salesData = monthNames.map((month) => ({
    month,
    sales: salesByMonth[month] || 0,
  }))

  const orderStatusDistribution = {
    Pending: orders.filter((o) => o.status === "Pending").length,
    Processing: orders.filter((o) => o.status === "Processing").length,
    Completed: orders.filter((o) => o.status === "Completed").length,
  }

  const orderStatusData = Object.entries(orderStatusDistribution).map(([name, value]) => ({
    name,
    value,
  }))

  return NextResponse.json({
    totalOrders,
    lowStockAlerts,
    staffTasks,
    revenue,
    recentNotifications: notifications.slice(-5).reverse(),
    salesData,
    orderStatusData,
  })
}
