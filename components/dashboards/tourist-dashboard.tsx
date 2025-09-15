"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useAuth } from "@/components/auth-provider"
import { BlockchainVerification } from "@/components/advanced/blockchain-verification"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { 
  MapPin, Shield, AlertTriangle, Phone, FileText, Heart, Navigation, 
  Camera, LogOut, MessageSquare, Route, X, Send, Map, User, Clock,
  Search, Locate, Navigation as NavigationIcon
} from "lucide-react"
import dynamic from 'next/dynamic'

// Dynamically import the map component to avoid SSR issues
const InteractiveMap = dynamic(() => import('@/components/interactive-map').then(mod => ({ default: mod.InteractiveMap })), {
  ssr: false,
  loading: () => (
    <div className="w-full h-96 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
      <p className="text-gray-500 dark:text-gray-400">Loading map...</p>
    </div>
  )
})

// Chat message interface
interface ChatMessage {
  id: string
  text: string
  sender: "user" | "support"
  timestamp: Date
}

// Route suggestion interface
interface RouteSuggestion {
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

export function TouristDashboard() {
  const { user, logout } = useAuth()
  const [safetyScore] = useState(85)
  const [sosActive, setSosActive] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeTab, setActiveTab] = useState<"chat" | "routes">("chat")
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      text: "Hello! Welcome to SafeTourist support. How can I help you today?",
      sender: "support",
      timestamp: new Date(Date.now() - 1000 * 60 * 2)
    }
  ])

  const [startLocation, setStartLocation] = useState("Sathyamangalam")
  const [endLocation, setEndLocation] = useState("Erode")
  const [routeSuggestions, setRouteSuggestions] = useState<RouteSuggestion[]>([])
  const [selectedRoute, setSelectedRoute] = useState<RouteSuggestion | null>(null)
  const [isNavigating, setIsNavigating] = useState(false)
  const mapRef = useRef<any>(null)

  const popularDestinations = [
    { name: "Erode", coordinates: [77.7230, 11.3410] as [number, number] },
    { name: "Coimbatore", coordinates: [76.9558, 11.0168] as [number, number] },
    { name: "Salem", coordinates: [78.1460, 11.6643] as [number, number] },
    { name: "Tiruppur", coordinates: [77.3411, 11.1085] as [number, number] },
  ]
    
  // --- NEW: Function to get coordinates from a location name using Mapbox Geocoding API ---
  const getCoordinates = async (locationName: string): Promise<[number, number] | null> => {
    if (locationName.toLowerCase() === 'current location') {
        return new Promise((resolve) => {
            navigator.geolocation.getCurrentPosition(
                (position) => resolve([position.coords.longitude, position.coords.latitude]),
                () => resolve(null) // Handle location denial
            );
        });
    }
    const accessToken = process.env.NEXT_PUBLIC_MAPBOX_API_KEY || "pk.eyJ1Ijoic21pbGVlZSIsImEiOiJjbThuejMzMjIwNHJvMmpzNXd6MXNtZnM4In0.rsQhRY5hN4lS3SeCL0ZXRA";
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(locationName)}.json?access_token=${accessToken}&limit=1`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        if (data.features && data.features.length > 0) {
            return data.features[0].center; // [longitude, latitude]
        }
        return null;
    } catch (error) {
        console.error("Error fetching coordinates:", error);
        return null;
    }
  };

  // --- MODIFIED: Function to fetch real routes from Mapbox ---
  const handleFindRoutes = async () => {
    if (!endLocation || !startLocation) return;

    // 1. Get coordinates for start and end locations
    const startCoords = await getCoordinates(startLocation);
    const endCoords = await getCoordinates(endLocation);

    if (!startCoords || !endCoords) {
        alert("Could not find coordinates for the specified locations. Please try again.");
        return;
    }

    // 2. Fetch different route types from Mapbox Directions API
    const profiles = ['driving-traffic', 'walking', 'driving'];
    const newRoutes: RouteSuggestion[] = [];

    for (const profile of profiles) {
        const accessToken = process.env.NEXT_PUBLIC_MAPBOX_API_KEY || "pk.eyJ1Ijoic21pbGVlZSIsImEiOiJjbThuejMzMjIwNHJvMmpzNXd6MXNtZnM4In0.rsQhRY5hN4lS3SeCL0ZXRA";
        const url = `https://api.mapbox.com/directions/v5/mapbox/${profile}/${startCoords.join(',')};${endCoords.join(',')}?geometries=geojson&access_token=${accessToken}`;
        
        try {
            const response = await fetch(url);
            const data = await response.json();
            if (data.routes && data.routes.length > 0) {
                const route = data.routes[0];
                const routeType = profile === 'walking' ? 'walking' : (profile === 'driving' ? 'driving' : 'public');
                
                newRoutes.push({
                    id: `${profile}-${Date.now()}`,
                    name: `${routeType.charAt(0).toUpperCase() + routeType.slice(1)} Route to ${endLocation}`,
                    start: startLocation,
                    end: endLocation,
                    distance: `${(route.distance / 1000).toFixed(1)} km`,
                    time: `${Math.round(route.duration / 60)} min`,
                    safety: Math.floor(Math.random() * 15 + 80), // Keep random safety for now
                    type: routeType,
                    coordinates: {
                        start: startCoords,
                        end: endCoords,
                        waypoints: [] // Waypoints can be added here if needed
                    }
                });
            }
        } catch (error) {
            console.error(`Error fetching ${profile} route:`, error);
        }
    }
    setRouteSuggestions(newRoutes);
  };
    
  useEffect(() => {
    const handleMapReady = (mapInstance: any) => {
      mapRef.current = mapInstance
    }
    window.addEventListener('mapReady', handleMapReady as EventListener)
    return () => {
      window.removeEventListener('mapReady', handleMapReady as EventListener)
    }
  }, [])

  const handleSOS = () => {
    setSosActive(true)
    setTimeout(() => setSosActive(false), 3000)
  }

  const handleSendMessage = () => {
    if (message.trim()) {
      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        text: message,
        sender: "user",
        timestamp: new Date()
      }
      setMessages([...messages, newMessage])
      setMessage("")
      setTimeout(() => {
        const supportResponse: ChatMessage = {
          id: Date.now().toString(),
          text: "Thank you for your message. Our support team will get back to you shortly.",
          sender: "support",
          timestamp: new Date()
        }
        setMessages(prev => [...prev, supportResponse])
      }, 2000)
    }
  }

  const handleStartNavigation = (route: RouteSuggestion) => {
    setSelectedRoute(route)
    setIsNavigating(true)
    const routeEvent = new CustomEvent('showRoute', {
      detail: route.coordinates
    })
    window.dispatchEvent(routeEvent)
  }

  const handleStopNavigation = () => {
    setIsNavigating(false)
    setSelectedRoute(null)
    window.dispatchEvent(new CustomEvent('clearRoute'))
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const getRouteIcon = (type: string) => {
    switch (type) {
      case "walking":
        return <User className="h-4 w-4" />
      case "driving":
      case "public":
        return <NavigationIcon className="h-4 w-4" />
      default:
        return <Route className="h-4 w-4" />
    }
  }

  const getRouteColor = (type: string) => {
    switch (type) {
      case "walking":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "driving":
         return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "public":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  // --- UI and the rest of the component remains the same ---
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-cyan-50 dark:from-slate-900 dark:to-slate-800 flex">
      {/* Fixed Sidebar */}
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
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex mt-4 space-x-2">
            <Button
              variant={activeTab === "chat" ? "default" : "outline"}
              className="flex-1"
              onClick={() => setActiveTab("chat")}
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
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-xs rounded-lg p-3 ${
                        msg.sender === "user"
                          ? "bg-blue-500 text-white"
                          : "bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-white"
                      }`}
                    >
                      <p className="text-sm">{msg.text}</p>
                      <p className={`text-xs mt-1 ${msg.sender === "user" ? "text-blue-100" : "text-gray-500"}`}>
                        {formatTime(msg.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <div className="p-4 border-t border-gray-200 dark:border-slate-700 flex-shrink-0 bg-white dark:bg-slate-900 sticky bottom-0 shadow-lg">
              <div className="flex space-x-2">
                <Input
                  placeholder="Type your message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1 h-10 border-2 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
                />
                <Button onClick={handleSendMessage} size="icon" className="h-10 w-10 bg-blue-500 hover:bg-blue-600">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <ScrollArea className="h-[calc(100vh-140px)] p-4">
            <div className="space-y-4">
              {/* Route Input Form */}
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
                    <Search className="h-4 w-4 mr-2" />
                    Find Routes
                  </Button>
                </CardContent>
              </Card>

              {/* Navigation Status */}
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
                      <X className="h-3 w-3 mr-1" />
                      Stop Navigation
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Route Suggestions */}
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

              {/* Popular Destinations */}
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

      {/* Main Content with margin for sidebar */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'ml-80' : 'ml-0'}`}>
        {/* Header */}
        <header className="backdrop-blur-xl bg-white/10 dark:bg-black/20 border border-white/20 dark:border-white/10 shadow-2xl rounded-xl m-4 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {!sidebarOpen && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setSidebarOpen(true)}
                  className="h-10 w-10"
                >
                  <MessageSquare className="h-5 w-5" />
                </Button>
              )}
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-sky-400 to-cyan-500 flex items-center justify-center">
                <span className="text-white font-bold text-lg">{user?.tourist?.name?.charAt(0).toUpperCase()}</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Welcome, {user?.tourist?.name}</h1>
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

        <div className="p-4 space-y-6 flex-1 overflow-auto">
          {/* Interactive Map Section */}
          <Card className="bg-white/10 dark:bg-black/20 border border-white/20 dark:border-white/10 shadow-2xl rounded-xl full-w">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Live Safety Map & Navigation
                {isNavigating && (
                  <Badge variant="secondary" className="bg-green-500 text-white ml-2">
                    <Navigation className="h-3 w-3 mr-1" />
                    Navigating
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                {isNavigating && selectedRoute 
                  ? `Navigating to ${selectedRoute.end} - ${selectedRoute.distance} remaining` 
                  : "Real-time location tracking, safety zones, and emergency services"
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <InteractiveMap 
                selectedRoute={selectedRoute}
                isNavigating={isNavigating}
              />
            </CardContent>
          </Card>

          {/* Rest of the dashboard content remains the same */}
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
    </div>
  )
}