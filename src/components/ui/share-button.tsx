"use client"

import { useState } from "react"
import { Button } from "./button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./dialog"
import { Share2, Copy, Twitter, Facebook, Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface ShareButtonProps {
  visionId: string
  promptText: string
  position?: number
  category: string
  className?: string
}

export function ShareButton({ visionId, promptText, position, category, className }: ShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  
  const shareUrl = typeof window !== 'undefined' ? window.location.origin : ''
  const shareMessage = position 
    ? `Check out my civic vision: "${promptText}" - it's #${position} in ${category}! 🚀`
    : `Check out this civic vision: "${promptText}" in ${category}! 🌆`
  
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`${shareMessage}\n${shareUrl}`)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }
  
  const handleTwitterShare = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareMessage)}&url=${encodeURIComponent(shareUrl)}`
    window.open(twitterUrl, '_blank')
  }
  
  const handleFacebookShare = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareMessage)}`
    window.open(facebookUrl, '_blank')
  }
  
  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(true)}
        className={cn("", className)}
      >
        <Share2 className="w-4 h-4" />
      </Button>
      
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share Vision</DialogTitle>
            <DialogDescription>
              Share this civic vision with your community
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="text-sm text-slate-600 line-clamp-3">
                {shareMessage}
              </p>
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant="outline"
                onClick={handleCopy}
                className="flex flex-col items-center gap-2 h-auto py-3"
              >
                {copied ? (
                  <Check className="w-5 h-5 text-green-600" />
                ) : (
                  <Copy className="w-5 h-5" />
                )}
                <span className="text-xs">{copied ? 'Copied!' : 'Copy'}</span>
              </Button>
              
              <Button
                variant="outline"
                onClick={handleTwitterShare}
                className="flex flex-col items-center gap-2 h-auto py-3"
              >
                <Twitter className="w-5 h-5 text-[#1DA1F2]" />
                <span className="text-xs">Twitter</span>
              </Button>
              
              <Button
                variant="outline"
                onClick={handleFacebookShare}
                className="flex flex-col items-center gap-2 h-auto py-3"
              >
                <Facebook className="w-5 h-5 text-[#4267B2]" />
                <span className="text-xs">Facebook</span>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}