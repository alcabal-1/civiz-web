"use client"

import { useState } from "react"
import { signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { User, LogOut, Trophy, Sparkles } from "lucide-react"
import type { Session } from "next-auth"

interface UserMenuProps {
  session: Session | null
  userPoints?: number
}

export function UserMenu({ session, userPoints = 100 }: UserMenuProps) {
  const [showMenu, setShowMenu] = useState(false)

  if (!session?.user) {
    return (
      <div className="flex items-center space-x-2">
        <a href="/auth/signin">
          <Button variant="outline" size="sm">
            Sign In
          </Button>
        </a>
        <a href="/auth/signup">
          <Button size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
            <Sparkles className="w-4 h-4 mr-2" />
            Get Early Access
          </Button>
        </a>
      </div>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center space-x-3 bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-md hover:shadow-lg transition-all"
      >
        <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
          <User className="w-5 h-5 text-white" />
        </div>
        <div className="text-left">
          <p className="text-sm font-semibold text-gray-900">
            {session.user.name || session.user.email?.split('@')[0]}
          </p>
          <p className="text-xs text-gray-500 flex items-center">
            <Trophy className="w-3 h-3 mr-1" />
            {userPoints} points
          </p>
        </div>
      </button>

      {showMenu && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setShowMenu(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-50">
            <div className="p-4 border-b border-gray-100">
              <p className="text-sm font-semibold text-gray-900">
                {session.user.name || 'Civic Visionary'}
              </p>
              <p className="text-xs text-gray-500">{session.user.email}</p>
            </div>
            
            <div className="p-3">
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}