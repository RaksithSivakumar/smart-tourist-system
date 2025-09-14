"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/components/auth-provider"
import {
  Plane,
  Users,
  MapPin,
  Shield,
  Clock,
  Luggage,
  AlertTriangle,
  Navigation,
  LogOut,
  Search,
  Dessert as Passport,
} from "lucide-react"

interface Passenger {
  id: string
  name: string
  flight: string
  gate: string
  status: "Checked In" | "Security" | "Boarding" | "Departed"
  nationality: string
  visaStatus: "Valid" | "Expired" | "Pending"
  baggageCount: number
  lastSeen: string
}

interface Flight {
  number: string
  destination: string
  departure: string
  gate: string
  status: "On Time" | "Delayed" | "Boarding" | "Departed"
  passengers: number
}

export function AirportDashboard() {
  const { user, logout } = useAuth()
  const [passengers] = useState<Passenger[]>([
    {
      id: "P-001",
      name: "John Smith",
      flight: "AA123",
      gate: "A12",
      status: "Security",
      nationality: "USA",
      visaStatus: "Valid",
      baggageCount: 2,
      lastSeen: "Security Checkpoint 2",
    },
    {
      id: "P-002",
      name: "Maria Garcia",
      flight: "UA456",
      gate: "B8",
      status: "Boarding",
      nationality: "Spain",
      visaStatus: "Valid",
      baggageCount: 1,
      lastSeen: "Gate B8",
    },
    {
      id: "P-003",
      name: "David Chen",
      flight: "DL789",
      gate: "C15",
      status: "Checked In",
      nationality: "China",
      visaStatus: "Valid",
      baggageCount: 3,
      lastSeen: "Check-in Counter",
    },
  ])

  const [flights] = useState<Flight[]>([
    { number: "AA123", destination: "London", departure: "14:30", gate: "A12", status: "On Time", passengers: 156 },
    { number: "UA456", destination: "Paris", departure: "15:45", gate: "B8", status: "Boarding", passengers: 189 },
    { number: "DL789", destination: "Tokyo", departure: "16:20", gate: "C15", status: "Delayed", passengers: 234 },
  ])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "On Time":
      case "Valid":
      case "Boarding":
        return "bg-green-500"
      case "Delayed":
      case "Pending":
        return "bg-yellow-500"
      case "Departed":
      case "Expired":
        return "bg-red-500"
      default:
        return "bg-blue-500"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-indigo-100 dark:from-slate-800 dark:to-indigo-900">
      {/* Header */}
      <header className="backdrop-blur-xl bg-white/10 dark:bg-black/20 border border-white/20 dark:border-white/10 shadow-2xl rounded-xl m-4 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full gradient-airport flex items-center justify-center">
              <Plane className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">JFK International Airport</h1>
              <p className="text-sm text-muted-foreground">Operations Center - {user?.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-green-500 text-white">Operational</Badge>
            <Button variant="outline" onClick={logout}>
              <LogOut className="h-4 w-4 mr-2" />
              End Shift
            </Button>
          </div>
        </div>
      </header>

      <div className="p-4 space-y-6">
        {/* Airport Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: "Active Flights", value: "47", icon: Plane, color: "bg-blue-500" },
            { label: "Passengers Today", value: "12,847", icon: Users, color: "bg-green-500" },
            { label: "Security Alerts", value: "3", icon: Shield, color: "bg-yellow-500" },
            { label: "Avg Processing", value: "18m", icon: Clock, color: "bg-purple-500" },
          ].map((stat, index) => (
            <Card
              key={index}
              className="backdrop-blur-xl bg-white/10 dark:bg-black/20 border border-white/20 dark:border-white/10 shadow-2xl rounded-xl"
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                  <div className={`w-12 h-12 ${stat.color} rounded-full flex items-center justify-center`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Flight Status & Passenger Manifest */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="backdrop-blur-xl bg-white/10 dark:bg-black/20 border border-white/20 dark:border-white/10 shadow-2xl rounded-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plane className="h-5 w-5" />
                Live Flight Status
              </CardTitle>
              <CardDescription>Real-time flight tracking and gate assignments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {flights.map((flight) => (
                  <div key={flight.number} className="p-3 bg-white/50 rounded-lg border">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-slate-400 to-indigo-500 rounded-full flex items-center justify-center">
                          <Plane className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="font-medium">{flight.number}</p>
                          <p className="text-sm text-muted-foreground">{flight.destination}</p>
                        </div>
                      </div>
                      <Badge className={`${getStatusColor(flight.status)} text-white`}>{flight.status}</Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-4">
                        <span>Gate {flight.gate}</span>
                        <span>Dep: {flight.departure}</span>
                        <span>{flight.passengers} pax</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-xl bg-white/10 dark:bg-black/20 border border-white/20 dark:border-white/10 shadow-2xl rounded-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Passenger Manifest
              </CardTitle>
              <CardDescription>Real-time passenger tracking and status</CardDescription>
              <div className="flex gap-2">
                <Input placeholder="Search passengers..." className="flex-1" />
                <Button size="sm" variant="outline">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {passengers.map((passenger) => (
                  <div key={passenger.id} className="p-3 bg-white/50 rounded-lg border">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-slate-400 to-indigo-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-sm">{passenger.name.charAt(0)}</span>
                        </div>
                        <div>
                          <p className="font-medium">{passenger.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {passenger.flight} • Gate {passenger.gate}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Badge className={`${getStatusColor(passenger.status)} text-white text-xs`}>
                          {passenger.status}
                        </Badge>
                        <Badge className={`${getStatusColor(passenger.visaStatus)} text-white text-xs`}>
                          {passenger.visaStatus}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>
                        {passenger.nationality} • {passenger.baggageCount} bags
                      </span>
                      <span>{passenger.lastSeen}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Airport Map & Security Center */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="backdrop-blur-xl bg-white/10 dark:bg-black/20 border border-white/20 dark:border-white/10 shadow-2xl rounded-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Airport Terminal Map
              </CardTitle>
              <CardDescription>Real-time passenger flow and emergency exits</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="w-full h-64 bg-gradient-to-br from-slate-200 to-indigo-300 rounded-lg flex items-center justify-center relative overflow-hidden">
                <div className="text-center">
                  <MapPin className="h-12 w-12 mx-auto mb-2 text-indigo-600" />
                  <p className="text-sm font-medium">Interactive Terminal Map</p>
                  <p className="text-xs text-muted-foreground">3 Terminals • 67 Gates</p>
                </div>
                {/* Terminal indicators */}
                <div className="absolute top-4 left-4 space-y-1">
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-3 h-3 bg-green-500 rounded-full" />
                    <span>Terminal A</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-3 h-3 bg-blue-500 rounded-full" />
                    <span>Terminal B</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-3 h-3 bg-purple-500 rounded-full" />
                    <span>Terminal C</span>
                  </div>
                </div>
                {/* Passenger flow indicators */}
                <div className="absolute bottom-4 right-4 w-4 h-4 bg-yellow-500 rounded-full animate-pulse" />
                <div className="absolute top-8 right-8 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              </div>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-xl bg-white/10 dark:bg-black/20 border border-white/20 dark:border-white/10 shadow-2xl rounded-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security & Immigration
              </CardTitle>
              <CardDescription>Security alerts and immigration processing</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm font-medium text-yellow-800">Security Alert</span>
                  </div>
                  <p className="text-sm text-yellow-700">Unattended baggage detected at Gate B12</p>
                  <Button size="sm" className="mt-2 bg-yellow-600 hover:bg-yellow-700 text-white">
                    Investigate
                  </Button>
                </div>

                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Passport className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">Immigration Status</span>
                  </div>
                  <p className="text-sm text-blue-700">47 passengers processed in last hour</p>
                  <p className="text-xs text-blue-600 mt-1">Average processing time: 18 minutes</p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Button className="gradient-airport text-white border-0">
                    <Shield className="h-4 w-4 mr-2" />
                    Security Alert
                  </Button>
                  <Button variant="outline">
                    <Navigation className="h-4 w-4 mr-2" />
                    Emergency Routes
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RFID Tracking & Ground Transport */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="backdrop-blur-xl bg-white/10 dark:bg-black/20 border border-white/20 dark:border-white/10 shadow-2xl rounded-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Luggage className="h-5 w-5" />
                RFID Baggage Tracking
              </CardTitle>
              <CardDescription>Real-time baggage location and status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  {
                    id: "BAG-001",
                    passenger: "John Smith",
                    flight: "AA123",
                    status: "Security Scan",
                    location: "Checkpoint 2",
                  },
                  { id: "BAG-002", passenger: "Maria Garcia", flight: "UA456", status: "Loading", location: "Gate B8" },
                  {
                    id: "BAG-003",
                    passenger: "David Chen",
                    flight: "DL789",
                    status: "Check-in",
                    location: "Counter 15",
                  },
                ].map((bag, index) => (
                  <div key={index} className="p-3 bg-white/50 rounded-lg border">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm">{bag.id}</span>
                      <Badge className="bg-blue-500 text-white text-xs">{bag.status}</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <p>
                        {bag.passenger} • {bag.flight}
                      </p>
                      <p>Location: {bag.location}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-xl bg-white/10 dark:bg-black/20 border border-white/20 dark:border-white/10 shadow-2xl rounded-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Navigation className="h-5 w-5" />
                Ground Transport Coordination
              </CardTitle>
              <CardDescription>Taxi, shuttle, and public transport management</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: Navigation, label: "Taxi Queue", color: "bg-yellow-500", count: "23" },
                  { icon: Users, label: "Shuttle Service", color: "bg-green-500", count: "8" },
                  { icon: MapPin, label: "Ride Share", color: "bg-purple-500", count: "15" },
                  { icon: Clock, label: "Public Transit", color: "bg-blue-500", count: "Next: 12m" },
                ].map((transport, index) => (
                  <div key={index} className="p-3 bg-white/50 rounded-lg border text-center">
                    <div
                      className={`w-10 h-10 ${transport.color} rounded-full mx-auto mb-2 flex items-center justify-center`}
                    >
                      <transport.icon className="h-5 w-5 text-white" />
                    </div>
                    <p className="text-sm font-medium">{transport.label}</p>
                    <p className="text-xs text-muted-foreground">{transport.count}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
