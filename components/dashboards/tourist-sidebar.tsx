"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  AlertTriangle, Clock, Locate, MapPin, MessageSquare, Navigation, Route, Shield, User
} from "lucide-react"

export interface ChatMessage {
  id: string
  text: string
  sender: "user" | "support"
  timestamp: Date
}

export interface RouteSuggestion {
  id: string
  name: string
  start: string
  end: string
  distance: string
  time: string
  safety: number
  type: "walking" | "driving" | "public"
  coordinates: {
    start: [number, number]
    end: [number, number]
    waypoints: [number, number][]
  }
}

interface TouristSidebarProps {
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  activeTab: "chat" | "routes"
  setActiveTab: (tab: "chat" | "routes") => void

  message: string
  setMessage: (v: string) => void
  messages: ChatMessage[]
  handleSendMessage: () => void

  startLocation: string
  setStartLocation: (v: string) => void
  endLocation: string
  setEndLocation: (v: string) => void
  popularDestinations: { name: string; coordinates: [number, number] }[]
  handleFindRoutes: () => Promise<void> | void
  routeSuggestions: RouteSuggestion[]
  isNavigating: boolean
  selectedRoute: RouteSuggestion | null
  handleStartNavigation: (route: RouteSuggestion) => void
  handleStopNavigation: () => void

  formatTime: (d: Date) => string
  getRouteIcon: (type: string) => JSX.Element
  getRouteColor: (type: string) => string
  onOlSearch: (q: string) => void
  olLocationData: any | null
}

export function TouristSidebar(props: TouristSidebarProps) {
  const {
    sidebarOpen,
    setSidebarOpen,
    activeTab,
    setActiveTab,
    message,
    setMessage,
    messages,
    handleSendMessage,
    startLocation,
    setStartLocation,
    endLocation,
    setEndLocation,
    popularDestinations,
    handleFindRoutes,
    routeSuggestions,
    isNavigating,
    selectedRoute,
    handleStartNavigation,
    handleStopNavigation,
    formatTime,
    getRouteIcon,
    getRouteColor,
    onOlSearch,
    olLocationData,
  } = props

  const [olQuery, setOlQuery] = useState("")

  return (
    <div className={`fixed top-0 left-0 h-full bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-700 transition-all duration-300 z-10 ${sidebarOpen ? 'w-80' : 'w-0'} overflow-hidden`}>
      <div className="p-4 border-b border-gray-200 dark:border-slate-700">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Tourist Assistant</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(false)}
            className="h-8 w-8"
          >
            {/* X icon is minimal; using unicode to avoid extra import */}
            ✕
          </Button>
        </div>
        <div className="flex mt-4 space-x-2">
          <Button
            variant={activeTab === "chat" ? "default" : "outline"}
            className="flex-1"
            onClick={() => { setSidebarOpen(true); setActiveTab("chat") }}
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            Chat
          </Button>
          <Button
            variant={activeTab === "routes" ? "default" : "outline"}
            className="flex-1"
            onClick={() => setActiveTab("routes")}
          >
            <Route className="h-4 w-4 mr-2" />
            Routes
          </Button>
        </div>
      </div>

      {activeTab === "chat" ? (
        <div className="flex flex-col h-[calc(100vh-140px)]">
          <ScrollArea className="flex-1 p-4 min-h-0">
            <div className="space-y-4">
              {/* OLMap Search Bar */}
              <div className="mt-4">
                <label className="text-sm font-medium">Discover Food Streets</label>
                <div className="flex items-center mt-2 space-x-2">
                  <Input
                    placeholder="City or place..."
                    value={olQuery}
                    onChange={(e) => setOlQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && onOlSearch(olQuery)}
                  />
                  <Button onClick={() => onOlSearch(olQuery)} className="shrink-0">Search</Button>
                </div>
              </div>

              {/* Enhanced Sidebar content inside sidebar */}
              {olLocationData && (
                <div className="mt-4 space-y-3">
                  <div className="relative h-32 rounded-lg overflow-hidden bg-gradient-to-br from-orange-400 to-red-500">
                    {olLocationData.imageUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={olLocationData.imageUrl} alt={olLocationData.title} className="absolute inset-0 w-full h-full object-cover" />
                    )}
                    <div className="absolute inset-0 bg-black/30" />
                    <div className="absolute bottom-2 left-3 text-white">
                      <h3 className="font-semibold text-sm">{olLocationData.title}</h3>
                      <p className="text-xs opacity-90">{olLocationData.country} • {olLocationData.currency}</p>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs text-gray-700 dark:text-gray-300">
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
                      <p><strong>City:</strong> {olLocationData.city}</p>
                      <p><strong>Language:</strong> {olLocationData.language}</p>
                      <p><strong>Coordinates:</strong> {olLocationData.coordinates[0]}, {olLocationData.coordinates[1]}</p>
                    </div>

                    <div className="bg-green-50 dark:bg-green-900/20 p-2 rounded">
                      <p className="mb-1"><strong>Food Streets:</strong> {olLocationData.famousFoodStreets?.length || 0}</p>
                      <div className="space-y-1 max-h-40 overflow-auto pr-1">
                        {olLocationData.famousFoodStreets?.slice(0, 3).map((street: any, idx: number) => (
                          <div key={idx} className="border rounded p-2">
                            <p className="font-medium text-gray-800 dark:text-gray-100 text-xs">{street.name}</p>
                            <p className="text-[11px] text-gray-600 dark:text-gray-400 line-clamp-2">{street.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {olLocationData.localRestrictions && olLocationData.localRestrictions.length > 0 && (
                      <div className="bg-red-50 dark:bg-red-900/20 p-2 rounded">
                        <p className="font-medium">Local Rules</p>
                        <ul className="list-disc list-inside text-[11px]">
                          {olLocationData.localRestrictions.slice(0, 3).map((r: any, i: number) => (
                            <li key={i}>{r.category}: {r.restriction}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

        </div>
      ) : (
        <ScrollArea className="h-[calc(100vh-140px)] p-4">
          <div className="space-y-4">
            <Card>
              <CardContent className="p-4 space-y-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Start Location</label>
                  <div className="flex items-center space-x-2">
                    <Input
                      value={startLocation}
                      onChange={(e) => setStartLocation(e.target.value)}
                      placeholder="Enter start location"
                    />
                    <Button size="icon" variant="outline" className="h-10 w-10" onClick={() => setStartLocation("Current Location")}>
                      <Locate className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Destination</label>
                  <div className="relative">
                    <Input
                      value={endLocation}
                      onChange={(e) => setEndLocation(e.target.value)}
                      placeholder="Enter destination"
                      list="destinations"
                    />
                    <datalist id="destinations">
                      {popularDestinations.map((dest) => (
                        <option key={dest.name} value={dest.name} />
                      ))}
                    </datalist>
                  </div>
                </div>

                <Button 
                  onClick={handleFindRoutes} 
                  className="w-full"
                  disabled={!endLocation || !startLocation}
                >
                  <Navigation className="h-4 w-4 mr-2" />
                  Find Routes
                </Button>
              </CardContent>
            </Card>

            {isNavigating && selectedRoute && (
              <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-blue-800 dark:text-blue-200">Active Navigation</h3>
                    <Badge className="bg-blue-500 text-white">Live</Badge>
                  </div>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
                    Navigating to {selectedRoute.end}
                  </p>
                  <div className="flex items-center space-x-2 text-xs text-blue-600 dark:text-blue-400">
                    <Clock className="h-3 w-3" />
                    <span>{selectedRoute.time}</span>
                    <MapPin className="h-3 w-3 ml-2" />
                    <span>{selectedRoute.distance}</span>
                  </div>
                  <Button 
                    onClick={handleStopNavigation} 
                    variant="outline" 
                    size="sm" 
                    className="w-full mt-3 border-blue-300 text-blue-700 dark:text-blue-300"
                  >
                    Stop Navigation
                  </Button>
                </CardContent>
              </Card>
            )}

            {routeSuggestions.map((route) => (
              <Card key={route.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-sm mb-2">{route.name}</h3>
                      <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                        <div className="flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {route.distance}
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {route.time}
                        </div>
                        <div className="flex items-center">
                          <Shield className="h-3 w-3 mr-1" />
                          {route.safety}% safe
                        </div>
                      </div>
                    </div>
                    <Badge className={getRouteColor(route.type)}>
                      {getRouteIcon(route.type)}
                    </Badge>
                  </div>
                  <Button 
                    className="w-full mt-3" 
                    size="sm"
                    onClick={() => handleStartNavigation(route)}
                    disabled={isNavigating}
                  >
                    <Navigation className="h-4 w-4 mr-2" />
                    {isNavigating ? "Navigation Active" : "Start Navigation"}
                  </Button>
                </CardContent>
              </Card>
            ))}

            <div className="mt-6">
              <h4 className="text-sm font-medium mb-3">Popular Destinations</h4>
              <div className="space-y-2">
                {popularDestinations.map((destination) => (
                  <Button
                    key={destination.name}
                    variant="outline"
                    size="sm"
                    className="w-full justify-start text-xs"
                    onClick={() => {
                      setEndLocation(destination.name);
                    }}
                  >
                    <MapPin className="h-3 w-3 mr-2" />
                    {destination.name}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>
      )}
    </div>
  )
}

export default TouristSidebar


