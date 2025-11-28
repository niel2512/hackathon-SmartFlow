"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Sidebar } from "@/components/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Notification {
  id: string
  message: string
  type: "Order" | "Stock" | "Automation"
  createdAt: string
}

export default function NotificationsPage() {
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/login")
      return
    }

    const fetchNotifications = async () => {
      try {
        const res = await fetch("/api/notifications")
        const data = await res.json()
        setNotifications(data.reverse())
      } catch (error) {
        console.error("Failed to fetch notifications:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchNotifications()
    const interval = setInterval(fetchNotifications, 5000)
    return () => clearInterval(interval)
  }, [router])

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  const getIcon = (type: Notification["type"]) => {
    switch (type) {
      case "Order":
        return "📋"
      case "Stock":
        return "⚠️"
      case "Automation":
        return "⚙️"
    }
  }

  return (
    <>
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8">
          <h1 className="text-3xl font-bold mb-8">Notifications</h1>

          <Card>
            <CardHeader>
              <CardTitle>Automation Logs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {notifications.length > 0 ? (
                  notifications.map((notif) => (
                    <div key={notif.id} className="flex items-start gap-3 pb-3 border-b last:border-b-0">
                      <div className="text-2xl">{getIcon(notif.type)}</div>
                      <div className="flex-1">
                        <p className="font-medium">{notif.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(notif.createdAt).toLocaleString("id-ID")}
                        </p>
                      </div>
                      <div className="text-xs px-2 py-1 rounded bg-muted">{notif.type}</div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-8">No notifications yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </>
  )
}
