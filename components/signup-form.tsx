"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth, type UserRole } from "@/components/auth-provider"
import { RoleSelector } from "@/components/role-selector"
import { Eye, EyeOff, Loader2, ArrowLeft } from "lucide-react"

interface SignupFormData {
  email: string;
  password: string;
  confirmPassword: string;
  // Tourist fields
  name?: string;
  passport_no?: string;
  emergency_contact?: string;
  // Guide fields
  license_id?: string;
  region_assigned?: string;
  // Police fields
  badge_id?: string;
  station_location?: string;
  // Hotel fields
  hotel_name?: string;
  registration_id?: string;
  location?: string;
  contact_number?: string;
  // Airport fields
  airport_name?: string;
  iata_code?: string;
  authority_contact?: string;
}

interface SignupFormProps {
  onBackToLogin?: () => void;
}

export function SignupForm({ onBackToLogin }: SignupFormProps) {
  const [formData, setFormData] = useState<SignupFormData>({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState<"role" | "credentials" | "details">("role");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setStep("credentials");
    setError("");
  };

  const handleInputChange = (field: keyof SignupFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError("");
  };

  const handleCredentialsNext = () => {
    if (!formData.email || !formData.password || !formData.confirmPassword) {
      setError("Please fill in all fields");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setStep("details");
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          role: selectedRole,
          email: formData.email,
          password: formData.password,
          ...Object.fromEntries(
            Object.entries(formData).filter(([key]) => 
              !['email', 'password', 'confirmPassword'].includes(key)
            )
          ),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Signup failed');
      }

      // Auto-login after successful signup
      await login(formData.email, formData.password, selectedRole);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  const getRoleGradient = (role: UserRole | null) => {
    if (!role) return "gradient-tourist"
    return `gradient-${role}`
  };

  const renderRoleSpecificFields = () => {
    if (!selectedRole) return null;

    switch (selectedRole) {
      case 'tourist':
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                placeholder="Enter your full name"
                value={formData.name || ""}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="passport_no">Passport Number</Label>
              <Input
                id="passport_no"
                placeholder="Enter passport number"
                value={formData.passport_no || ""}
                onChange={(e) => handleInputChange('passport_no', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emergency_contact">Emergency Contact</Label>
              <Input
                id="emergency_contact"
                placeholder="Enter emergency contact number"
                value={formData.emergency_contact || ""}
                onChange={(e) => handleInputChange('emergency_contact', e.target.value)}
                required
              />
            </div>
          </>
        );
      case 'guide':
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                placeholder="Enter your full name"
                value={formData.name || ""}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="license_id">License ID</Label>
              <Input
                id="license_id"
                placeholder="Enter guide license ID"
                value={formData.license_id || ""}
                onChange={(e) => handleInputChange('license_id', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="region_assigned">Assigned Region</Label>
              <Input
                id="region_assigned"
                placeholder="Enter assigned region"
                value={formData.region_assigned || ""}
                onChange={(e) => handleInputChange('region_assigned', e.target.value)}
                required
              />
            </div>
          </>
        );
      case 'police':
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                placeholder="Enter your full name"
                value={formData.name || ""}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="badge_id">Badge ID</Label>
              <Input
                id="badge_id"
                placeholder="Enter police badge ID"
                value={formData.badge_id || ""}
                onChange={(e) => handleInputChange('badge_id', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="station_location">Station Location</Label>
              <Input
                id="station_location"
                placeholder="Enter station location"
                value={formData.station_location || ""}
                onChange={(e) => handleInputChange('station_location', e.target.value)}
                required
              />
            </div>
          </>
        );
      case 'hotel':
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="hotel_name">Hotel Name</Label>
              <Input
                id="hotel_name"
                placeholder="Enter hotel name"
                value={formData.hotel_name || ""}
                onChange={(e) => handleInputChange('hotel_name', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="registration_id">Registration ID</Label>
              <Input
                id="registration_id"
                placeholder="Enter hotel registration ID"
                value={formData.registration_id || ""}
                onChange={(e) => handleInputChange('registration_id', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="Enter hotel location"
                value={formData.location || ""}
                onChange={(e) => handleInputChange('location', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact_number">Contact Number</Label>
              <Input
                id="contact_number"
                placeholder="Enter contact number"
                value={formData.contact_number || ""}
                onChange={(e) => handleInputChange('contact_number', e.target.value)}
                required
              />
            </div>
          </>
        );
      case 'airport':
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="airport_name">Airport Name</Label>
              <Input
                id="airport_name"
                placeholder="Enter airport name"
                value={formData.airport_name || ""}
                onChange={(e) => handleInputChange('airport_name', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="iata_code">IATA Code</Label>
              <Input
                id="iata_code"
                placeholder="Enter IATA code (e.g., JFK)"
                value={formData.iata_code || ""}
                onChange={(e) => handleInputChange('iata_code', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="Enter airport location"
                value={formData.location || ""}
                onChange={(e) => handleInputChange('location', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="authority_contact">Authority Contact</Label>
              <Input
                id="authority_contact"
                placeholder="Enter authority contact"
                value={formData.authority_contact || ""}
                onChange={(e) => handleInputChange('authority_contact', e.target.value)}
                required
              />
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {step === "role" ? (
          <div className="text-center mb-8">
            <div className="mb-8">
              <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                Smart Tourist Safety System
              </h1>
              <p className="text-xl text-muted-foreground">Choose your role to create an account</p>
            </div>
            <RoleSelector selectedRole={selectedRole} onRoleSelect={handleRoleSelect} />
          </div>
        ) : step === "credentials" ? (
          <Card className="max-w-md mx-auto backdrop-blur-xl bg-white/10 dark:bg-black/20 border border-white/20 dark:border-white/10 shadow-2xl">
            <div className={`h-2 ${getRoleGradient(selectedRole)}`} />
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Create Account</CardTitle>
              <CardDescription>Sign up as {selectedRole} to continue</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={(e) => { e.preventDefault(); handleCredentialsNext(); }} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    required
                  />
                </div>

                {error && (
                  <div className="text-red-500 text-sm text-center">{error}</div>
                )}

                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={() => setStep("role")} className="flex-1">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button
                    type="submit"
                    className={`flex-1 ${getRoleGradient(selectedRole)} text-white border-0`}
                  >
                    Next
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        ) : (
          <Card className="max-w-md mx-auto backdrop-blur-xl bg-white/10 dark:bg-black/20 border border-white/20 dark:border-white/10 shadow-2xl">
            <div className={`h-2 ${getRoleGradient(selectedRole)}`} />
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Complete Registration</CardTitle>
              <CardDescription>Fill in your {selectedRole} details</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSignup} className="space-y-4">
                {renderRoleSpecificFields()}

                {error && (
                  <div className="text-red-500 text-sm text-center">{error}</div>
                )}

                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={() => setStep("credentials")} className="flex-1">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                    className={`flex-1 ${getRoleGradient(selectedRole)} text-white border-0`}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating Account...
                      </>
                    ) : (
                      "Create Account"
                    )}
                  </Button>
                </div>

                {onBackToLogin && (
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">
                      Already have an account?{' '}
                      <button
                        type="button"
                        onClick={onBackToLogin}
                        className="text-primary hover:underline"
                      >
                        Sign in
                      </button>
                    </p>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
