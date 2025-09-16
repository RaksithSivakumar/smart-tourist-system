"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  AlertTriangle, Clock, Locate, MapPin, MessageSquare, Navigation, Route, Shield, User, Languages, X
} from "lucide-react"
import Image from "next/image"

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

interface TouristSidebarProps {
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  activeTab: "chat" | "routes" | "translate"
  setActiveTab: (tab: "chat" | "routes" | "translate") => void

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

  // Food discovery props
  locationData?: EnhancedLocationData | null
  showFoodSidebar: boolean
  setShowFoodSidebar: React.Dispatch<React.SetStateAction<boolean>>
}


// Enhanced Chat Tab with Food Discovery
const EnhancedChatTab = ({ locationData }: { locationData?: EnhancedLocationData | null }) => {
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'food' | 'restrictions' | 'culture'>('overview');
  const [selectedFoodStreet, setSelectedFoodStreet] = useState<number | null>(null);
  console.log("imageUrl",locationData?.imageUrl)
  const handleStoreClick = (store: FoodStore) => {
    if (store.googleMapsUrl) {
      window.open(store.googleMapsUrl, '_blank');
    }
  };

  if (!locationData) {
    return (
      <div className="flex flex-col h-[calc(100vh-180px)] justify-center items-center p-4">
        <div className="text-center space-y-4">
          <MessageSquare className="h-16 w-16 mx-auto text-gray-400 dark:text-gray-600" />
          <h3 className="text-lg font-medium text-gray-600 dark:text-gray-400">Location Discovery</h3>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            Click on a location on the map to discover local food, culture, and travel tips!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-180px)]">
      {/* Header with Location Image */}
      <div className="relative h-32 bg-gradient-to-br from-orange-400 to-red-500 mb-4 rounded-lg overflow-hidden">
        {locationData?.imageUrl && (
          <div className="relative w-full h-64 bg-white">
          <Image
            src={locationData.imageUrl!}
            alt={locationData.title}
            fill
            sizes="320px"
            className="object-cover"
          />

        </div>


        )}
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        <div className="absolute bottom-2 left-3 text-white">
          <h1 className="text-lg font-bold">{locationData.title}</h1>
          <p className="text-xs opacity-90">{locationData.country} • {locationData.currency}</p>
        </div>
      </div>

      {/* Sub-Tab Navigation */}
      <div className="flex border-b rounded-t-lg overflow-hidden mb-4">
        {[
          { key: 'overview', label: 'Overview', icon: '📍' },
          { key: 'food', label: 'Food', icon: '🍜' },
          { key: 'restrictions', label: 'Rules', icon: '⚠️' },
          { key: 'culture', label: 'Culture', icon: '🎭' }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveSubTab(tab.key as 'overview' | 'food' | 'restrictions' | 'culture')}
            className={`flex-1 py-2 px-1 text-xs font-medium transition-all ${
              activeSubTab === tab.key 
                ? 'border-b-2 border-orange-500 text-orange-600' 
                : 'text-orange-600 cursor-pointer'
            }`}
          >
            <div className="text-center">
              <div className="text-sm">{tab.icon}</div>
              <div className="mt-1">{tab.label}</div>
            </div>
          </button>
        ))}
      </div>

      {/* Content Area */}
      <ScrollArea className="flex-1 px-2">
        {activeSubTab === 'overview' && (
          <div className="space-y-3">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-2 text-sm">📍 Location Details</h3>
              <div className="text-xs text-gray-600 space-y-1">
                <p><strong>City:</strong> {locationData.city}</p>
                <p><strong>Country:</strong> {locationData.country}</p>
                <p><strong>Language:</strong> {locationData.language}</p>
                <p><strong>Currency:</strong> {locationData.currency}</p>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-3 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-2 text-sm">🍽️ Food Scene Highlights</h3>
              <p className="text-xs text-gray-600">
                Discover {locationData.famousFoodStreets.length} famous food streets with authentic local cuisine, 
                cultural dining experiences, and must-visit food establishments.
              </p>
            </div>
          </div>
        )}

        {activeSubTab === 'food' && (
          <div className="space-y-3">
            {locationData.famousFoodStreets.map((street, index) => (
              <div key={index} className="border rounded-lg overflow-hidden shadow-sm">
                <div 
                  className="bg-gradient-to-r from-orange-50 to-red-50 p-3 cursor-pointer hover:from-orange-100 hover:to-red-100 transition-all"
                  onClick={() => setSelectedFoodStreet(selectedFoodStreet === index ? null : index)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800 text-sm">{street.name}</h3>
                      <p className="text-xs text-gray-600 mt-1">{street.description}</p>
                      <p className="text-xs text-orange-600 mt-1">⏰ {street.bestTimeToVisit}</p>
                    </div>
                    <span className="text-gray-400 text-xs">{selectedFoodStreet === index ? '▲' : '▼'}</span>
                  </div>
                </div>
                
                {selectedFoodStreet === index && (
                  <div className="p-3 bg-white">
                    <div className="mb-3">
                      <h4 className="font-medium text-gray-700 mb-2 text-xs">🍽️ Popular Dishes</h4>
                      <div className="flex flex-wrap gap-1">
                        {street.popularDishes.map((dish, i) => (
                          <span key={i} className="bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-xs">
                            {dish}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2 text-xs">🏪 Top Food Stores</h4>
                      <div className="space-y-2">
                        {street.topStores.map((store, i) => (
                          <div 
                            key={i} 
                            className="bg-gray-50 p-2 rounded-lg cursor-pointer hover:bg-gray-100 transition-all"
                            onClick={() => handleStoreClick(store)}
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex-1 min-w-0">
                                <h5 className="font-medium text-gray-800 text-xs truncate">{store.name}</h5>
                                <p className="text-xs text-gray-600 mt-1 truncate">{store.address}</p>
                                <p className="text-xs text-orange-600 mt-1 truncate">🍽️ {store.specialty}</p>
                              </div>
                              <div className="text-right ml-2 flex-shrink-0">
                                <span className={`text-xs px-2 py-1 rounded-full ${
                                  store.priceRange === 'Budget' ? 'bg-green-100 text-green-700' :
                                  store.priceRange === 'Mid-range' ? 'bg-yellow-100 text-yellow-700' :
                                  'bg-red-100 text-red-700'
                                }`}>
                                  {store.priceRange}
                                </span>
                                {store.googleMapsUrl && (
                                  <p className="text-xs text-blue-500 mt-1">📍</p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {activeSubTab === 'restrictions' && (
          <div className="space-y-2">
            {locationData.localRestrictions.map((restriction, index) => (
              <div key={index} className="bg-red-50 border-l-4 border-red-400 p-3 rounded">
                <div className="flex items-start">
                  <div className="text-red-400 mr-2 mt-1 text-sm">⚠️</div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-red-800 text-sm">{restriction.category}</h3>
                    <p className="text-xs text-red-700 mt-1">{restriction.restriction}</p>
                    <p className="text-xs text-red-600 mt-1 font-medium">💰 {restriction.penalty}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeSubTab === 'culture' && (
          <div className="space-y-3">
            <div className="bg-purple-50 p-3 rounded-lg">
              <h3 className="font-semibold text-purple-800 mb-2 text-sm">🎭 Cultural Tips</h3>
              <div className="space-y-2">
                {locationData.culturalTips.map((tip, index) => (
                  <div key={index} className="flex items-start">
                    <div className="text-purple-500 mr-2 mt-1 text-xs">💡</div>
                    <p className="text-xs text-purple-700 flex-1">{tip}</p>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-indigo-50 p-3 rounded-lg">
              <h3 className="font-semibold text-indigo-800 mb-2 text-sm">🗣️ Language & Communication</h3>
              <p className="text-xs text-indigo-700">
                Primary language: <strong>{locationData.language}</strong>
              </p>
              <p className="text-xs text-indigo-600 mt-1">
                Consider learning basic food-related phrases to enhance your dining experience!
              </p>
            </div>
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

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
    locationData,
  } = props

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
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex flex-col mt-4 space-y-2">
          <Button
            variant={activeTab === "chat" ? "default" : "outline"}
            className="flex-1"
            onClick={() => { setSidebarOpen(true); setActiveTab("chat") }}
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            Discover
          </Button>
          <Button
            variant={activeTab === "routes" ? "default" : "outline"}
            className="flex-1"
            onClick={() => setActiveTab("routes")}
          >
            <Route className="h-4 w-4 mr-2" />
            Routes
          </Button>
          <Button
            variant={activeTab === "translate" ? "default" : "outline"}
            className="flex-1"
            onClick={() => setActiveTab("translate")}
          >
            <Languages className="h-4 w-4 mr-2" />
            Text Translate
          </Button>
        </div>
      </div>

      {activeTab === "chat" ? (
        <EnhancedChatTab locationData={locationData} />
      ) : activeTab === "translate" ? (
        <div className="flex flex-col h-[calc(100vh-180px)]">
          {/* Translation functionality placeholder */}
        </div>
      ) : (
        <ScrollArea className="h-[calc(100vh-180px)] p-4">
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