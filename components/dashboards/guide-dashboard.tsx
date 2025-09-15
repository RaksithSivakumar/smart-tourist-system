"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Users, AlertTriangle, Phone, Shield, LogOut, Plus, Trash2, Send } from "lucide-react"
import { Input } from "@/components/ui/input"

interface Tourist {
  _id: string
  email: string
  tourist: {
    name: string
    passport_no: string
    emergency_contact: string
  }
}

interface Alert {
  id: string
  type: string
  location: string
  tourist: string
  timestamp: string
  status: string
  priority: string
}

export function GuideDashboard() {
  const { user, logout } = useAuth()
  const [tourists, setTourists] = useState<Tourist[]>([])
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [itinerary, setItinerary] = useState<{ id: string; time: string; title: string; location: string }[]>([])
  const [showBroadcast, setShowBroadcast] = useState(false)
  const [broadcastMsg, setBroadcastMsg] = useState("")

  useEffect(() => {
    fetchData()
    // load itinerary
    const key = `guide-itinerary-${user?.id || user?._id || 'me'}`
    try {
      const saved = localStorage.getItem(key)
      if (saved) setItinerary(JSON.parse(saved))
    } catch {}
  }, [])

  const fetchData = async () => {
    try {
      const [touristsRes, alertsRes] = await Promise.all([
        fetch('/api/tourists'),
        fetch('/api/alerts')
      ])

      if (touristsRes.ok) {
        const touristsData = await touristsRes.json()
        setTourists(touristsData.tourists || [])
      }

      if (alertsRes.ok) {
        const alertsData = await alertsRes.json()
        setAlerts(alertsData.alerts || [])
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveItinerary = (items: { id: string; time: string; title: string; location: string }[]) => {
    setItinerary(items)
    const key = `guide-itinerary-${user?.id || user?._id || 'me'}`
    localStorage.setItem(key, JSON.stringify(items))
  }

  const addItinerary = () => {
    const next = [...itinerary, { id: crypto.randomUUID(), time: "09:00", title: "New activity", location: user?.guide?.region_assigned || "" }]
    saveItinerary(next)
  }

  const updateItinerary = (id: string, field: 'time'|'title'|'location', value: string) => {
    const next = itinerary.map(i => i.id === id ? { ...i, [field]: value } : i)
    saveItinerary(next)
  }

  const removeItinerary = (id: string) => {
    const next = itinerary.filter(i => i.id !== id)
    saveItinerary(next)
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500'
      case 'medium': return 'bg-yellow-500'
      case 'low': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-red-100 text-red-800'
      case 'resolved': return 'bg-green-100 text-green-800'
      case 'investigating': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Guide Dashboard
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Welcome, {user?.guide?.name || 'Guide'}
                </p>
              </div>
            </div>
            <Button onClick={logout} variant="outline" className="flex items-center space-x-2">
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Assigned Tourists</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{tourists.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center">
                <AlertTriangle className="h-8 w-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Alerts</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {alerts.filter(alert => alert.status === 'active').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center">
                <MapPin className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Region</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {user?.guide?.region_assigned || 'Not assigned'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Assigned Tourists with attendance toggle */}
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Assigned Tourists</span>
              </CardTitle>
              <CardDescription>
                Tourists in your assigned region: {user?.guide?.region_assigned}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tourists.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No tourists assigned to your region</p>
                ) : (
                  tourists.map((tourist) => (
                    <div key={tourist._id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold text-sm">
                            {tourist.tourist.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {tourist.tourist.name}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Passport: {tourist.tourist.passport_no}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button size="sm" variant="outline">
                          <Phone className="h-4 w-4 mr-1" />
                          Contact
                        </Button>
                        <label className="inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            onChange={(e) => {
                              const key = `attendance-${new Date().toDateString()}-${tourist._id}`
                              if (e.target.checked) localStorage.setItem(key, 'present')
                              else localStorage.removeItem(key)
                            }}
                            defaultChecked={typeof window !== 'undefined' && localStorage.getItem(`attendance-${new Date().toDateString()}-${tourist._id}`) === 'present'}
                          />
                          <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:bg-green-500 transition"></div>
                          <span className="ml-2 text-sm">Present</span>
                        </label>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Safety Alerts */}
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5" />
                <span>Safety Alerts</span>
              </CardTitle>
              <CardDescription>
                Recent safety alerts in your region
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {alerts.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No recent alerts</p>
                ) : (
                  alerts.map((alert) => (
                    <div key={alert.id} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <Badge className={getStatusColor(alert.status)}>
                              {alert.status}
                            </Badge>
                            <div className={`w-2 h-2 rounded-full ${getPriorityColor(alert.priority)}`} />
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {alert.type}
                            </span>
                          </div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {alert.tourist}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {alert.location}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-500">
                            {new Date(alert.timestamp).toLocaleString()}
                          </p>
                        </div>
                        <Button size="sm" variant="outline">
                          Respond
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Itinerary Planner and Broadcast */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="h-5 w-5" />
                <span>Itinerary Planner</span>
              </CardTitle>
              <CardDescription>
                Plan activities for your group. Stored locally for quick access.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {itinerary.length === 0 && (
                  <p className="text-gray-500">No items yet. Add your first activity.</p>
                )}
                {itinerary.map(item => (
                  <div key={item.id} className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
                    <div className="md:col-span-2">
                      <Input type="time" value={item.time} onChange={(e) => updateItinerary(item.id, 'time', e.target.value)} />
                    </div>
                    <div className="md:col-span-4">
                      <Input value={item.title} onChange={(e) => updateItinerary(item.id, 'title', e.target.value)} placeholder="Activity title" />
                    </div>
                    <div className="md:col-span-5">
                      <Input value={item.location} onChange={(e) => updateItinerary(item.id, 'location', e.target.value)} placeholder="Location" />
                    </div>
                    <div className="md:col-span-1 flex justify-end">
                      <Button variant="outline" size="icon" onClick={() => removeItinerary(item.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                <div className="flex justify-between">
                  <Button className="" onClick={addItinerary}>
                    <Plus className="h-4 w-4 mr-2" /> Add Item
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Group Broadcast</span>
              </CardTitle>
              <CardDescription>Draft a message to send to your tourists</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Input placeholder="Quick reminder: meet in lobby at 9:00" value={broadcastMsg} onChange={(e) => setBroadcastMsg(e.target.value)} />
                <div className="flex justify-end">
                  <Button variant="outline" onClick={() => setBroadcastMsg("")}>Clear</Button>
                  <Button className="ml-2" onClick={() => alert(`Message queued: ${broadcastMsg}`)}>
                    <Send className="h-4 w-4 mr-2" /> Queue Message
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
