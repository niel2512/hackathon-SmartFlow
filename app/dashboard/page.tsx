"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { Navbar } from "@/components/navbar"
import { Sidebar } from "@/components/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

interface DashboardData {
  totalOrders: number
  lowStockAlerts: number
  staffTasks: number
  revenue: number
  recentNotifications: any[]
  salesData: Array<{ month: string; sales: number }>
  orderStatusData: Array<{ name: string; value: number }>
}

export default function Dashboard() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/login")
      return
    }

    if (!authLoading && user?.role !== "Admin") {
      router.push("/orders")
      return
    }

    const fetchData = async () => {
      try {
        const res = await fetch("/api/dashboard/summary")
        const summaryData = await res.json()
        setData(summaryData)
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    if (!authLoading && user?.role === "Admin") {
      fetchData()
    }
  }, [router, authLoading, user])

  if (loading || authLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  const salesData = data?.salesData || []
  const orderStatusData = data?.orderStatusData || []

  const COLORS = ["oklch(0.6 0.2 240)", "oklch(0.55 0.18 264)", "oklch(0.5 0.15 280)"]

  return (
    <>
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8">
          <h1 className="text-3xl font-bold mb-8 text-foreground">Dashboard</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">{data?.totalOrders || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Stock Low Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-accent">{data?.lowStockAlerts || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Staff Tasks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-secondary">{data?.staffTasks || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">Rp {(data?.revenue || 0).toLocaleString("id-ID")}</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Sales Chart</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="sales" stroke="oklch(0.6 0.2 240)" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Order Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie data={orderStatusData} cx="50%" cy="45%" outerRadius={80} fill="#8884d8" dataKey="value">
                        {orderStatusData.map((entry, index) => {
                          const statusColors: { [key: string]: string } = {
                            Pending: "oklch(0.75 0.18 40)", // Orange for Pending
                            Processing: "oklch(0.65 0.2 250)", // Blue for Processing
                            Completed: "oklch(0.6 0.15 150)", // Green for Completed
                          }
                          return <Cell key={`cell-${index}`} fill={statusColors[entry.name] || COLORS[index]} />
                        })}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>

                  <div className="flex justify-center gap-6">
                    {orderStatusData.map((entry, index) => {
                      const statusColors: { [key: string]: string } = {
                        Pending: "oklch(0.75 0.18 40)",
                        Processing: "oklch(0.65 0.2 250)",
                        Completed: "oklch(0.6 0.15 150)",
                      }
                      const color = statusColors[entry.name] || COLORS[index]
                      return (
                        <div key={entry.name} className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }}></div>
                          <span className="text-sm text-foreground">
                            {entry.name}: {entry.value}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Activity Logs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data?.recentNotifications && data.recentNotifications.length > 0 ? (
                  data.recentNotifications.map((notif) => (
                    <div key={notif.id} className="flex items-start gap-3 pb-3 border-b last:border-b-0">
                      <div className="mt-1">
                        {notif.type === "Order" && <div className="text-lg">📋</div>}
                        {notif.type === "Stock" && <div className="text-lg">⚠️</div>}
                        {notif.type === "Automation" && <div className="text-lg">⚙️</div>}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{notif.message}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(notif.createdAt).toLocaleString("id-ID")}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground">No recent activity</p>
                )}
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </>
  )
}
