"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"

export type UserRole = "tourist" | "guide" | "police" | "hotel" | "airport"

export interface User {
  _id: string
  id?: string
  email: string
  role: UserRole
  created_at: string
  // Role-specific fields
  tourist?: {
    name: string
    passport_no: string
    emergency_contact: string
  }
  guide?: {
    name: string
    license_id: string
    region_assigned: string
  }
  police?: {
    name: string
    badge_id: string
    station_location: string
  }
  hotel?: {
    hotel_name: string
    registration_id: string
    location: string
    contact_number: string
  }
  airport?: {
    airport_name: string
    iata_code: string
    location: string
    authority_contact: string
  }
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string, role: UserRole) => Promise<void>
  logout: () => void
  loading: boolean
  error: string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem("smart-tourist-user")
    const savedToken = localStorage.getItem("smart-tourist-token")
    
    if (savedUser && savedToken) {
      try {
        const userData = JSON.parse(savedUser)
        setUser(userData)
        
        // Verify token is still valid by fetching profile
        verifyToken(savedToken)
      } catch (error) {
        console.error("Error parsing saved user:", error)
        localStorage.removeItem("smart-tourist-user")
        localStorage.removeItem("smart-tourist-token")
      }
    }
    setLoading(false)
  }, [])

  const verifyToken = async (token: string) => {
    try {
      const response = await fetch('/api/auth/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
        localStorage.setItem("smart-tourist-user", JSON.stringify(data.user))
      } else {
        // Token is invalid, clear storage
        localStorage.removeItem("smart-tourist-user")
        localStorage.removeItem("smart-tourist-token")
        setUser(null)
      }
    } catch (error) {
      console.error("Token verification failed:", error)
      localStorage.removeItem("smart-tourist-user")
      localStorage.removeItem("smart-tourist-token")
      setUser(null)
    }
  }

  const login = async (email: string, password: string, role: UserRole) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, role }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Login failed')
      }

      setUser(data.user)
      localStorage.setItem("smart-tourist-user", JSON.stringify(data.user))
      localStorage.setItem("smart-tourist-token", data.token)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed'
      setError(errorMessage)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    setError(null)
    localStorage.removeItem("smart-tourist-user")
    localStorage.removeItem("smart-tourist-token")
  }

  return <AuthContext.Provider value={{ user, login, logout, loading, error }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
