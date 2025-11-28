import { NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = await createServiceClient()

    const [ordersRes, productsRes, notificationsRes] = await Promise.all([
      supabase.from("orders").select("*"),
      supabase.from("products").select("*"),
      supabase.from("notification_logs").select("*"),
    ])

    if (ordersRes.error) throw ordersRes.error
    if (productsRes.error) throw productsRes.error
    if (notificationsRes.error) throw notificationsRes.error

    const orders = ordersRes.data || []
    const products = productsRes.data || []
    const notifications = notificationsRes.data || []

    const totalOrders = orders.length
    const lowStockAlerts = products.filter((p: any) => p.stock < p.min_stock).length
    const staffTasks = orders.filter((o: any) => o.status === "Processing").length
    const revenue = orders
      .filter((o: any) => o.status === "Completed")
      .reduce((sum: number, o: any) => sum + o.total, 0)

    const salesByMonth: { [key: string]: number } = {}
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

    orders.forEach((order: any) => {
      const date = new Date(order.created_at)
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
      Pending: orders.filter((o: any) => o.status === "Pending").length,
      Processing: orders.filter((o: any) => o.status === "Processing").length,
      Completed: orders.filter((o: any) => o.status === "Completed").length,
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
  } catch (error) {
    console.error("[API Error] dashboard summary:", error)
    return NextResponse.json({ error: "Failed to fetch dashboard data" }, { status: 500 })
  }
}
