"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { flashManager } from "@/lib/flash"
import { Navbar } from "@/components/navbar"
import { Sidebar } from "@/components/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

interface User {
  id: string
  name: string
  email: string
  role: "Admin" | "Staff"
  createdAt: string
}

export default function StaffPage() {
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "Staff" as const,
  })

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/login")
      return
    }

    const fetchUsers = async () => {
      try {
        setUsers([])
      } catch (error) {
        console.error("Failed to fetch users:", error)
        flashManager.add("Failed to load staff members", "error")
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [router])

  const handleAddStaff = async () => {
    if (!formData.name || !formData.email) {
      flashManager.add("Name and email are required", "warning")
      return
    }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      const newUser = await res.json()
      setUsers([...users, newUser.user])
      setShowForm(false)
      setFormData({
        name: "",
        email: "",
        password: "",
        role: "Staff",
      })
      flashManager.add(`Staff member "${formData.name}" added successfully`, "success")
    } catch (error) {
      console.error("Failed to add staff:", error)
      flashManager.add("Failed to add staff member", "error")
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <>
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Staff Management</h1>
            <Button onClick={() => setShowForm(!showForm)}>Add Staff</Button>
          </div>

          {showForm && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Add New Staff Member</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Name</label>
                  <Input
                    placeholder="Staff name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <Input
                    type="email"
                    placeholder="staff@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Password</label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Role</label>
                  <select
                    className="w-full px-3 py-2 border border-input rounded-md bg-background"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                  >
                    <option value="Staff">Staff</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
                <Button onClick={handleAddStaff}>Add Staff Member</Button>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Staff Members</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {users.length > 0 ? (
                  users.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-semibold">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          user.role === "Admin" ? "bg-primary/20 text-primary" : "bg-secondary/20 text-secondary"
                        }`}
                      >
                        {user.role}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground">No staff members yet. Create new ones using the form above.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </>
  )
}
