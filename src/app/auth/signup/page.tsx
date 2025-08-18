"use client"

import { useState, useEffect } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { getGuestUser, getGuestVisions, clearGuestData } from "@/lib/guestSession"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Users, Mail, Lock, User, Sparkles, AlertCircle, CheckCircle } from "lucide-react"

export default function SignUpPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [onWaitingList, setOnWaitingList] = useState(false)
  const [hasGuestData, setHasGuestData] = useState(false)

  useEffect(() => {
    // Check if user has guest data to migrate
    const guestUser = getGuestUser()
    const guestVisions = getGuestVisions()
    setHasGuestData((guestUser && guestUser.points > 0) || guestVisions.length > 0)
  }, [])

  const migrateGuestData = async () => {
    const guestUser = getGuestUser()
    const guestVisions = getGuestVisions()
    
    if (!guestUser && guestVisions.length === 0) return
    
    try {
      const response = await fetch("/api/auth/migrate-guest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guestUser, guestVisions })
      })
      
      if (response.ok) {
        const result = await response.json()
        console.log("Guest data migrated:", result)
        clearGuestData() // Clear localStorage
      }
    } catch (error) {
      console.error("Failed to migrate guest data:", error)
      // Don't fail the signup process for migration errors
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password, name })
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.waitingList) {
          setOnWaitingList(true)
          setSuccess(data.message)
        } else {
          setError(data.error || "Failed to create account")
        }
      } else {
        setSuccess(hasGuestData ? "Account created! Migrating your visions..." : "Account created! Signing you in...")
        
        // Auto sign in after successful signup
        setTimeout(async () => {
          const result = await signIn("credentials", {
            email,
            password,
            redirect: false
          })

          if (result?.ok) {
            // Migrate guest data if it exists
            if (hasGuestData) {
              setSuccess("Migrating your visions and points...")
              await migrateGuestData()
            }
            
            router.push("/")
            router.refresh()
          }
        }, 1500)
      }
    } catch (error) {
      setError("Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <Users className="w-10 h-10 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Join CIVIZ Early Access
          </CardTitle>
          <CardDescription>
            Be one of the first 10 stakeholders shaping the future
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="name"
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  minLength={6}
                  required
                />
              </div>
              <p className="text-xs text-gray-500">Minimum 6 characters</p>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 px-3 py-2 rounded-md text-sm flex items-center">
                <AlertCircle className="w-4 h-4 mr-2" />
                {error}
              </div>
            )}

            {success && (
              <div className={`${onWaitingList ? 'bg-yellow-50 text-yellow-700' : 'bg-green-50 text-green-700'} px-3 py-2 rounded-md text-sm flex items-center`}>
                <CheckCircle className="w-4 h-4 mr-2" />
                {success}
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              disabled={isLoading || !!success}
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Creating account...</span>
                </div>
              ) : onWaitingList ? (
                "Join Waiting List"
              ) : (
                "Create Account"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link href="/auth/signin" className="text-blue-600 hover:text-blue-700 font-semibold">
                Sign in
              </Link>
            </p>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200">
            {hasGuestData && (
              <div className="bg-green-50 rounded-lg p-3 mb-3">
                <p className="text-xs text-center text-green-700 font-medium">
                  <CheckCircle className="inline w-3 h-3 mr-1" />
                  Your visions and points will be saved!
                </p>
                <p className="text-xs text-center text-green-600 mt-1">
                  All your guest content will transfer to your account
                </p>
              </div>
            )}
            <div className="bg-blue-50 rounded-lg p-3">
              <p className="text-xs text-center text-blue-700 font-medium">
                <Sparkles className="inline w-3 h-3 mr-1" />
                Limited Early Access: 10 Stakeholder Accounts
              </p>
              <p className="text-xs text-center text-blue-600 mt-1">
                Perfect for investors, advisors, and early supporters
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}