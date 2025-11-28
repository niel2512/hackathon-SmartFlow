"use client"

import { AuthForm } from "@/components/auth-form"
import Link from "next/link"

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary/10 via-background to-accent/10">
      <div className="mb-8 text-center">
        <div className="text-4xl mb-2">⚡</div>
        <h1 className="text-3xl font-bold text-primary">SmartFlow</h1>
      </div>
      <AuthForm mode="login" />
      <p className="mt-6 text-sm text-muted-foreground">
        Don't have an account?{" "}
        <Link href="/register" className="text-primary font-semibold hover:underline">
          Register here
        </Link>
      </p>
    </div>
  )
}
