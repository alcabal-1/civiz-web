"use client"

import { motion } from "framer-motion"
import { User, Globe } from "lucide-react"
import { cn } from "@/lib/utils"

interface ViewToggleProps {
  mode: "personal" | "pulse"
  onChange: (mode: "personal" | "pulse") => void
  className?: string
}

export function ViewToggle({ mode, onChange, className }: ViewToggleProps) {
  return (
    <div className={cn("relative inline-flex bg-slate-100 rounded-full p-1", className)}>
      <motion.div
        className="absolute inset-y-1 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg"
        initial={false}
        animate={{
          x: mode === "personal" ? 0 : "100%",
          width: "50%",
        }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 30,
        }}
      />
      
      <button
        onClick={() => onChange("personal")}
        className={cn(
          "relative z-10 flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-200",
          mode === "personal" ? "text-white" : "text-slate-600 hover:text-slate-900"
        )}
      >
        <User className="w-4 h-4" />
        <span className="font-medium text-sm whitespace-nowrap">My View</span>
      </button>
      
      <button
        onClick={() => onChange("pulse")}
        className={cn(
          "relative z-10 flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-200",
          mode === "pulse" ? "text-white" : "text-slate-600 hover:text-slate-900"
        )}
      >
        <Globe className="w-4 h-4" />
        <span className="font-medium text-sm whitespace-nowrap">City View</span>
      </button>
    </div>
  )
}