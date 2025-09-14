"use client"

import { useEffect, useRef, useState } from "react"
import { MapPin, Navigation, Shield, AlertTriangle, Phone, Plane, Building2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface MapMarker {
  id: string
  type: "tourist" | "police" | "hospital" | "embassy" | "hotel" | "airport"
  position: [number, number]
  title: string
  status?: string
  safetyScore?: number
}

export function InteractiveMap() {
  const mapRef = useRef<HTMLDivElement>(null)
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null)
  const [selectedMarker, setSelectedMarker] = useState<MapMarker | null>(null)
  const [mapTheme, setMapTheme] = useState<"light" | "dark">("light")
  const [sosActive, setSosActive] = useState(false)

  // Sample markers data
  const markers: MapMarker[] = [
    { id: "1", type: "tourist", position: [28.6139, 77.209], title: "Your Location", status: "Safe", safetyScore: 95 },
    { id: "2", type: "police", position: [28.6129, 77.229], title: "Delhi Police Station", status: "Active" },
    { id: "3", type: "hospital", position: [28.6339, 77.219], title: "AIIMS Hospital", status: "Emergency Ready" },
    { id: "4", type: "embassy", position: [28.5939, 77.249], title: "US Embassy", status: "Open" },
    { id: "5", type: "hotel", position: [28.6239, 77.199], title: "The Imperial Hotel", status: "Check-in Available" },
    { id: "6", type: "airport", position: [28.5562, 77.1], title: "IGI Airport Terminal 3", status: "Flight On Time" },
  ]

  useEffect(() => {
    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude])
        },
        (error) => {
          console.log("Location access denied")
          setUserLocation([28.6139, 77.209]) // Default to Delhi
        },
      )
    }

    // Auto-update location every 5 seconds
    const locationInterval = setInterval(() => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude])
        })
      }
    }, 5000)

    return () => clearInterval(locationInterval)
  }, [])

  const getMarkerIcon = (type: string) => {
    switch (type) {
      case "tourist":
        return <MapPin className="w-6 h-6 text-cyan-400" />
      case "police":
        return <Shield className="w-6 h-6 text-blue-400" />
      case "hospital":
        return <AlertTriangle className="w-6 h-6 text-red-400" />
      case "embassy":
        return <Phone className="w-6 h-6 text-green-400" />
      case "hotel":
        return <Building2 className="w-6 h-6 text-orange-400" />
      case "airport":
        return <Plane className="w-6 h-6 text-indigo-400" />
      default:
        return <MapPin className="w-6 h-6 text-gray-400" />
    }
  }

  const getMarkerColor = (type: string) => {
    switch (type) {
      case "tourist":
        return "from-cyan-400 to-blue-500"
      case "police":
        return "from-blue-500 to-indigo-600"
      case "hospital":
        return "from-red-400 to-red-600"
      case "embassy":
        return "from-green-400 to-emerald-600"
      case "hotel":
        return "from-orange-400 to-amber-600"
      case "airport":
        return "from-indigo-400 to-purple-600"
      default:
        return "from-gray-400 to-gray-600"
    }
  }

  const handleSOS = () => {
    setSosActive(!sosActive)
    // In a real app, this would send emergency alerts
    console.log("SOS Alert:", sosActive ? "Deactivated" : "Activated")
  }

  return (
    <div className="relative w-full h-[600px] rounded-xl overflow-hidden backdrop-blur-xl bg-white/10 dark:bg-black/20 border border-white/20 dark:border-white/10">
      {/* Map Container */}
      <div
        ref={mapRef}
        className={`w-full h-full relative ${mapTheme === "dark" ? "bg-gray-900" : "bg-blue-50"} transition-colors duration-300`}
        style={{
          backgroundImage:
            mapTheme === "dark"
              ? "radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.1) 0%, rgba(17, 24, 39, 1) 100%)"
              : "radial-gradient(circle at 50% 50%, rgba(147, 197, 253, 0.2) 0%, rgba(239, 246, 255, 1) 100%)",
        }}
      >
        {/* Map Grid Overlay */}
        <div className="absolute inset-0 opacity-20">
          <svg width="100%" height="100%">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path
                  d="M 40 0 L 0 0 0 40"
                  fill="none"
                  stroke={mapTheme === "dark" ? "#374151" : "#9CA3AF"}
                  strokeWidth="1"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Safety Zones */}
        <div className="absolute inset-0">
          {/* Safe Zone */}
          <div className="absolute top-1/4 left-1/4 w-48 h-48 rounded-full bg-green-400/20 dark:bg-green-400/10 border-2 border-green-400/40 animate-pulse" />
          {/* Risk Zone */}
          <div className="absolute bottom-1/4 right-1/4 w-32 h-32 rounded-full bg-red-400/20 dark:bg-red-400/10 border-2 border-red-400/40 animate-pulse" />
        </div>

        {/* Markers */}
        {markers.map((marker) => (
          <div
            key={marker.id}
            className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-300 hover:scale-110 ${
              marker.type === "tourist" && sosActive ? "animate-ping" : ""
            }`}
            style={{
              left: `${20 + markers.indexOf(marker) * 15}%`,
              top: `${30 + markers.indexOf(marker) * 10}%`,
            }}
            onClick={() => setSelectedMarker(marker)}
          >
            <div
              className={`w-12 h-12 rounded-full bg-gradient-to-br ${getMarkerColor(marker.type)} flex items-center justify-center shadow-lg ${
                sosActive && marker.type === "tourist" ? "ring-4 ring-red-500 ring-opacity-75" : ""
              }`}
            >
              {getMarkerIcon(marker.type)}
            </div>
            {marker.type === "tourist" && (
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                <div className="w-4 h-4 bg-green-400 rounded-full animate-pulse" />
              </div>
            )}
          </div>
        ))}

        {/* Route Lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <path
            d="M 20% 30% Q 40% 20% 60% 40%"
            stroke="rgba(34, 197, 94, 0.6)"
            strokeWidth="3"
            fill="none"
            strokeDasharray="10,5"
            className="animate-pulse"
          />
        </svg>
      </div>

      {/* Map Controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <Button
          size="icon"
          onClick={() => setMapTheme(mapTheme === "light" ? "dark" : "light")}
          className="backdrop-blur-xl bg-white/20 dark:bg-black/30 border border-white/30 hover:bg-white/30 dark:hover:bg-black/40"
        >
          {mapTheme === "light" ? "🌙" : "☀️"}
        </Button>
        <Button
          size="icon"
          className="backdrop-blur-xl bg-white/20 dark:bg-black/30 border border-white/30 hover:bg-white/30 dark:hover:bg-black/40"
        >
          <Navigation className="w-4 h-4" />
        </Button>
      </div>

      {/* SOS Button */}
      <div className="absolute bottom-4 right-4">
        <Button
          onClick={handleSOS}
          className={`w-16 h-16 rounded-full text-white font-bold text-lg transition-all duration-300 ${
            sosActive
              ? "bg-red-600 hover:bg-red-700 animate-pulse ring-4 ring-red-500 ring-opacity-50"
              : "bg-red-500 hover:bg-red-600"
          }`}
        >
          SOS
        </Button>
      </div>

      {/* Layer Toggle */}
      <div className="absolute top-4 left-4">
        <Card className="backdrop-blur-xl bg-white/10 dark:bg-black/20 border border-white/20 dark:border-white/10 p-2">
          <div className="flex flex-col gap-1 text-xs">
            <Badge variant="secondary" className="bg-green-400/20 text-green-700 dark:text-green-300">
              Safe Zones
            </Badge>
            <Badge variant="secondary" className="bg-red-400/20 text-red-700 dark:text-red-300">
              Risk Areas
            </Badge>
            <Badge variant="secondary" className="bg-blue-400/20 text-blue-700 dark:text-blue-300">
              Emergency Services
            </Badge>
          </div>
        </Card>
      </div>

      {/* Marker Popup */}
      {selectedMarker && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
          <Card className="backdrop-blur-xl bg-white/90 dark:bg-black/80 border border-white/30 dark:border-white/20 p-4 min-w-[250px]">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-900 dark:text-white">{selectedMarker.title}</h3>
              <Button size="sm" variant="ghost" onClick={() => setSelectedMarker(null)} className="h-6 w-6 p-0">
                ×
              </Button>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                {getMarkerIcon(selectedMarker.type)}
                <span className="text-sm text-gray-600 dark:text-gray-300 capitalize">{selectedMarker.type}</span>
              </div>
              {selectedMarker.status && (
                <Badge variant="outline" className="text-xs">
                  {selectedMarker.status}
                </Badge>
              )}
              {selectedMarker.safetyScore && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-600 dark:text-gray-300">Safety Score:</span>
                  <Badge variant="secondary" className="bg-green-400/20 text-green-700 dark:text-green-300">
                    {selectedMarker.safetyScore}%
                  </Badge>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Weather Alert */}
      <div className="absolute bottom-4 left-4">
        <Card className="backdrop-blur-xl bg-amber-400/20 dark:bg-amber-400/10 border border-amber-400/30 p-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span className="text-xs text-amber-800 dark:text-amber-200">Weather Alert: Light Rain Expected</span>
          </div>
        </Card>
      </div>
    </div>
  )
}
