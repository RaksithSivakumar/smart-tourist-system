"use client"

import { useEffect, useRef, useState } from "react"
import { MapPin, Navigation, Shield, AlertTriangle, Phone, Plane, Building2, Navigation as NavigationIcon, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import mapboxgl from "mapbox-gl"
import "mapbox-gl/dist/mapbox-gl.css"

// Set Mapbox access token
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_API_KEY || "pk.eyJ1Ijoic21pbGVlZSIsImEiOiJjbThuejMzMjIwNHJvMmpzNXd6MXNtZnM4In0.rsQhRY5hN4lS3SeCL0ZXRA"

interface MapMarker {
  id: string
  type: "tourist" | "police" | "hospital" | "embassy" | "hotel" | "airport"
  position: [number, number]
  title: string
  status?: string
  safetyScore?: number
}

interface RouteCoordinates {
  start: [number, number]
  end: [number, number]
  waypoints: [number, number][]
}

interface InteractiveMapProps {
  selectedRoute?: {
    id: string
    name: string
    start: string
    end: string
    distance: string
    time: string
    safety: number
    type: "walking" | "driving" | "public"
    coordinates: RouteCoordinates
  }
  isNavigating?: boolean
}

export function InteractiveMap({ selectedRoute, isNavigating }: InteractiveMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null)
  const [selectedMarker, setSelectedMarker] = useState<MapMarker | null>(null)
  const [mapTheme, setMapTheme] = useState<"light" | "dark">("light")
  const [sosActive, setSosActive] = useState(false)
  const [currentRoute, setCurrentRoute] = useState<any>(null)
  const [isLoadingRoute, setIsLoadingRoute] = useState(false)
  const [routeError, setRouteError] = useState<string | null>(null)
  const markersRef = useRef<mapboxgl.Marker[]>([])
  const routeSourceRef = useRef<string | null>(null)

  // --- MODIFIED: Sample markers data relevant to Tamil Nadu ---
  const markers: MapMarker[] = [
    { id: "1", type: "tourist", position: [77.244, 11.497], title: "Sathyamangalam", status: "Safe", safetyScore: 95 },
    { id: "2", type: "police", position: [77.72, 11.34], title: "Erode Police Station", status: "Active" },
    { id: "3", type: "hospital", position: [77.73, 11.35], title: "Erode General Hospital", status: "Emergency Ready" },
    { id: "5", type: "hotel", position: [77.71, 11.33], title: "Hotel Atrium", status: "Check-in Available" },
    { id: "6", type: "airport", position: [77.03, 11.13], title: "Coimbatore Airport", status: "Flight On Time" },
  ]

  const getCurrentLocation = (): Promise<[number, number]> => {
    return new Promise((resolve) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve([position.coords.longitude, position.coords.latitude])
          },
          (error) => {
            console.log('Location access denied, using default location')
            resolve([77.244, 11.497]) // Default to Sathyamangalam
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
        )
      } else {
        resolve([77.244, 11.497]) // Default to Sathyamangalam
      }
    })
  }

  // This function is perfect, it fetches the route geometry.
  const getDirections = async (start: [number, number], end: [number, number], profile: string = 'driving') => {
    const accessToken = mapboxgl.accessToken
    const coordinates = `${start[0]},${start[1]};${end[0]},${end[1]}`
    const url = `https://api.mapbox.com/directions/v5/mapbox/${profile}/${coordinates}?geometries=geojson&access_token=${accessToken}&steps=true&overview=full`
    
    try {
      const response = await fetch(url)
      const data = await response.json()
      
      if (data.routes && data.routes.length > 0) {
        return data.routes[0].geometry.coordinates
      } else {
        console.warn('No routes found, using straight line')
        return [start, end]
      }
    } catch (error) {
      console.error('Error fetching directions:', error)
      return [start, end]
    }
  }

  // This function correctly adds the fetched route to the map.
  const addRouteToMap = async (route: any) => {
    if (!map.current || !route.coordinates) return

    setIsLoadingRoute(true)
    setRouteError(null)

    try {
      const profile = route.type === 'walking' ? 'walking' : 'driving'
      
      let startCoords = route.coordinates.start
      if (route.start.toLowerCase() === "current location") {
        startCoords = await getCurrentLocation()
      }
      
      const routeCoordinates = await getDirections(
        startCoords, 
        route.coordinates.end, 
        profile
      )
      
      // Remove existing route if any
      if (routeSourceRef.current && map.current.getSource(routeSourceRef.current)) {
        if (map.current.getLayer('route-line-outline')) {
          map.current.removeLayer('route-line-outline')
        }
        if (map.current.getLayer('route-line')) {
          map.current.removeLayer('route-line')
        }
        map.current.removeSource(routeSourceRef.current)
      }

      const sourceId = `route-${route.id}`
      routeSourceRef.current = sourceId

      map.current.addSource(sourceId, {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: routeCoordinates
          }
        }
      })

      const routeColor = route.type === 'walking' ? '#10b981' : 
                        route.type === 'public' ? '#8b5cf6' : '#3b82f6'
      
      map.current.addLayer({
        id: 'route-line-outline',
        type: 'line',
        source: sourceId,
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: { 'line-color': '#ffffff', 'line-width': 6, 'line-opacity': 0.8 }
      })

      map.current.addLayer({
        id: 'route-line',
        type: 'line',
        source: sourceId,
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: { 'line-color': routeColor, 'line-width': 4, 'line-opacity': 0.8 }
      })

      addRouteMarkers(route)
      
      const bounds = new mapboxgl.LngLatBounds()
      routeCoordinates.forEach((coord: [number, number]) => bounds.extend(coord))
      map.current.fitBounds(bounds, { padding: 80 })

    } catch (error) {
      console.error('Error adding route to map:', error)
      setRouteError('Failed to load route. Please try again.')
    } finally {
      setIsLoadingRoute(false)
    }
  }

  const addRouteMarkers = (route: any) => {
    if (!map.current || !route.coordinates) return

    // Clear previous route markers
    document.querySelectorAll('.route-marker').forEach(marker => marker.remove());

    const startEl = document.createElement("div")
    startEl.className = "route-marker start"
    startEl.innerHTML = '<div class="w-6 h-6 bg-green-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center"><div class="w-2 h-2 bg-white rounded-full"></div></div>'
    
    new mapboxgl.Marker(startEl)
      .setLngLat(route.coordinates.start)
      .setPopup(new mapboxgl.Popup().setHTML(`<div class="p-2"><strong>Start:</strong> ${route.start}</div>`))
      .addTo(map.current)

    const endEl = document.createElement("div")
    endEl.className = "route-marker end"
    endEl.innerHTML = '<div class="w-6 h-6 bg-red-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center"><div class="w-2 h-2 bg-white rounded-full"></div></div>'
    
    new mapboxgl.Marker(endEl)
      .setLngLat(route.coordinates.end)
      .setPopup(new mapboxgl.Popup().setHTML(`<div class="p-2"><strong>Destination:</strong> ${route.end}</div>`))
      .addTo(map.current)
  }

  const clearRoute = () => {
    if (!map.current) return

    if (routeSourceRef.current && map.current.getSource(routeSourceRef.current)) {
      if (map.current.getLayer('route-line-outline')) {
        map.current.removeLayer('route-line-outline')
      }
      if (map.current.getLayer('route-line')) {
        map.current.removeLayer('route-line')
      }
      map.current.removeSource(routeSourceRef.current)
      routeSourceRef.current = null
    }
    document.querySelectorAll('.route-marker').forEach(marker => marker.remove())
  }

  useEffect(() => {
    if (map.current || !mapContainer.current) return

    // --- MODIFIED: Default map center and zoom level ---
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: mapTheme === "dark" 
        ? "mapbox://styles/mapbox/dark-v11" 
        : "mapbox://styles/mapbox/streets-v12",
      center: [77.45, 11.41], // Center between Erode and Sathy
      zoom: 9,
    })

    map.current.addControl(new mapboxgl.NavigationControl(), "top-right")

    const geolocate = new mapboxgl.GeolocateControl({
      positionOptions: { enableHighAccuracy: true },
      trackUserLocation: true,
      showUserLocation: true,
      showAccuracyCircle: false,
    })
    map.current.addControl(geolocate, "top-right")

    window.dispatchEvent(new CustomEvent('mapReady', { detail: map.current }))

    markers.forEach(marker => {
      const el = document.createElement("div")
      el.className = "marker"
      el.innerHTML = getMarkerIconString(marker.type)
      el.style.width = "32px"
      el.style.height = "32px"
      el.style.cursor = "pointer"
      
      const markerInstance = new mapboxgl.Marker(el)
        .setLngLat(marker.position)
        .setPopup(
          new mapboxgl.Popup({ offset: 25 })
            .setHTML(`
              <div class="p-2">
                <h3 class="font-semibold">${marker.title}</h3>
                <p class="text-sm">Type: ${marker.type}</p>
                ${marker.status ? `<p class="text-sm">Status: ${marker.status}</p>` : ""}
                ${marker.safetyScore ? `<p class="text-sm">Safety Score: ${marker.safetyScore}%</p>` : ""}
              </div>
            `)
        )
        .addTo(map.current!)
      
      markersRef.current.push(markerInstance)
      
      el.addEventListener("click", () => {
        setSelectedMarker(marker)
      })
    })

    getCurrentLocation().then(location => {
        setUserLocation(location)
    })

    return () => {
      if (map.current) {
        map.current.remove()
        map.current = null
      }
    }
  }, [])

  useEffect(() => {
    if (selectedRoute && isNavigating) {
      setCurrentRoute(selectedRoute)
      addRouteToMap(selectedRoute)
    } else if (!isNavigating) {
      clearRoute()
      setCurrentRoute(null)
    }
  }, [selectedRoute, isNavigating])

  useEffect(() => {
    const handleShowRoute = (event: CustomEvent) => {
      if (event.detail && map.current) {
        // The selectedRoute object might not be fully updated yet, so we merge
        // the coordinates from the event with a base route structure.
        addRouteToMap({ 
          id: selectedRoute?.id || 'event-route',
          type: selectedRoute?.type || 'driving',
          start: selectedRoute?.start || 'Start',
          end: selectedRoute?.end || 'End',
          coordinates: event.detail 
        })
      }
    }

    const handleClearRoute = () => {
      clearRoute()
      setCurrentRoute(null)
    }

    window.addEventListener('showRoute', handleShowRoute as EventListener)
    window.addEventListener('clearRoute', handleClearRoute)

    return () => {
      window.removeEventListener('showRoute', handleShowRoute as EventListener)
      window.removeEventListener('clearRoute', handleClearRoute)
    }
  }, [selectedRoute])

  useEffect(() => {
    if (map.current) {
      map.current.setStyle(
        mapTheme === "dark" 
          ? "mapbox://styles/mapbox/dark-v11" 
          : "mapbox://styles/mapbox/streets-v12"
      )
    }
  }, [mapTheme])

  // --- The rest of the InteractiveMap component remains the same ---
  const getMarkerIconString = (type: string) => {
    switch (type) {
      case "tourist":
        return '<div class="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center shadow-lg"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg></div>'
      case "police":
        return '<div class="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 10h4"/><path d="M12 6v4"/><path d="M12 14v4"/><path d="M17 10V6a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2v4"/><path d="M6 10h12l-1 8H7l-1-8z"/></svg></div>'
      case "hospital":
        return '<div class="w-8 h-8 rounded-full bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center shadow-lg"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 6v12"/><path d="M6 12h12"/><path d="M20 12a8 8 0 1 0-16 0 8 8 0 0 0 16 0Z"/></svg></div>'
      case "embassy":
        return '<div class="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-lg"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/><path d="M18 14h-8"/><path d="M15 18h-5"/><path d="M10 6h8v4h-8V6Z"/></svg></div>'
      case "hotel":
        return '<div class="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-amber-600 flex items-center justify-center shadow-lg"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2Z"/><path d="M9 22V12h6v10"/></svg></div>'
      case "airport":
        return '<div class="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-600 flex items-center justify-center shadow-lg"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/></svg></div>'
      default:
        return '<div class="w-8 h-8 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center shadow-lg"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg></div>'
    }
  }

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

  const handleSOS = () => {
    setSosActive(!sosActive)
    console.log("SOS Alert:", sosActive ? "Deactivated" : "Activated")
  }

  return (
    <div className="relative w-full h-[600px] rounded-xl overflow-hidden backdrop-blur-xl bg-white/10 dark:bg-black/20 border border-white/20 dark:border-white/10">
      <div
        ref={mapContainer}
        className="w-full h-full"
      />
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
          onClick={() => {
            if (map.current && userLocation) {
              map.current.flyTo({
                center: userLocation,
                zoom: 14,
              })
            }
          }}
        >
          <Navigation className="w-4 h-4" />
        </Button>
        {isNavigating && (
          <Button
            size="icon"
            className="backdrop-blur-xl bg-red-500/80 hover:bg-red-600/80 border border-red-400 text-white"
            onClick={() => {
                window.dispatchEvent(new CustomEvent('clearRoute'))
            }}
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

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

      {isLoadingRoute && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
          <Card className="backdrop-blur-xl bg-yellow-500/20 dark:bg-yellow-500/10 border border-yellow-400/30 p-3">
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-yellow-600 border-t-transparent"></div>
              <span className="text-sm text-yellow-800 dark:text-yellow-200">Loading route...</span>
            </div>
          </Card>
        </div>
      )}

      {routeError && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
          <Card className="backdrop-blur-xl bg-red-500/20 dark:bg-red-500/10 border border-red-400/30 p-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
              <span className="text-sm text-red-800 dark:text-red-200">{routeError}</span>
            </div>
          </Card>
        </div>
      )}

      {isNavigating && currentRoute && !isLoadingRoute && (
        <div className="absolute top-4 left-4">
          <Card className="bg-blue-500 dark:bg-blue-500 border border-blue-400/30 p-3 min-w-[250px]">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <NavigationIcon className="w-4 h-4 text-blue-100 dark:text-blue-400" />
                <span className="text-sm font-medium text-blue-100 dark:text-blue-200">Navigating</span>
              </div>
              <Badge className="bg-green-500 text-white-900 text-xs">Live</Badge>
            </div>
            <div className="space-y-1 text-xs text-blue-900 dark:text-blue-100">
              <p><strong>To:</strong> {currentRoute.end}</p>
              <p><strong>Distance:</strong> {currentRoute.distance}</p>
              <p><strong>Time:</strong> {currentRoute.time}</p>
              <p><strong>Safety:</strong> {currentRoute.safety}%</p>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}