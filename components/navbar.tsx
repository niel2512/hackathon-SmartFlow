"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

export function Navbar() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    router.push("/")
  }

  return (
    <nav className="border-b bg-card">
      <div className="container flex items-center justify-between h-16">
        <Link href="/dashboard" className="font-bold text-lg text-primary">
          ⚡ SmartFlow
        </Link>
        <div className="flex items-center gap-6">
          {user && (
            <>
              <div className="text-sm">
                <p className="font-medium">{user.name}</p>
                <p className="text-muted-foreground text-xs">{user.role}</p>
              </div>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
