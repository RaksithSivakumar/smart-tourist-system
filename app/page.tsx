"use client"

import { useAuth } from "@/components/auth-provider"
import { LoginForm } from "@/components/login-form"
import { TouristDashboard } from "@/components/dashboards/tourist-dashboard"
import { PoliceDashboard } from "@/components/dashboards/police-dashboard"
import { HotelDashboard } from "@/components/dashboards/hotel-dashboard"
import { AirportDashboard } from "@/components/dashboards/airport-dashboard"
import { Loader2 } from "lucide-react"

export default function HomePage() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!user) {
    return <LoginForm />
  }

  // Render role-specific dashboard
  switch (user.role) {
    case "tourist":
      return <TouristDashboard />
    case "police":
      return <PoliceDashboard />
    case "hotel":
      return <HotelDashboard />
    case "airport":
      return <AirportDashboard />
    default:
      return <LoginForm />
  }
}
