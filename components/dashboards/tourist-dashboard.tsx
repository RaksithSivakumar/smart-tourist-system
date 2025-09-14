"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/components/auth-provider"
import { BlockchainVerification } from "@/components/advanced/blockchain-verification"
import { InteractiveMap } from "@/components/interactive-map"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { MapPin, Shield, AlertTriangle, Phone, FileText, Heart, Navigation, Camera, LogOut } from "lucide-react"

export function TouristDashboard() {
  const { user, logout } = useAuth()
  const [safetyScore] = useState(85)
  const [sosActive, setSosActive] = useState(false)

  const handleSOS = () => {
    setSosActive(true)
    // Simulate SOS activation
    setTimeout(() => setSosActive(false), 3000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-cyan-50 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="backdrop-blur-xl bg-white/10 dark:bg-black/20 border border-white/20 dark:border-white/10 shadow-2xl rounded-xl m-4 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-sky-400 to-cyan-500 flex items-center justify-center">
              <span className="text-white font-bold text-lg">{user?.name?.charAt(0).toUpperCase()}</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Welcome, {user?.name}</h1>
              <p className="text-sm text-gray-600 dark:text-gray-300">Tourist Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button
              variant="outline"
              onClick={logout}
              className="backdrop-blur-xl bg-white/10 dark:bg-black/20 border border-white/20 dark:border-white/10 hover:bg-white/20 dark:hover:bg-black/30"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="p-4 space-y-6">
        {/* Interactive Map Section */}
        <Card className="backdrop-blur-xl bg-white/10 dark:bg-black/20 border border-white/20 dark:border-white/10 shadow-2xl rounded-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Live Safety Map & Navigation
            </CardTitle>
            <CardDescription>Real-time location tracking, safety zones, and emergency services</CardDescription>
          </CardHeader>
          <CardContent>
            <InteractiveMap />
          </CardContent>
        </Card>

        {/* Digital ID & SOS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="backdrop-blur-xl bg-white/10 dark:bg-black/20 border border-white/20 dark:border-white/10 shadow-2xl rounded-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Digital Tourist ID
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700 dark:text-gray-300">Status</span>
                  <Badge variant="default" className="bg-green-500 hover:bg-green-600">
                    Verified
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700 dark:text-gray-300">ID Number</span>
                  <span className="font-mono text-gray-900 dark:text-white">
                    TID-{user?.id?.slice(0, 6).toUpperCase()}
                  </span>
                </div>
                <div className="w-full h-32 bg-gradient-to-r from-sky-400 to-cyan-400 dark:from-sky-600 dark:to-cyan-600 rounded-lg flex items-center justify-center">
                  <div className="text-center text-white">
                    <div className="w-16 h-16 bg-white/20 rounded-full mx-auto mb-2 flex items-center justify-center">
                      <Camera className="h-8 w-8" />
                    </div>
                    <p className="text-sm">QR Code</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-xl bg-white/10 dark:bg-black/20 border border-white/20 dark:border-white/10 shadow-2xl rounded-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Safety Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-500 dark:text-green-400">{safetyScore}%</div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Safety Score</p>
                </div>
                <Button
                  className={`w-full ${sosActive ? "bg-red-600 animate-pulse" : "bg-red-500 hover:bg-red-600"} text-white`}
                  onClick={handleSOS}
                  disabled={sosActive}
                >
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  {sosActive ? "SOS ACTIVATED" : "EMERGENCY SOS"}
                </Button>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 backdrop-blur-xl bg-white/10 dark:bg-black/20 border border-white/20 dark:border-white/10 hover:bg-white/20 dark:hover:bg-black/30"
                  >
                    <Phone className="h-4 w-4 mr-1" />
                    Police
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 backdrop-blur-xl bg-white/10 dark:bg-black/20 border border-white/20 dark:border-white/10 hover:bg-white/20 dark:hover:bg-black/30"
                  >
                    <Heart className="h-4 w-4 mr-1" />
                    Medical
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Location & Navigation */}
        <Card className="backdrop-blur-xl bg-white/10 dark:bg-black/20 border border-white/20 dark:border-white/10 shadow-2xl rounded-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Navigation className="h-5 w-5" />
              Smart Navigation & Route Planning
            </CardTitle>
            <CardDescription>AI-powered safe route recommendations and real-time updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-900 dark:text-white">Current Location</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">Times Square, New York, NY</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Last updated: 2 minutes ago</p>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-green-600 dark:text-green-400">Live Tracking Active</span>
                </div>
              </div>
              <div className="space-y-2">
                <Button className="w-full bg-gradient-to-r from-sky-400 to-cyan-500 hover:from-sky-500 hover:to-cyan-600 text-white border-0">
                  <Navigation className="h-4 w-4 mr-2" />
                  Get Safe Route
                </Button>
                <Button
                  variant="outline"
                  className="w-full backdrop-blur-xl bg-white/10 dark:bg-black/20 border border-white/20 dark:border-white/10 hover:bg-white/20 dark:hover:bg-black/30"
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  Share Location
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Blockchain Verification */}
        <BlockchainVerification />

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: FileText, label: "Travel Docs", color: "from-blue-500 to-blue-600" },
            { icon: Heart, label: "Health Info", color: "from-red-500 to-red-600" },
            { icon: Phone, label: "Contacts", color: "from-green-500 to-green-600" },
            { icon: AlertTriangle, label: "Alerts", color: "from-yellow-500 to-yellow-600" },
          ].map((action, index) => (
            <Card
              key={index}
              className="backdrop-blur-xl bg-white/10 dark:bg-black/20 border border-white/20 dark:border-white/10 shadow-2xl rounded-xl cursor-pointer hover:scale-105 transition-all duration-300 hover:bg-white/20 dark:hover:bg-black/30"
            >
              <CardContent className="p-4 text-center">
                <div
                  className={`w-12 h-12 bg-gradient-to-r ${action.color} rounded-full mx-auto mb-2 flex items-center justify-center shadow-lg`}
                >
                  <action.icon className="h-6 w-6 text-white" />
                </div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{action.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
