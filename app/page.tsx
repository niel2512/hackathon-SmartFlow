"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (token) {
      router.push("/dashboard")
    }
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10">
      <nav className="border-b bg-card/50 backdrop-blur">
        <div className="container flex items-center justify-between h-16">
          <div className="font-bold text-2xl text-primary">⚡ SmartFlow</div>
          <div className="flex gap-4">
            <Link href="/login">
              <Button variant="outline">Login</Button>
            </Link>
            <Link href="/register">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="container py-20">
        <section className="text-center mb-20">
          <h1 className="text-5xl font-bold mb-6 text-balance">
            Accelerating Indonesia's Digital Industry Transformation
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            SmartFlow is an intelligent workflow automation platform designed for MSMEs and small manufacturers
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/register">
              <Button size="lg">Get Started Free</Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline">
                Try Demo
              </Button>
            </Link>
          </div>
        </section>

        <section className="grid md:grid-cols-2 gap-12 mb-20">
          <div className="bg-card p-8 rounded-lg border">
            <h3 className="text-xl font-bold mb-4 text-primary">Problem Overview</h3>
            <p className="text-muted-foreground">
              Small manufacturers struggle with manual order processing, inventory tracking, and workflow coordination,
              leading to inefficiencies and lost revenue.
            </p>
          </div>
          <div className="bg-card p-8 rounded-lg border">
            <h3 className="text-xl font-bold mb-4 text-primary">Who's Affected</h3>
            <p className="text-muted-foreground">
              MSMEs and small-to-medium manufacturers across Indonesia who need streamlined operations without expensive
              enterprise software.
            </p>
          </div>
        </section>

        <section className="grid md:grid-cols-3 gap-6 mb-20">
          <div className="bg-card p-6 rounded-lg border hover:border-primary transition-colors">
            <div className="text-3xl mb-3">📊</div>
            <h4 className="font-bold mb-2">Real-time Analytics</h4>
            <p className="text-sm text-muted-foreground">Dashboard with sales charts and order status distribution</p>
          </div>
          <div className="bg-card p-6 rounded-lg border hover:border-primary transition-colors">
            <div className="text-3xl mb-3">🤖</div>
            <h4 className="font-bold mb-2">Smart Automation</h4>
            <p className="text-sm text-muted-foreground">Rule-based workflows that execute actions automatically</p>
          </div>
          <div className="bg-card p-6 rounded-lg border hover:border-primary transition-colors">
            <div className="text-3xl mb-3">📦</div>
            <h4 className="font-bold mb-2">Inventory Control</h4>
            <p className="text-sm text-muted-foreground">Automatic stock management and low-stock alerts</p>
          </div>
        </section>

        <section className="bg-card p-12 rounded-lg border text-center">
          <h3 className="text-2xl font-bold mb-4">Mission</h3>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            To empower Indonesian small manufacturers with affordable, intelligent automation tools that increase
            productivity and enable digital transformation.
          </p>
        </section>
      </main>
    </div>
  )
}
