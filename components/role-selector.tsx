"use client"

import type { UserRole } from "@/components/auth-provider"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Shield, MapPin, Building2, Plane } from "lucide-react"

interface RoleSelectorProps {
  selectedRole: UserRole | null
  onRoleSelect: (role: UserRole) => void
}

const roles = [
  {
    id: "tourist" as UserRole,
    name: "Tourist",
    description: "Explore safely with real-time assistance",
    icon: MapPin,
    gradient: "gradient-tourist",
    features: ["Digital ID", "SOS Button", "Safety Alerts", "Travel Docs"],
  },
  {
    id: "police" as UserRole,
    name: "Police",
    description: "Incident response and tourist safety",
    icon: Shield,
    gradient: "gradient-police",
    features: ["Live Incidents", "SOS Alerts", "e-FIR", "GPS Tracking"],
  },
  {
    id: "hotel" as UserRole,
    name: "Hotel",
    description: "Guest safety and concierge services",
    icon: Building2,
    gradient: "gradient-hotel",
    features: ["Guest Registry", "Safety Ratings", "Concierge", "Alerts"],
  },
  {
    id: "airport" as UserRole,
    name: "Airport",
    description: "Passenger safety and coordination",
    icon: Plane,
    gradient: "gradient-airport",
    features: ["Passenger Manifest", "Security Alerts", "RFID Tracking", "Immigration"],
  },
]

export function RoleSelector({ selectedRole, onRoleSelect }: RoleSelectorProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {roles.map((role) => {
        const Icon = role.icon
        const isSelected = selectedRole === role.id

        return (
          <Card
            key={role.id}
            className={`
              relative overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105
              ${isSelected ? "ring-2 ring-primary shadow-lg" : "hover:shadow-md"}
              backdrop-blur-xl bg-white/10 dark:bg-black/20 border border-white/20 dark:border-white/10 shadow-2xl rounded-xl
            `}
            onClick={() => onRoleSelect(role.id)}
          >
            <div className={`absolute inset-0 opacity-10 ${role.gradient}`} />
            <div className="relative p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-3 rounded-lg ${role.gradient}`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{role.name}</h3>
                  <p className="text-sm text-muted-foreground">{role.description}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {role.features.map((feature) => (
                  <Badge key={feature} variant="secondary" className="text-xs">
                    {feature}
                  </Badge>
                ))}
              </div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
