"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from 'next/navigation'
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
import TouristSidebar from "@/components/dashboards/tourist-sidebar"
import dynamic from 'next/dynamic'
import mapboxgl from "mapbox-gl"
import "mapbox-gl/dist/mapbox-gl.css"
import Image from "next/image"

// Set Mapbox access token
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || ''

// Dynamically import the interactive map component to avoid SSR issues
const InteractiveMap = dynamic(() => import('@/components/interactive-map').then(mod => ({ default: mod.InteractiveMap })), {
  ssr: false,
  loading: () => (
    <div className="w-full h-96 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
      <p className="text-gray-500 dark:text-gray-400">Loading map...</p>
    </div>
  )
})

// Food map interfaces
interface FoodStore {
  name: string;
  address: string;
  specialty: string;
  priceRange: string;
  googleMapsUrl?: string;
  website?: string;
}

interface FoodStreet {
  name: string;
  description: string;
  popularDishes: string[];
  bestTimeToVisit: string;
  topStores: FoodStore[];
}

interface LocalRestriction {
  category: string;
  restriction: string;
  penalty: string;
}

interface EnhancedLocationData {
  coordinates: [number, number];
  title: string;
  country: string;
  city: string;
  famousFoodStreets: FoodStreet[];
  localRestrictions: LocalRestriction[];
  culturalTips: string[];
  currency: string;
  language: string;
  imageUrl?: string;
}

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

// Food Map Loader Component
const FoodMapLoader = () => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[20000]">
    <div className="bg-white p-6 rounded-lg shadow-xl">
      <div className="flex items-center space-x-3">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="text-lg font-medium">Discovering amazing food spots...</span>
      </div>
    </div>
  </div>
);

// Simplified Food Map Component (without sidebar)
const IntegratedFoodMap = ({ 
  onLocationFound 
}: {
  onLocationFound: (data: EnhancedLocationData) => void
}) => {
  const foodMapContainer = useRef<HTMLDivElement>(null);
  const foodMapRef = useRef<mapboxgl.Map | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const markerRef = useRef<mapboxgl.Marker | null>(null);
  const userLocationMarkerRef = useRef<mapboxgl.Marker | null>(null);

  const unsplashAccessKey = process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY;

  useEffect(() => {
    if (foodMapContainer.current && !foodMapRef.current) {
      // Initialize Mapbox map for food discovery
      foodMapRef.current = new mapboxgl.Map({
        container: foodMapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [-79.3871, 43.6426], // [lng, lat]
        zoom: 11
      });

      // Add navigation control
      foodMapRef.current.addControl(new mapboxgl.NavigationControl());
      
      // Add geolocate control
      const geolocateControl = new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true
        },
        trackUserLocation: true,
        showUserLocation: true,
        showAccuracyCircle: false
      });
      
      foodMapRef.current.addControl(geolocateControl);
      
      // Handle geolocate events
      geolocateControl.on('geolocate', (e: any) => {
        setUserLocation([e.coords.longitude, e.coords.latitude]);
      });
      
      geolocateControl.on('error', (error: any) => {
        setLocationError('Unable to get your location: ' + error.message);
      });
    }
  }, []);

  // Function to get user's current location
  const getUserLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by this browser.");
      return;
    }

    setIsLocating(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { longitude, latitude } = position.coords;
        const userCoords: [number, number] = [longitude, latitude];
        
        setUserLocation(userCoords);
        setIsLocating(false);
        
        // Add/update user location marker
        if (userLocationMarkerRef.current) {
          userLocationMarkerRef.current.remove();
        }
        
        const el = document.createElement('div');
        el.className = 'user-location-marker';
        el.style.backgroundImage = 'url(https://cdn-icons-png.flaticon.com/512/684/684908.png)';
        el.style.width = '30px';
        el.style.height = '30px';
        el.style.backgroundSize = 'cover';
        el.style.cursor = 'pointer';
        
        userLocationMarkerRef.current = new mapboxgl.Marker(el)
          .setLngLat(userCoords)
          .addTo(foodMapRef.current!);
        
        // Center map on user location
        foodMapRef.current?.flyTo({
          center: userCoords,
          zoom: 13,
          duration: 1000
        });
      },
      (error) => {
        setIsLocating(false);
        switch(error.code) {
          case error.PERMISSION_DENIED:
            setLocationError("User denied the request for Geolocation.");
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError("Location information is unavailable.");
            break;
          case error.TIMEOUT:
            setLocationError("The request to get user location timed out.");
            break;
          default:
            setLocationError("An unknown error occurred.");
            break;
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  const fetchLocationImage = async (place: string): Promise<string | null> => {
    if (!unsplashAccessKey) {
      console.log("Unsplash API key not configured, skipping image fetch");
      return null;
    }
    try {
      const response = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
          place + " food street"
        )}&client_id=${unsplashAccessKey}&per_page=1`
      );
      
      if (!response.ok) {
        console.error("Unsplash API error:", response.status, response.statusText);
        return null;
      }
      
      const data = await response.json();
      if (data.results && data.results.length > 0) {
        return data.results[0].urls.small;
      }
      return null;
    } catch (err) {
      console.error("Error fetching image:", err);
      return null;
    }
  };

  const handleSubmit = async () => {
    if (!inputValue) return;
  
    setLoading(true);
    try {
      const response = await fetch("/api/getlocation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value: inputValue }),
      });
  
      const contentType = response.headers.get("content-type");
      let data: EnhancedLocationData | { error: string } | null = null;
  
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        const text = await response.text();
        console.error("Expected JSON, got:", text);
        alert("Unexpected response from server.");
        setLoading(false);
        return;
      }
  
      if (data && !('error' in data)) {
        const imageUrl = await fetchLocationImage(data.title);
        const locationDataWithImage = { ...data, imageUrl: imageUrl ?? undefined };
        
        // Add marker to map
        if (markerRef.current) {
          markerRef.current.remove();
        }

        const el = document.createElement('div');
        el.className = 'food-marker';
        el.style.backgroundImage = 'url(https://cdn-icons-png.flaticon.com/512/2776/2776067.png)';
        el.style.width = '40px';
        el.style.height = '40px';
        el.style.backgroundSize = 'cover';
        el.style.cursor = 'pointer';

        markerRef.current = new mapboxgl.Marker(el)
          .setLngLat([locationDataWithImage.coordinates[1], locationDataWithImage.coordinates[0]])
          .addTo(foodMapRef.current!);

        foodMapRef.current?.flyTo({
          center: [locationDataWithImage.coordinates[1], locationDataWithImage.coordinates[0]],
          zoom: 13,
          duration: 1500
        });
        
        // Pass data to parent component
        onLocationFound(locationDataWithImage);
      } else {
        alert("Could not find location data. Please try again.");
      }
      setInputValue("");
    } catch (error) {
      console.error(error);
      alert("Error connecting to API");
    }
    setLoading(false);
  };

  return (
    <div className="relative w-full h-[500px]">
      {loading && <FoodMapLoader />}
      
      {/* Main Map */}
      <div ref={foodMapContainer} className="w-full h-full rounded-lg" />

      {/* Search Bar */}
      <div className="absolute top-6 left-1/2 transform -translate-x-1/2 z-[15000]">
        <div className="bg-white rounded-full shadow-lg p-2 flex items-center space-x-2 min-w-96">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="flex-1 px-4 py-2 border-0 focus:outline-none text-gray-700"
            placeholder="🍜 Discover food streets in any city..."
            onKeyPress={(e) => {
              if (e.key === "Enter") handleSubmit();
            }}
          />
          <button 
            onClick={handleSubmit} 
            className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-2 rounded-full hover:from-orange-600 hover:to-red-600 transition-all duration-200 font-medium shadow-md"
          >
            Explore 🔍
          </button>
        </div>
      </div>

      {/* Location Button */}
      <div className="absolute top-24 right-6 z-[15000] flex flex-col space-y-3">
        <button
          onClick={getUserLocation}
          disabled={isLocating}
          className="bg-white p-3 rounded-full shadow-lg hover:bg-gray-100 transition-all duration-200 flex items-center justify-center"
          title="Find my location"
        >
          {isLocating ? (
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          ) : (
            <span className="text-xl">📍</span>
          )}
        </button>
        
        {locationError && (
          <div className="bg-red-100 text-red-700 p-2 rounded-lg text-xs max-w-xs">
            {locationError}
          </div>
        )}
      </div>
    </div>
  );
};

export function TouristDashboard() {
  const { user, logout } = useAuth()
  const [safetyScore] = useState(85)
  const [sosActive, setSosActive] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeTab, setActiveTab] = useState<"chat" | "routes" | "translate">("routes")
  const router = useRouter()
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

  // Food discovery state
  const [locationData, setLocationData] = useState<EnhancedLocationData | null>(null)
  const [showFoodSidebar, setShowFoodSidebar] = useState(false)

  const popularDestinations = [
    { name: "Erode", coordinates: [77.7230, 11.3410] as [number, number] },
    { name: "Coimbatore", coordinates: [76.9558, 11.0168] as [number, number] },
    { name: "Salem", coordinates: [78.1460, 11.6643] as [number, number] },
    { name: "Tiruppur", coordinates: [77.3411, 11.1085] as [number, number] },
  ]
    
  // Function to get coordinates from a location name using Mapbox Geocoding API
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

  // Function to fetch real routes from Mapbox
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

  const handleLocationFound = (data: EnhancedLocationData) => {
    setLocationData(data)
    setShowFoodSidebar(true)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-cyan-50 dark:from-slate-900 dark:to-slate-800 flex">
      <TouristSidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        message={message}
        setMessage={setMessage}
        messages={messages}
        handleSendMessage={handleSendMessage}
        startLocation={startLocation}
        setStartLocation={setStartLocation}
        endLocation={endLocation}
        setEndLocation={setEndLocation}
        popularDestinations={popularDestinations}
        handleFindRoutes={handleFindRoutes}
        routeSuggestions={routeSuggestions}
        isNavigating={isNavigating}
        selectedRoute={selectedRoute}
        handleStartNavigation={handleStartNavigation}
        handleStopNavigation={handleStopNavigation}
        formatTime={formatTime}
        getRouteIcon={getRouteIcon}
        getRouteColor={getRouteColor}
        locationData={locationData}
        showFoodSidebar={showFoodSidebar}
        setShowFoodSidebar={setShowFoodSidebar}
      />

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
          {activeTab === "chat" ? (
            <Card className="bg-white/10 dark:bg-black/20 border border-white/20 dark:border-white/10 shadow-2xl rounded-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Food Discovery & Location Search
                </CardTitle>
                <CardDescription>
                  Discover amazing food streets, local cuisine, and cultural dining experiences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <IntegratedFoodMap onLocationFound={handleLocationFound} />
              </CardContent>
            </Card>
          ) : (
          /* Interactive Map Section */
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
                selectedRoute={selectedRoute ?? undefined}
                isNavigating={isNavigating}
              />
            </CardContent>
          </Card>
          )}

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

          {/* Floating Action Button to reopen food sidebar */}
          {locationData && !showFoodSidebar && (
            <button 
              onClick={() => setShowFoodSidebar(true)}
              className="fixed bottom-8 right-8 bg-gradient-to-r from-orange-500 to-red-500 text-white p-4 rounded-full shadow-lg hover:from-orange-600 hover:to-red-600 transition-all duration-200 z-[15000]"
            >
              🍜
            </button>
          )}
        </div>
      </div>
    </div>
  )
}