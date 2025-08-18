"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { X, Sparkles, Share2, Heart, Crown, Clock, Trophy, Star } from "lucide-react"
import Image from "next/image"
import type { ConversionContext } from "@/lib/guestSession"

interface ConversionModalProps {
  isOpen: boolean
  onClose: () => void
  context: ConversionContext
  onSignUp: () => void
  visionThumbnail?: string
}

export function ConversionModal({ 
  isOpen, 
  onClose, 
  context, 
  onSignUp,
  visionThumbnail 
}: ConversionModalProps) {
  const [isAnimating, setIsAnimating] = useState(false)

  if (!isOpen) return null

  const getContextContent = () => {
    switch (context.trigger) {
      case 'share':
        return {
          icon: <Share2 className="w-8 h-8 text-blue-500" />,
          title: "Share Your Civic Vision",
          subtitle: "Create your free CIVIZ profile to share & climb the leaderboard",
          description: "Show the world your vision and see how it ranks against other civic leaders",
          ctaText: "Create Profile & Share",
          benefits: [
            "🏆 Climb the civic leaderboard",
            "📊 Track your impact & reach", 
            "🎯 Remove watermarks forever",
            "⚡ Unlimited AI generations"
          ]
        }
        
      case 'like':
        return {
          icon: <Heart className="w-8 h-8 text-red-500" />,
          title: "Boost This Vision",
          subtitle: "Sign up to boost this vision and earn points",
          description: "Your likes help great civic ideas rise to the top of the community",
          ctaText: "Sign Up & Like",
          benefits: [
            "❤️ Boost amazing civic visions",
            "💎 Earn points for every action",
            "🌟 Build your civic reputation",
            "🚀 Help great ideas go viral"
          ]
        }
        
      case 'my-view':
        return {
          icon: <Crown className="w-8 h-8 text-purple-500" />,
          title: "Your Personal Civic Dashboard",
          subtitle: "Sign up to save your civic impact dashboard",
          description: "Track all your visions, points, and community influence in one place",
          ctaText: "Create My Dashboard",
          benefits: [
            "📈 Personal impact dashboard",
            "🎨 Save all your AI visions",
            "🏅 Track your civic influence", 
            "🔥 See your hottest content"
          ]
        }
        
      case 'rate-limit':
        return {
          icon: <Clock className="w-8 h-8 text-orange-500" />,
          title: "You've Created Amazing Visions!",
          subtitle: "Sign up to continue unlimited civic visioning",
          description: "You're clearly passionate about civic change. Join our community of civic visionaries!",
          ctaText: "Unlock Unlimited Visions",
          benefits: [
            "🎨 Unlimited AI generations",
            "⚡ No daily limits ever",
            "💎 Premium generation speed",
            "🌟 Watermark-free images"
          ]
        }
        
      case 'watermark':
        return {
          icon: <Star className="w-8 h-8 text-yellow-500" />,
          title: "Save Clean, Professional Images",
          subtitle: "Sign up to save and remove watermarks",
          description: "Get clean, shareable images perfect for presentations and social media",
          ctaText: "Remove Watermarks",
          benefits: [
            "✨ Clean, professional images",
            "📱 Perfect for social sharing",
            "💼 Great for presentations",
            "🎯 Build your civic brand"
          ]
        }
        
      default:
        return {
          icon: <Sparkles className="w-8 h-8 text-blue-500" />,
          title: "Join the Civic Revolution",
          subtitle: "Create your free account in 10 seconds",
          description: "Be part of the community shaping the future of our cities",
          ctaText: "Join CIVIZ",
          benefits: [
            "🎨 Unlimited AI generation",
            "🏆 Civic impact leaderboard",
            "💎 Clean, watermark-free images",
            "🚀 Shape your city's future"
          ]
        }
    }
  }

  const content = getContextContent()

  const handleSignUp = () => {
    setIsAnimating(true)
    setTimeout(() => {
      onSignUp()
    }, 300)
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className={`w-full max-w-md bg-white rounded-2xl shadow-2xl transform transition-all duration-300 ${
        isAnimating ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
      }`}>
        <div className="relative p-6">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
          
          {/* Vision Thumbnail */}
          {visionThumbnail && (
            <div className="mb-4 rounded-xl overflow-hidden shadow-lg">
              <Image
                src={visionThumbnail}
                alt="Your vision"
                width={300}
                height={200}
                className="w-full h-32 object-cover"
              />
            </div>
          )}
          
          {/* Header */}
          <div className="text-center mb-6">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl">
                {content.icon}
              </div>
            </div>
            
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              {content.title}
            </h2>
            
            <p className="text-sm text-blue-600 font-medium mb-2">
              {content.subtitle}
            </p>
            
            <p className="text-sm text-gray-600">
              {content.description}
            </p>
          </div>
          
          {/* Benefits */}
          <div className="space-y-2 mb-6">
            {content.benefits.map((benefit, index) => (
              <div key={index} className="flex items-center text-sm text-gray-700">
                <span className="mr-2">{benefit}</span>
              </div>
            ))}
          </div>
          
          {/* Actions */}
          <div className="space-y-3">
            <Button
              onClick={handleSignUp}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              {content.ctaText}
            </Button>
            
            <button
              onClick={onClose}
              className="w-full text-sm text-gray-500 hover:text-gray-700 py-2 transition-colors"
            >
              Maybe later
            </button>
          </div>
          
          {/* Social Proof */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
              <div className="flex items-center">
                <Trophy className="w-3 h-3 mr-1" />
                <span>Join 10 civic leaders</span>
              </div>
              <div className="flex items-center">
                <Star className="w-3 h-3 mr-1" />
                <span>10-second signup</span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}