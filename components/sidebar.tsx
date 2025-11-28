"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useAuth } from "@/hooks/use-auth"

export function Sidebar() {
  const pathname = usePathname()
  const { user, loading } = useAuth()

  const baseNavItems = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/orders", label: "Orders" },
    { href: "/inventory", label: "Inventory" },
    { href: "/notifications", label: "Notifications" },
  ]

  const adminOnlyItems = [
    { href: "/automation", label: "Automation" },
    { href: "/staff", label: "Staff" },
  ]

  const navItems = user?.role === "Admin" ? [...baseNavItems, ...adminOnlyItems] : baseNavItems

  if (loading) {
    return (
      <aside className="w-64 border-r bg-card min-h-screen p-6">
        <div className="space-y-4">
          <div className="h-6 bg-muted rounded animate-pulse"></div>
        </div>
      </aside>
    )
  }

  return (
    <aside className="w-64 border-r bg-card min-h-screen p-6">
      <div className="space-y-4">
        <div>
          <h2 className="font-semibold text-lg text-primary">Menu</h2>
          {user && (
            <p className="text-xs text-muted-foreground mt-1">
              {user.name} ({user.role})
            </p>
          )}
        </div>
        <nav className="space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "block px-4 py-2 rounded-md text-sm transition-colors",
                pathname === item.href ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  )
}
