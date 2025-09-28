"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { AuthService } from "@/lib/auth"
import { LoginForm } from "@/components/login-form"

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    if (AuthService.isAuthenticated()) {
      router.push("/dashboard")
    }
  }, [router])

  return <LoginForm />
}
