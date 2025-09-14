"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/components/auth-provider"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import {
  Shield,
  AlertTriangle,
  MapPin,
  Users,
  FileText,
  Phone,
  Camera,
  Clock,
  Navigation,
  Radio,
  LogOut,
  Search,
} from "lucide-react"

interface Incident {
  id: string
  type: "SOS" | "Theft" | "Medical" | "Lost" | "Accident"
  priority: "High" | "Medium" | "Low"
  location: string
  time: string
  status: "Active" | "Responding" | "Resolved"
  touristId: string
  description: string
}

export function PoliceDashboard() {
  const { user, logout } = useAuth()
  const [activeIncidents] = useState<Incident[]>([
    {
      id: "INC-001",
      type: "SOS",
      priority: "High",
      location: "Times Square, NYC",
      time: "2 min ago",
      status: "Active",
      touristId: "TID-ABC123",
      description: "Tourist activated emergency SOS button",
    },
    {
      id: "INC-002",
      type: "Theft",
      priority: "Medium",
      location: "Central Park, NYC",
      time: "15 min ago",
      status: "Responding",
      touristId: "TID-DEF456",
      description: "Reported wallet theft near Bethesda Fountain",
    },
    {
      id: "INC-003",
      type: "Medical",
      priority: "High",
      location: "Brooklyn Bridge, NYC",
      time: "8 min ago",
      status: "Active",
      touristId: "TID-GHI789",
      description: "Tourist experiencing chest pain",
    },
  ])

  const [officers] = useState([
    { id: "OFF-001", name: "Officer Johnson", status: "Available", location: "Midtown" },
    { id: "OFF-002", name: "Officer Smith", status: "Responding", location: "Times Square" },
    { id: "OFF-003", name: "Officer Davis", status: "On Patrol", location: "Central Park" },
  ])

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "bg-red-500"
      case "Medium":
        return "bg-yellow-500"
      case "Low":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-red-500"
      case "Responding":
        return "bg-yellow-500"
      case "Resolved":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-blue-900 dark:from-slate-950 dark:to-blue-950">
      {/* Header */}
      <header className="backdrop-blur-xl bg-white/10 dark:bg-black/20 border border-white/20 dark:border-white/10 shadow-2xl rounded-xl m-4 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-600 to-indigo-700 dark:from-blue-700 dark:to-indigo-800 flex items-center justify-center">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Police Command Center</h1>
              <p className="text-sm text-blue-200 dark:text-blue-300">
                Officer {user?.name} - Badge #{user?.id?.slice(0, 4).toUpperCase()}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Badge className="bg-green-500 hover:bg-green-600 text-white">On Duty</Badge>
            <Button
              variant="outline"
              onClick={logout}
              className="text-white border-white/20 bg-white/10 hover:bg-white/20 dark:bg-black/20 dark:hover:bg-black/30"
            >
              <LogOut className="h-4 w-4 mr-2" />
              End Shift
            </Button>
          </div>
        </div>
      </header>

      <div className="p-4 space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: "Active Incidents", value: "3", icon: AlertTriangle, color: "from-red-500 to-red-600" },
            { label: "Officers on Duty", value: "12", icon: Shield, color: "from-blue-500 to-blue-600" },
            { label: "Tourists Tracked", value: "847", icon: Users, color: "from-green-500 to-green-600" },
            { label: "Response Time", value: "4.2m", icon: Clock, color: "from-yellow-500 to-yellow-600" },
          ].map((stat, index) => (
            <Card
              key={index}
              className="backdrop-blur-xl bg-white/10 dark:bg-black/20 border border-white/20 dark:border-white/10 shadow-2xl rounded-xl"
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-200 dark:text-blue-300">{stat.label}</p>
                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                  </div>
                  <div
                    className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-full flex items-center justify-center shadow-lg`}
                  >
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Live Incident Map & Active Incidents */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="backdrop-blur-xl bg-white/10 dark:bg-black/20 border border-white/20 dark:border-white/10 shadow-2xl rounded-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <MapPin className="h-5 w-5" />
                Live Incident Map
              </CardTitle>
              <CardDescription className="text-blue-200 dark:text-blue-300">
                Real-time incident locations and heat zones
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="w-full h-64 bg-gradient-to-br from-blue-900 to-slate-800 dark:from-blue-950 dark:to-slate-900 rounded-lg flex items-center justify-center relative overflow-hidden border border-white/10">
                <div className="absolute inset-0 bg-[url('/police-incident-map.jpg')] bg-cover bg-center opacity-20" />
                <div className="text-center text-white z-10">
                  <MapPin className="h-12 w-12 mx-auto mb-2 text-blue-400 dark:text-blue-300" />
                  <p className="text-sm">Interactive Map</p>
                  <p className="text-xs text-blue-200 dark:text-blue-300">3 Active Incidents</p>
                </div>
                <div className="absolute top-4 left-4 w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-lg shadow-red-500/50" />
                <div className="absolute bottom-8 right-8 w-3 h-3 bg-yellow-500 rounded-full animate-pulse shadow-lg shadow-yellow-500/50" />
                <div className="absolute top-1/2 left-1/2 w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-lg shadow-red-500/50" />
              </div>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-xl bg-white/10 dark:bg-black/20 border border-white/20 dark:border-white/10 shadow-2xl rounded-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <AlertTriangle className="h-5 w-5" />
                Priority Incidents
              </CardTitle>
              <CardDescription className="text-blue-200 dark:text-blue-300">
                Incidents requiring immediate attention
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {activeIncidents.map((incident) => (
                  <div
                    key={incident.id}
                    className="p-3 bg-white/5 dark:bg-black/10 rounded-lg border border-white/10 dark:border-white/5 hover:bg-white/10 dark:hover:bg-black/20 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge
                          className={`${getPriorityColor(incident.priority)} hover:${getPriorityColor(incident.priority)} text-white text-xs`}
                        >
                          {incident.priority}
                        </Badge>
                        <Badge variant="outline" className="text-xs text-white border-white/20 dark:border-white/10">
                          {incident.type}
                        </Badge>
                      </div>
                      <Badge
                        className={`${getStatusColor(incident.status)} hover:${getStatusColor(incident.status)} text-white text-xs`}
                      >
                        {incident.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-white font-medium">{incident.description}</p>
                    <div className="flex items-center justify-between mt-2 text-xs text-blue-200 dark:text-blue-300">
                      <span>{incident.location}</span>
                      <span>{incident.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Officer Status & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="backdrop-blur-xl bg-white/10 dark:bg-black/20 border border-white/20 dark:border-white/10 shadow-2xl rounded-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Users className="h-5 w-5" />
                Officer Status
              </CardTitle>
              <CardDescription className="text-blue-200 dark:text-blue-300">
                Real-time officer locations and availability
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {officers.map((officer) => (
                  <div
                    key={officer.id}
                    className="flex items-center justify-between p-3 bg-white/5 dark:bg-black/10 rounded-lg hover:bg-white/10 dark:hover:bg-black/20 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                        <Shield className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{officer.name}</p>
                        <p className="text-xs text-blue-200 dark:text-blue-300">{officer.location}</p>
                      </div>
                    </div>
                    <Badge
                      className={`text-xs ${
                        officer.status === "Available"
                          ? "bg-green-500 hover:bg-green-600"
                          : officer.status === "Responding"
                            ? "bg-yellow-500 hover:bg-yellow-600"
                            : "bg-blue-500 hover:bg-blue-600"
                      } text-white`}
                    >
                      {officer.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-xl bg-white/10 dark:bg-black/20 border border-white/20 dark:border-white/10 shadow-2xl rounded-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <FileText className="h-5 w-5" />
                Quick Actions
              </CardTitle>
              <CardDescription className="text-blue-200 dark:text-blue-300">
                Rapid response tools and reporting
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: FileText, label: "File e-FIR", color: "from-blue-500 to-blue-600" },
                  { icon: Camera, label: "Evidence Upload", color: "from-purple-500 to-purple-600" },
                  { icon: Radio, label: "Dispatch", color: "from-green-500 to-green-600" },
                  { icon: Navigation, label: "GPS Tracking", color: "from-yellow-500 to-yellow-600" },
                  { icon: Phone, label: "Emergency Call", color: "from-red-500 to-red-600" },
                  { icon: Search, label: "Tourist Lookup", color: "from-indigo-500 to-indigo-600" },
                ].map((action, index) => (
                  <Button
                    key={index}
                    className={`bg-gradient-to-r ${action.color} hover:scale-105 text-white border-0 h-16 flex-col gap-1 transition-all duration-300 shadow-lg`}
                  >
                    <action.icon className="h-5 w-5" />
                    <span className="text-xs">{action.label}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* e-FIR Quick Form */}
        <Card className="backdrop-blur-xl bg-white/10 dark:bg-black/20 border border-white/20 dark:border-white/10 shadow-2xl rounded-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <FileText className="h-5 w-5" />
              Quick e-FIR Filing
            </CardTitle>
            <CardDescription className="text-blue-200 dark:text-blue-300">
              Rapid incident reporting with voice-to-text support
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <Input
                  placeholder="Tourist ID"
                  className="bg-white/10 dark:bg-black/20 border-white/20 dark:border-white/10 text-white placeholder:text-blue-200 dark:placeholder:text-blue-300 focus:border-blue-400 dark:focus:border-blue-500"
                />
                <Input
                  placeholder="Incident Location"
                  className="bg-white/10 dark:bg-black/20 border-white/20 dark:border-white/10 text-white placeholder:text-blue-200 dark:placeholder:text-blue-300 focus:border-blue-400 dark:focus:border-blue-500"
                />
                <select className="w-full p-2 bg-white/10 dark:bg-black/20 border border-white/20 dark:border-white/10 rounded-md text-white focus:border-blue-400 dark:focus:border-blue-500 focus:outline-none">
                  <option value="" className="bg-slate-800 text-white">
                    Select Incident Type
                  </option>
                  <option value="theft" className="bg-slate-800 text-white">
                    Theft
                  </option>
                  <option value="assault" className="bg-slate-800 text-white">
                    Assault
                  </option>
                  <option value="fraud" className="bg-slate-800 text-white">
                    Fraud
                  </option>
                  <option value="lost" className="bg-slate-800 text-white">
                    Lost Property
                  </option>
                  <option value="medical" className="bg-slate-800 text-white">
                    Medical Emergency
                  </option>
                </select>
              </div>
              <div className="space-y-3">
                <Textarea
                  placeholder="Incident Description"
                  className="bg-white/10 dark:bg-black/20 border-white/20 dark:border-white/10 text-white placeholder:text-blue-200 dark:placeholder:text-blue-300 h-24 focus:border-blue-400 dark:focus:border-blue-500"
                />
                <div className="flex gap-2">
                  <Button className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white border-0 shadow-lg">
                    <FileText className="h-4 w-4 mr-2" />
                    File Report
                  </Button>
                  <Button
                    variant="outline"
                    className="text-white border-white/20 dark:border-white/10 bg-white/10 dark:bg-black/20 hover:bg-white/20 dark:hover:bg-black/30"
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    Add Evidence
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
