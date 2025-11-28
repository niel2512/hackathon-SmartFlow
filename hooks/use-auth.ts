"use client"

import { useEffect, useState } from "react"

export interface AuthUser {
  id: string
  name: string
  email: string
  role: "Admin" | "Staff"
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem("token")
    const userStr = localStorage.getItem("user")

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr)
        setUser(user)
      } catch (error) {
        console.error("[v0] Failed to parse user from localStorage:", error)
        localStorage.removeItem("token")
        localStorage.removeItem("user")
      }
    }
    setLoading(false)
  }, [])

  const logout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    setUser(null)
  }

  return { user, loading, logout }
}
