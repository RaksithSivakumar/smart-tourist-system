"use client"

import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { useAuth } from "@/components/auth-provider"
import {
  Shield, AlertTriangle, MapPin, Users, FileText, Phone, Camera, Clock, Navigation, Radio, LogOut, Search, Activity, TrendingUp, Zap, Maximize, Minimize, Bell, Menu, Settings, BarChart3, Target, Compass, Map, RadioIcon, UserCheck, ClipboardList
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
  const [isFullscreen, setIsFullscreen] = useState(false)
  const { theme, setTheme } = useTheme()
  const { logout: authLogout } = useAuth()
  const router = useRouter()
  
  // Placeholder user for display
  const [user] = useState({ name: "Rodriguez", id: "PD2024ALPHA" })
  
  const isDarkMode = theme === 'dark'
  
  const [activeIncidents] = useState<Incident[]>([
    { id: "INC-001", type: "SOS", priority: "High", location: "Times Square, NYC", time: "2 min ago", status: "Active", touristId: "TID-ABC123", description: "Tourist activated emergency SOS button." },
    { id: "INC-002", type: "Theft", priority: "Medium", location: "Central Park, NYC", time: "15 min ago", status: "Responding", touristId: "TID-DEF456", description: "Reported wallet theft near Bethesda Fountain." },
    { id: "INC-003", type: "Medical", priority: "High", location: "Brooklyn Bridge, NYC", time: "8 min ago", status: "Active", touristId: "TID-GHI789", description: "Tourist experiencing chest pain and shortness of breath." },
  ])

  const [officers] = useState([
    { id: "OFF-001", name: "Officer Johnson", status: "Available", location: "Midtown" },
    { id: "OFF-002", name: "Officer Smith", status: "Responding", location: "Times Square" },
    { id: "OFF-003", name: "Officer Davis", status: "On Patrol", location: "Central Park" },
  ])

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => console.error(err))
    } else {
      document.exitFullscreen()
    }
  }

  useEffect(() => {
    const handleFullScreenChange = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener("fullscreenchange", handleFullScreenChange)
    return () => document.removeEventListener("fullscreenchange", handleFullScreenChange)
  }, [])

  const handleLogout = () => {
    authLogout()
    router.push('/')
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High": return "bg-red-500 text-white"
      case "Medium": return "bg-amber-500 text-white"
      case "Low": return "bg-emerald-500 text-white"
      default: return "bg-gray-500 text-white"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active": return "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
      case "Responding": return "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
      case "Resolved": return "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
      default: return "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
    }
  }

  const getOfficerStatusColor = (status: string) => {
    switch (status) {
      case "Available": return "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
      case "Responding": return "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300"
      case "On Patrol": return "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
      default: return "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
    }
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'dark bg-gray-950' : 'bg-gray-100'}`}>
      {/* Header */}
      <header className={`sticky top-0 z-50 border-b transition-colors duration-300 ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
        <div className="flex items-center justify-between h-16 px-6">
          <div className="flex items-center space-x-4">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isDarkMode ? 'bg-blue-600' : 'bg-blue-500'}`}>
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Command Center
              </h1>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Officer {user?.name} • #{user?.id?.slice(0, 8).toUpperCase()}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Badge className={`${isDarkMode ? 'bg-green-800 text-green-200' : 'bg-green-100 text-green-800'}`}>
              <Activity className="w-3 h-3 mr-1" />
              ACTIVE
            </Badge>
            
            <Button variant="ghost" size="icon" className={`rounded-full ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}>
              <Bell className="h-5 w-5" />
            </Button>
            
            <ThemeToggle />
            
            <Button variant="ghost" size="icon" onClick={toggleFullScreen} className={`rounded-full ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}>
              {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
            </Button>
            
            <Button onClick={handleLogout} size="sm" className={`${isDarkMode ? 'bg-red-700 hover:bg-red-600' : 'bg-red-600 hover:bg-red-500'} text-white`}>
              <LogOut className="h-4 w-4 mr-1" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="p-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Critical Alerts", value: "3", icon: AlertTriangle, change: "+1", trend: "up", color: "red" },
            { label: "Active Officers", value: "12", icon: Shield, change: "+3", trend: "up", color: "blue" },
            { label: "Tourists Safe", value: "847", icon: Users, change: "+5.2%", trend: "up", color: "purple" },
            { label: "Response Time", value: "4.2m", icon: Clock, change: "-0.8m", trend: "down", color: "emerald" },
          ].map((stat, index) => (
            <Card key={index} className={`${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
              <CardContent className="p-5">
                <div className="flex justify-between items-start">
                  <div>
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{stat.label}</p>
                    <p className={`text-2xl font-bold mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{stat.value}</p>
                    <p className={`text-xs flex items-center mt-1 ${
                      stat.trend === 'up' ? (isDarkMode ? 'text-green-400' : 'text-green-600') : (isDarkMode ? 'text-red-400' : 'text-red-600')
                    }`}>
                      <TrendingUp className={`h-3 w-3 mr-1 ${stat.trend === 'down' ? 'rotate-180' : ''}`} />
                      {stat.change}
                    </p>
                  </div>
                  <div className={`p-3 rounded-lg ${isDarkMode ? `bg-${stat.color}-900/30` : `bg-${stat.color}-100`}`}>
                    <stat.icon className={`h-5 w-5 ${isDarkMode ? `text-${stat.color}-400` : `text-${stat.color}-600`}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map Section */}
          <div className="lg:col-span-2">
            <Card className={`h-full ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-lg">
                  <Map className="h-5 w-5 mr-2" />
                  Live Incident Map
                </CardTitle>
                <CardDescription>Real-time tracking of incidents and units</CardDescription>
              </CardHeader>
              <CardContent>
                <div className={`rounded-lg overflow-hidden h-80 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'}`}>
                  {/* Simplified Map Visualization */}
                  <div className="relative h-full bg-gradient-to-br from-blue-400/10 to-indigo-400/10">
                    {/* Grid pattern */}
                    <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
                    
                    {/* Incident markers */}
                    <div className="absolute top-1/4 left-1/3">
                      <div className="relative">
                        <div className="w-5 h-5 bg-red-500 rounded-full border-2 border-white shadow-lg"></div>
                        <div className="absolute -top-6 -left-4 bg-red-500 text-white text-xs px-2 py-1 rounded">
                          SOS
                        </div>
                      </div>
                    </div>
                    
                    <div className="absolute top-2/3 left-1/2">
                      <div className="relative">
                        <div className="w-5 h-5 bg-amber-500 rounded-full border-2 border-white shadow-lg"></div>
                        <div className="absolute -top-6 -left-6 bg-amber-500 text-white text-xs px-2 py-1 rounded">
                          Theft
                        </div>
                      </div>
                    </div>
                    
                    <div className="absolute top-1/2 left-2/3">
                      <div className="relative">
                        <div className="w-5 h-5 bg-red-500 rounded-full border-2 border-white shadow-lg"></div>
                        <div className="absolute -top-6 -left-10 bg-red-500 text-white text-xs px-2 py-1 rounded">
                          Medical
                        </div>
                      </div>
                    </div>
                    
                    {/* Officer markers */}
                    {[
                      { top: '30%', left: '40%', name: 'Unit 1' },
                      { top: '60%', left: '55%', name: 'Unit 2' },
                      { top: '45%', left: '25%', name: 'Unit 3' },
                    ].map((unit, i) => (
                      <div key={i} className={`absolute`} style={{ top: unit.top, left: unit.left }}>
                        <div className="relative">
                          <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg"></div>
                          <div className="absolute -top-5 -left-2 bg-blue-500 text-white text-xs px-1 py-0.5 rounded">
                            {unit.name}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Priority Incidents */}
          <div className="lg:col-span-1">
            <Card className={`h-full ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2 text-red-500" />
                  Priority Incidents
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-[340px] overflow-y-auto">
                  {activeIncidents.map((incident) => (
                    <div key={incident.id} className={`p-4 rounded-lg border ${isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                      <div className="flex justify-between items-start mb-2">
                        <Badge className={getPriorityColor(incident.priority)}>
                          {incident.priority}
                        </Badge>
                        <Badge variant="outline" className={getStatusColor(incident.status)}>
                          {incident.status}
                        </Badge>
                      </div>
                      <p className={`text-sm font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {incident.description}
                      </p>
                      <div className="flex justify-between text-xs">
                        <span className={`flex items-center ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          <MapPin className="h-3 w-3 mr-1" />
                          {incident.location}
                        </span>
                        <span className={`flex items-center ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          <Clock className="h-3 w-3 mr-1" />
                          {incident.time}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Officer Status & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Officer Status */}
          <Card className={`${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
            <CardHeader>
              <CardTitle className="flex items-center">
                <UserCheck className="h-5 w-5 mr-2" />
                Unit Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {officers.map((officer) => (
                  <div key={officer.id} className={`flex items-center justify-between p-3 rounded-lg ${isDarkMode ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-blue-800' : 'bg-blue-100'}`}>
                          <Shield className={`h-5 w-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                        </div>
                      </div>
                      <div>
                        <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{officer.name}</p>
                        <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          <MapPin className="h-3 w-3 inline mr-1" />
                          {officer.location}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className={getOfficerStatusColor(officer.status)}>
                      {officer.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          {/* Quick Actions */}
          <Card className={`${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Zap className="h-5 w-5 mr-2" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: FileText, label: "File Report", color: "blue" },
                  { icon: Camera, label: "Evidence", color: "purple" },
                  { icon: RadioIcon, label: "Dispatch", color: "green" },
                  { icon: Navigation, label: "GPS Track", color: "red" },
                ].map((action, index) => (
                  <Button key={index} variant="outline" className={`h-20 flex-col gap-2 ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50'}`}>
                    <action.icon className={`h-5 w-5 text-${action.color}-500`} />
                    <span className="text-xs">{action.label}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* e-FIR Section */}
        <Card className={`${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
          <CardHeader>
            <CardTitle className="flex items-center">
              <ClipboardList className="h-5 w-5 mr-2" />
              Quick e-FIR Filing
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tourist ID</label>
                  <Input placeholder="TID-ABC123" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Location</label>
                  <Input placeholder="Incident Location" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Incident Type</label>
                  <select className="w-full h-10 px-3 text-sm border rounded-md">
                    <option className="text-white">Select Incident Type</option>
                    <option className="text-black">Theft / Robbery</option>
                    <option className="text-black">Assault</option>
                    <option className="text-black">Lost Property</option>
                    <option className="text-black">Medical Emergency</option>
                  </select>
                </div>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <Textarea placeholder="Provide detailed incident description..." className="h-32" />
                </div>
                <div className="flex gap-3">
                  <Button className="flex-1">
                    <FileText className="h-4 w-4 mr-2" />
                    Submit
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Camera className="h-4 w-4 mr-2" />
                    Attach
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}