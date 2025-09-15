"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/components/auth-provider"
import {
  Building2,
  Users,
  MapPin,
  Star,
  Phone,
  MessageCircle,
  Shield,
  AlertTriangle,
  Clock,
  CheckIcon as CheckIn,
  LogOut,
  Search,
  Bell,
} from "lucide-react"

interface Guest {
  id: string
  name: string
  room: string
  checkIn: string
  checkOut: string
  status: "Checked In" | "Checked Out" | "No Show"
  safetyRating: number
  lastSeen: string
  roomsRequired?: number
}

export function HotelDashboard() {
  const { user, logout } = useAuth()
  const [guests, setGuests] = useState<Guest[]>([])
  const [loadingGuests, setLoadingGuests] = useState(false)
  const [showGuestForm, setShowGuestForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const [formValues, setFormValues] = useState({
    name: "",
    tourist_id: "",
    id: "",
    room_type: "",
    rooms_required: 1,
    address: "",
    phone_number: "",
    email: "",
    check_in: "",
    check_out: "",
  })

  const [roomStatus] = useState({
    occupied: 156,
    available: 44,
    maintenance: 8,
    total: 208,
  })

  useEffect(() => {
    const fetchGuests = async () => {
      setLoadingGuests(true)
      try {
        const token = localStorage.getItem("smart-tourist-token")
        const res = await fetch('/api/hotel/guests', {
          headers: {
            'Authorization': `Bearer ${token || ''}`,
          },
        })
        if (res.ok) {
          const data = await res.json()
          const mapped: Guest[] = (data.guests || []).map((g: any, idx: number) => ({
            id: g._id || String(idx),
            name: g.name,
            room: g.room_type,
            checkIn: g.check_in?.slice?.(0, 10) || '',
            checkOut: g.check_out?.slice?.(0, 10) || '',
            status: "Checked In",
            safetyRating: 90,
            lastSeen: g.last_seen ? new Date(g.last_seen).toLocaleString() : "-",
            roomsRequired: Number(g.rooms_required || 1),
          }))
          setGuests(mapped)
        }
      } finally {
        setLoadingGuests(false)
      }
    }
    fetchGuests()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormValues((prev) => ({ ...prev, [name]: value }))
  }

  const validateForm = () => {
    const { name, id, room_type, rooms_required, address, phone_number, email, check_in, check_out } = formValues
    if (!name || !id || !room_type || !rooms_required || !address || !phone_number || !email || !check_in || !check_out) {
      return 'Please fill in all fields.'
    }
    if (Number(rooms_required) < 1) {
      return 'Rooms required must be at least 1.'
    }
    const cin = new Date(check_in)
    const cout = new Date(check_out)
    if (isNaN(cin.getTime()) || isNaN(cout.getTime())) {
      return 'Invalid dates provided.'
    }
    if (cout <= cin) {
      return 'Check-out must be after check-in.'
    }
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const err = validateForm()
    if (err) {
      setFormError(err)
      return
    }
    setSubmitting(true)
    setFormError(null)
    try {
      const token = localStorage.getItem("smart-tourist-token")
      const res = await fetch('/api/hotel/guests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token || ''}`,
        },
        body: JSON.stringify({ ...formValues, rooms_required: Number(formValues.rooms_required) }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to add guest')
      }
      // refresh list
      setShowGuestForm(false)
      setFormValues({ name: "", tourist_id: "", id: "", room_type: "", rooms_required: 1, address: "", phone_number: "", email: "", check_in: "", check_out: "" })
      // simple refetch
      const refetch = await fetch('/api/hotel/guests', { headers: { 'Authorization': `Bearer ${token || ''}` } })
      if (refetch.ok) {
        const d = await refetch.json()
        const mapped: Guest[] = (d.guests || []).map((g: any, idx: number) => ({
          id: g._id || String(idx),
          name: g.name,
          room: g.room_type,
          checkIn: g.check_in?.slice?.(0, 10) || '',
          checkOut: g.check_out?.slice?.(0, 10) || '',
          status: "Checked In",
          safetyRating: 90,
          lastSeen: g.last_seen ? new Date(g.last_seen).toLocaleString() : "-",
          roomsRequired: Number(g.rooms_required || 1),
        }))
        setGuests(mapped)
      }
    } catch (error: any) {
      setFormError(error?.message || 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  const occupiedRooms = useMemo(() => {
    const now = new Date()
    const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const dayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)
    return guests.reduce((sum, g) => {
      const cin = new Date(g.checkIn)
      const cout = new Date(g.checkOut)
      const overlapsToday = !(cout < dayStart || cin > dayEnd)
      const rooms = Number(g.roomsRequired || 0)
      return overlapsToday ? sum + (rooms > 0 ? rooms : 0) : sum
    }, 0)
  }, [guests])

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 dark:from-amber-900 dark:to-orange-900">
      {/* Header */}
      <header className="backdrop-blur-xl bg-white/10 dark:bg-black/20 border border-white/20 dark:border-white/10 shadow-2xl rounded-xl m-4 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full gradient-hotel flex items-center justify-center">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Grand Plaza Hotel</h1>
              <p className="text-sm text-muted-foreground">Concierge Dashboard - {user?.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-green-500 text-white">Online</Badge>
            <Button className="gradient-hotel text-white" onClick={() => setShowGuestForm(true)}>
              Add Guest
            </Button>
            <Button variant="outline" onClick={logout}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <div className="p-4 space-y-6">
        {/* Hotel Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: "Occupied Rooms", value: occupiedRooms.toString(), icon: Users, color: "bg-green-500" },
            { label: "Available Rooms", value: "50", icon: Building2, color: "bg-blue-500" },
            { label: "Safety Alerts", value: "2", icon: AlertTriangle, color: "bg-yellow-500" },
            { label: "Avg Safety Score", value: "91%", icon: Shield, color: "bg-purple-500" },
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

        {/* Guest Registry & Room Status */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="backdrop-blur-xl bg-white/10 dark:bg-black/20 border border-white/20 dark:border-white/10 shadow-2xl rounded-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Guest Registry
              </CardTitle>
              <CardDescription>Current guests and their safety status</CardDescription>
              <div className="flex gap-2">
                <Input placeholder="Search guests..." className="flex-1" />
                <Button size="sm" variant="outline">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {loadingGuests && <p className="text-sm text-muted-foreground">Loading guests...</p>}
                {!loadingGuests && guests.length === 0 && (
                  <p className="text-sm text-muted-foreground">No guests yet.</p>
                )}
                {guests.map((guest) => (
                  <div key={guest.id} className="p-3 bg-white/50 rounded-lg border">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-amber-400 to-orange-400 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-sm">{guest.name.charAt(0)}</span>
                        </div>
                        <div>
                          <p className="font-medium">{guest.name}</p>
                          <p className="text-sm text-muted-foreground">Room {guest.room} x{guest.roomsRequired || 1}</p>
                        </div>
                      </div>
                      <Badge className={guest.status === "Checked In" ? "bg-green-500" : "bg-gray-500"}>
                        {guest.status}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-4">
                        <span>Safety: {guest.safetyRating}%</span>
                        <span>Last seen: {guest.lastSeen}</span>
                      </div>
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline" className="h-8 w-8 p-0 bg-transparent">
                          <Phone className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline" className="h-8 w-8 p-0 bg-transparent">
                          <MessageCircle className="h-3 w-3" />
                        </Button>
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
                <Building2 className="h-5 w-5" />
                Floor Plan & Room Status
              </CardTitle>
              <CardDescription>Real-time room occupancy and guest locations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="w-full h-64 bg-gradient-to-br from-amber-100 to-orange-200 rounded-lg flex items-center justify-center relative overflow-hidden">
                <div className="text-center">
                  <Building2 className="h-12 w-12 mx-auto mb-2 text-amber-600" />
                  <p className="text-sm font-medium">Interactive Floor Plan</p>
                  <p className="text-xs text-muted-foreground">15 floors • 208 rooms</p>
                </div>
                {/* Room indicators */}
                <div className="absolute top-4 left-4 grid grid-cols-8 gap-1">
                  {Array.from({ length: 32 }).map((_, i) => (
                    <div
                      key={i}
                      className={`w-2 h-2 rounded-sm ${
                        i < 20 ? "bg-green-500" : i < 28 ? "bg-blue-500" : "bg-yellow-500"
                      }`}
                    />
                  ))}
                </div>
              </div>
              <div className="flex justify-between mt-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-sm" />
                  <span>Occupied</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-sm" />
                  <span>Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-sm" />
                  <span>Maintenance</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Concierge Services & Safety Features */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="backdrop-blur-xl bg-white/10 dark:bg-black/20 border border-white/20 dark:border-white/10 shadow-2xl rounded-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Concierge Services
              </CardTitle>
              <CardDescription>Guest assistance and local recommendations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: MapPin, label: "Local Attractions", color: "bg-blue-500" },
                  { icon: Star, label: "Restaurant Recs", color: "bg-purple-500" },
                  { icon: Phone, label: "Transportation", color: "bg-green-500" },
                  { icon: Shield, label: "Safety Routes", color: "bg-red-500" },
                  { icon: Clock, label: "Event Tickets", color: "bg-yellow-500" },
                  { icon: Bell, label: "Wake-up Calls", color: "bg-indigo-500" },
                ].map((service, index) => (
                  <Button
                    key={index}
                    className={`${service.color} text-white border-0 h-16 flex-col gap-1 hover:scale-105 transition-transform`}
                  >
                    <service.icon className="h-5 w-5" />
                    <span className="text-xs">{service.label}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-xl bg-white/10 dark:bg-black/20 border border-white/20 dark:border-white/10 shadow-2xl rounded-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Safety & Security
              </CardTitle>
              <CardDescription>Guest safety monitoring and emergency protocols</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm font-medium text-yellow-800">Safety Alert</span>
                  </div>
                  <p className="text-sm text-yellow-700">Guest in Room 1205 hasn't been seen for 4+ hours</p>
                  <Button size="sm" className="mt-2 bg-yellow-600 hover:bg-yellow-700 text-white">
                    Check Status
                  </Button>
                </div>

                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckIn className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800">Geo-fence Alert</span>
                  </div>
                  <p className="text-sm text-green-700">3 guests safely returned to hotel perimeter</p>
                </div>

                <div className="flex gap-2">
                  <Button className="flex-1 gradient-hotel text-white border-0">
                    <Shield className="h-4 w-4 mr-2" />
                    Emergency Protocol
                  </Button>
                  <Button variant="outline" className="flex-1 bg-transparent">
                    <MapPin className="h-4 w-4 mr-2" />
                    Evacuation Routes
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      {showGuestForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowGuestForm(false)} />
          <div className="relative w-full max-w-xl backdrop-blur-xl bg-white/90 dark:bg-black/40 border border-white/20 dark:border-white/10 shadow-2xl rounded-xl p-4">
            <h3 className="text-lg font-semibold mb-2">Add Guest</h3>
            <p className="text-sm text-muted-foreground mb-4">Enter guest details. Tourist must exist in system.</p>
            {formError && <p className="text-sm text-red-600 mb-2">{formError}</p>}
            <form className="grid grid-cols-1 md:grid-cols-2 gap-3" onSubmit={handleSubmit}>
              <div className="col-span-1 md:col-span-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" value={formValues.name} onChange={handleChange} placeholder="Guest full name" />
              </div>
              <div>
                <Label htmlFor="tourist_id">Tourist ID or Email</Label>
                <Input id="tourist_id" name="tourist_id" value={formValues.tourist_id} onChange={handleChange} placeholder="e.g. 68c8... or user@mail.com" />
              </div>
              <div>
                <Label htmlFor="id">Government ID</Label>
                <Input id="id" name="id" value={formValues.id} onChange={handleChange} placeholder="Passport / ID number" />
              </div>
              <div>
                <Label htmlFor="room_type">Room Type/No</Label>
                <Input id="room_type" name="room_type" value={formValues.room_type} onChange={handleChange} placeholder="e.g. 1205 / Deluxe" />
              </div>
              <div>
                <Label htmlFor="rooms_required">No. of Rooms</Label>
                <Input id="rooms_required" name="rooms_required" type="number" min={1} value={formValues.rooms_required as any} onChange={handleChange} placeholder="1" />
              </div>
              <div>
                <Label htmlFor="address">Address</Label>
                <Input id="address" name="address" value={formValues.address} onChange={handleChange} placeholder="Residential address" />
              </div>
              <div>
                <Label htmlFor="phone_number">Phone Number</Label>
                <Input id="phone_number" name="phone_number" value={formValues.phone_number} onChange={handleChange} placeholder="Contact number" />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" value={formValues.email} onChange={handleChange} placeholder="guest@email.com" />
              </div>
              <div>
                <Label htmlFor="check_in">Check-in Date</Label>
                <Input id="check_in" name="check_in" type="date" value={formValues.check_in} onChange={handleChange} />
              </div>
              <div>
                <Label htmlFor="check_out">Check-out Date</Label>
                <Input id="check_out" name="check_out" type="date" value={formValues.check_out} onChange={handleChange} />
              </div>
              <div className="col-span-1 md:col-span-2 flex justify-end gap-2 mt-2">
                <Button type="button" variant="outline" onClick={() => setShowGuestForm(false)}>Cancel</Button>
                <Button type="submit" className="gradient-hotel text-white" disabled={submitting}>
                  {submitting ? 'Saving...' : 'Save Guest'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
