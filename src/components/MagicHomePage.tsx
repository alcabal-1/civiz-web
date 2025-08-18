"use client"

import { useState, useEffect, useRef } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Heart,
  Users,
  TreePine,
  Building,
  GraduationCap,
  Shield,
  Zap,
  Coins,
  Menu,
  X,
  TrendingUp,
  Gift,
  Sparkles,
  Image as ImageIcon,
  Eye,
  Crown,
  Share2,
  AlertCircle,
  Star
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { cityCategories, categorizeVision, type CityCategory } from "@/lib/cityData"
import { POINT_VALUES } from "@/lib/pointsSystem"
import { aiImageService } from "@/lib/aiImageService"
import { ViewToggle } from "@/components/ui/view-toggle"
import { ShareButton } from "@/components/ui/share-button"
import { UserMenu } from "@/components/ui/user-menu"
import { ConversionModal } from "@/components/ConversionModal"
import { motion, AnimatePresence } from "framer-motion"
import { 
  getGuestUser, 
  getGuestVisions, 
  addGuestVision,
  updateGuestUser,
  canGenerateAnonymously,
  recordGeneration,
  setConversionContext,
  clearGuestData,
  type ConversionContext,
  type GuestVision 
} from "@/lib/guestSession"
import { addWatermarkToImage } from "@/lib/watermarkService"

// Icon mapping for dynamic loading
const iconMap = {
  Building,
  TreePine, 
  GraduationCap,
  Shield,
  Zap,
  Heart,
  TrendingUp,
  Users,
} as const

interface Vision {
  id: string
  promptText: string
  imageUrl: string
  category: string
  categoryId: string
  likes: number
  trending: boolean
  createdAt: string
  userId: string
  userName?: string
  isAnonymous?: boolean
  hasWatermark?: boolean
}

interface UserData {
  id: string
  email: string
  name: string | null
  points: number
  pointsFromVisions: number
  pointsFromLikes: number
  pointsFromFunding: number
}

export default function MagicHomePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [vision, setVision] = useState("")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrollY, setScrollY] = useState(0)
  const [isFocused, setIsFocused] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [validationError, setValidationError] = useState("")
  const [matchedCategory, setMatchedCategory] = useState<CityCategory | null>(null)
  const [showCategoryMatch, setShowCategoryMatch] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  
  // View mode state with localStorage persistence
  const [viewMode, setViewMode] = useState<"personal" | "pulse">("personal")
  const [myVisions, setMyVisions] = useState<Vision[]>([])
  const [cityVisions, setCityVisions] = useState<Vision[]>([])
  const [userLikedVisions, setUserLikedVisions] = useState<Set<string>>(new Set())
  const [isLoadingVisions, setIsLoadingVisions] = useState(false)
  
  // User data - authenticated or guest
  const [userData, setUserData] = useState<UserData | null>(null)
  const [guestData, setGuestData] = useState<{ points: number; generationsRemaining: number } | null>(null)
  const [likeAnimations, setLikeAnimations] = useState<{[key: string]: boolean}>({})
  const [pointsChange, setPointsChange] = useState<{amount: number, show: boolean}>({amount: 0, show: false})
  const [isGeneratingImage, setIsGeneratingImage] = useState(false)
  const [generationMessage, setGenerationMessage] = useState("")
  const [isClient, setIsClient] = useState(false)
  
  // Conversion modal state
  const [showConversionModal, setShowConversionModal] = useState(false)
  const [conversionContext, setConversionContextState] = useState<ConversionContext | null>(null)
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null)
  
  const MAX_CHARACTERS = 300
  const remainingChars = MAX_CHARACTERS - vision.length
  const isActive = isFocused || vision.length > 0
  const isValidVision = vision.trim().length > 10 && vision.length <= MAX_CHARACTERS

  // Initialize client state and load data
  useEffect(() => {
    setIsClient(true)
    
    // Load saved view mode from localStorage
    const savedMode = localStorage.getItem('civiz-view-mode')
    if (savedMode === 'personal' || savedMode === 'pulse') {
      setViewMode(savedMode)
    }
    
    // Initialize guest data if not authenticated
    if (status === 'unauthenticated') {
      const guest = getGuestUser()
      if (guest) {
        const rateLimitInfo = canGenerateAnonymously()
        setGuestData({
          points: guest.points,
          generationsRemaining: rateLimitInfo.remaining
        })
      }
    }
  }, [status])
  
  // Load user data if authenticated
  useEffect(() => {
    if (session?.user) {
      fetch('/api/user')
        .then(res => res.json())
        .then(data => {
          if (!data.error) {
            setUserData(data)
          }
        })
        .catch(console.error)
    }
  }, [session])
  
  // Load visions - mix guest visions with database visions
  useEffect(() => {
    const loadVisions = async () => {
      setIsLoadingVisions(true)
      try {
        // Load guest visions from localStorage
        const guestVisions = getGuestVisions().map(gv => ({
          ...gv,
          trending: false,
          userName: 'You'
        }))
        
        // Load community visions from database
        const communityRes = await fetch('/api/visions?view=community')
        const communityData = await communityRes.json()
        const dbVisions = !communityData.error ? communityData : []
        
        // Combine and sort
        const allVisions = [...guestVisions, ...dbVisions]
        setCityVisions(allVisions.sort((a, b) => b.likes - a.likes))
        
        // Set personal visions
        if (session?.user) {
          const personalRes = await fetch('/api/visions?view=personal')
          const personalData = await personalRes.json()
          if (!personalData.error) {
            setMyVisions([...guestVisions, ...personalData])
          } else {
            setMyVisions(guestVisions)
          }
        } else {
          setMyVisions(guestVisions)
        }
      } catch (error) {
        console.error("Failed to load visions:", error)
      } finally {
        setIsLoadingVisions(false)
      }
    }
    
    loadVisions()
  }, [session])
  
  // Save view mode to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('civiz-view-mode', viewMode)
    }
  }, [viewMode])

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [vision])

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleVisionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newVision = e.target.value
    setVision(newVision)
    
    // Clear previous validation errors
    setValidationError("")
    
    // Real-time validation
    if (newVision.length > MAX_CHARACTERS) {
      setValidationError(`Vision exceeds ${MAX_CHARACTERS} character limit`)
    } else if (newVision.trim().length > 0 && newVision.trim().length < 10) {
      setValidationError("Vision must be at least 10 characters long")
    }
  }

  const triggerConversionModal = (context: ConversionContext, action?: () => void) => {
    setConversionContext(context)
    setConversionContextState(context)
    setShowConversionModal(true)
    if (action) {
      setPendingAction(() => action)
    }
  }

  const handleConversionModalSignUp = () => {
    setShowConversionModal(false)
    router.push('/auth/signup')
  }

  const handleVisionSubmit = async () => {
    if (!isValidVision) {
      setValidationError("Please enter a valid vision (10-300 characters)")
      return
    }

    // Check if authenticated user or rate limit for anonymous
    if (!session?.user) {
      const rateLimitInfo = canGenerateAnonymously()
      if (!rateLimitInfo.allowed) {
        triggerConversionModal({
          trigger: 'rate-limit',
          customMessage: "You've created amazing visions! Sign up for unlimited generations."
        })
        return
      }
    }

    setIsSubmitting(true)
    setValidationError("")

    try {
      // Match vision with city funding category
      const matchedCat = categorizeVision(vision.trim())
      setMatchedCategory(matchedCat)
      
      // Show category match result
      if (matchedCat) {
        setShowCategoryMatch(true)
        setTimeout(() => setShowCategoryMatch(false), 4000)
      }

      // Start AI image generation
      setIsGeneratingImage(true)
      setGenerationMessage("✨ Generating your civic vision...")
      
      try {
        // Generate AI image
        const generatedImage = await aiImageService.generateCivicVision(
          vision.trim(),
          matchedCat?.id || 'community-services'
        )
        
        let finalImageUrl = generatedImage.imageUrl
        
        // Add watermark for anonymous users
        if (!session?.user) {
          try {
            finalImageUrl = await addWatermarkToImage(generatedImage.imageUrl)
          } catch (error) {
            console.warn("Failed to add watermark:", error)
            // Continue with unwatermarked image
          }
        }
        
        if (session?.user) {
          // Authenticated user - save to database
          const response = await fetch('/api/visions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              promptText: vision.trim(),
              imageUrl: finalImageUrl,
              category: matchedCat?.name || 'Community Services',
              categoryId: generatedImage.categoryId
            })
          })
          
          if (response.ok) {
            const newVision = await response.json()
            
            // Update local state
            setMyVisions(prev => [newVision, ...prev])
            setCityVisions(prev => [newVision, ...prev])
            
            // Update user points
            if (userData) {
              setUserData({
                ...userData,
                points: userData.points + POINT_VALUES.VISION_SUBMISSION,
                pointsFromVisions: userData.pointsFromVisions + POINT_VALUES.VISION_SUBMISSION
              })
            }
            showPointsChange(POINT_VALUES.VISION_SUBMISSION)
          }
        } else {
          // Anonymous user - save to localStorage
          const guestVision = addGuestVision({
            promptText: vision.trim(),
            imageUrl: finalImageUrl,
            category: matchedCat?.name || 'Community Services',
            categoryId: generatedImage.categoryId,
            likes: 0,
            createdAt: new Date().toISOString()
          })
          
          recordGeneration()
          
          // Update local state
          const visionForDisplay = {
            ...guestVision,
            trending: false,
            userName: 'You'
          }
          
          setMyVisions(prev => [visionForDisplay, ...prev])
          setCityVisions(prev => [visionForDisplay, ...prev])
          
          // Update guest points
          const updatedGuest = getGuestUser()
          if (updatedGuest) {
            const rateLimitInfo = canGenerateAnonymously()
            setGuestData({
              points: updatedGuest.points,
              generationsRemaining: rateLimitInfo.remaining
            })
          }
          
          showPointsChange(POINT_VALUES.VISION_SUBMISSION)
          
          // Show conversion hint for rate limiting
          if (guestData?.generationsRemaining === 1) {
            setTimeout(() => {
              setGenerationMessage("🎨 Last free vision! Sign up for unlimited generations.")
            }, 2000)
          }
        }
        
        setGenerationMessage("✨ Your civic vision has been created!")
        setTimeout(() => {
          setGenerationMessage("")
          setIsGeneratingImage(false)
        }, 3000)
        
      } catch (error) {
        console.error("Failed to generate/save vision:", error)
        setGenerationMessage("⚠️ Failed to create vision")
        setTimeout(() => setGenerationMessage(""), 3000)
      } finally {
        setIsGeneratingImage(false)
      }
      
      // Clear the form
      setVision("")
      setIsFocused(false)
      
    } catch (error) {
      setValidationError("Failed to submit vision. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Show points change animation
  const showPointsChange = (amount: number) => {
    setPointsChange({ amount, show: true })
    setTimeout(() => {
      setPointsChange({ amount: 0, show: false })
    }, 2000)
  }
  
  // Handle like with conversion modal
  const handleVisionLike = (visionId: string, visionImageUrl?: string) => {
    if (!session?.user) {
      triggerConversionModal({
        trigger: 'like',
        visionId,
        visionThumbnail: visionImageUrl
      })
      return
    }

    // Proceed with like logic for authenticated users
    // ... existing like logic
  }
  
  // Handle share with conversion modal
  const handleVisionShare = (visionId: string, visionImageUrl?: string) => {
    if (!session?.user) {
      triggerConversionModal({
        trigger: 'share',
        visionId,
        visionThumbnail: visionImageUrl
      })
      return
    }
    
    // Proceed with share logic
    // ... existing share logic
  }
  
  // Handle My View toggle with conversion modal
  const handleViewModeChange = (mode: "personal" | "pulse") => {
    if (mode === 'personal' && !session?.user && myVisions.length === 0) {
      triggerConversionModal({
        trigger: 'my-view'
      })
      return
    }
    
    setViewMode(mode)
    setIsLoadingVisions(true)
    setTimeout(() => setIsLoadingVisions(false), 300)
  }
  
  // Prepare visions for grid display
  const getGridVisions = (): Vision[] => {
    if (viewMode === "personal") {
      if (myVisions.length === 0) {
        return cityVisions.slice(0, 9)
      }
      
      const sortedByDate = [...myVisions].sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      
      return sortedByDate.slice(0, 9)
    } else {
      return cityVisions.slice(0, 9)
    }
  }

  const currentPoints = session?.user ? userData?.points : guestData?.points
  const generationsRemaining = session?.user ? "Unlimited" : guestData?.generationsRemaining

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  CIVIZ
                </h1>
              </div>

              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center space-x-8">
                <UserMenu session={session} userPoints={currentPoints} />
              </nav>

              {/* Mobile Menu Button */}
              <button
                className="md:hidden flex items-center justify-center p-2 rounded-md text-slate-600 hover:text-blue-600 hover:bg-blue-50"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </header>

        {/* Vision Grid Section */}
        <section className="pt-16 pb-8">
          <div className="max-w-4xl mx-auto px-4">
            {/* View Toggle and Title */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-1">
                  {viewMode === "personal" ? "Your Civic Impact" : "Community Pulse"}
                </h2>
                <p className="text-sm text-slate-600">
                  {viewMode === "personal" 
                    ? "Your visions and favorites" 
                    : "What our community is envisioning together"}
                </p>
                {!session?.user && (
                  <p className="text-xs text-blue-600 mt-1 font-medium">
                    🎨 {generationsRemaining} free AI generations remaining • 
                    <span className="underline cursor-pointer" onClick={() => triggerConversionModal({ trigger: 'rate-limit' })}>
                      Sign up for unlimited
                    </span>
                  </p>
                )}
              </div>
              <ViewToggle 
                mode={viewMode} 
                onChange={handleViewModeChange}
              />
            </div>
            
            <AnimatePresence mode="wait">
              <motion.div 
                key={viewMode}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-3 gap-1 rounded-2xl overflow-hidden shadow-2xl"
              >
              {isGeneratingImage && (
                <div className="relative aspect-square group cursor-pointer overflow-hidden bg-gradient-to-br from-purple-500 to-blue-500">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center px-3">
                      <div className="relative">
                        <Sparkles className="w-12 h-12 text-white animate-pulse mx-auto mb-3" />
                        <div className="absolute inset-0 blur-xl bg-white/20 animate-ping" />
                      </div>
                      <div className="text-white text-sm font-bold mb-1">
                        {generationMessage || "✨ Generating your vision..."}
                      </div>
                      <div className="text-white/80 text-xs">
                        AI is creating your civic vision
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Display visions based on mode */}
              {getGridVisions().slice(0, isGeneratingImage ? 8 : 9).map((vision, index) => {
                const category = cityCategories.find(cat => cat.id === vision.categoryId)
                if (!category) return null
                
                const IconComponent = iconMap[category.icon as keyof typeof iconMap]
                const isLiked = userLikedVisions.has(vision.id)
                const showAnimation = likeAnimations[vision.id]
                const isHeroSpot = viewMode === "personal" && index === 0 && (vision.userId === session?.user?.id || vision.isAnonymous)
                const isUserVision = vision.userId === session?.user?.id || vision.isAnonymous
                
                const position = index + 1
                
                return (
                  <motion.div 
                    key={vision.id} 
                    layoutId={vision.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className={`relative aspect-square group cursor-pointer overflow-hidden ${
                      isHeroSpot ? 'ring-2 ring-purple-500 ring-opacity-75' : 
                      position <= 3 && viewMode === "pulse" ? 'ring-2 ring-yellow-400 ring-opacity-60' : ''
                    }`}>
                    <Image
                      src={vision.imageUrl || "/placeholder.svg"}
                      alt={vision.promptText}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    
                    {/* Watermark indicator for anonymous images */}
                    {vision.hasWatermark && (
                      <div className="absolute top-3 left-3 z-10">
                        <button
                          onClick={() => triggerConversionModal({ 
                            trigger: 'watermark', 
                            visionId: vision.id, 
                            visionThumbnail: vision.imageUrl 
                          })}
                          className="bg-black/50 text-white text-[10px] px-2 py-1 rounded-full backdrop-blur-sm hover:bg-black/70 transition-colors"
                        >
                          <Star className="w-3 h-3 inline mr-1" />
                          Remove watermark
                        </button>
                      </div>
                    )}
                    
                    {/* Hero Badge for personal view */}
                    {isHeroSpot && !vision.hasWatermark && (
                      <div className="absolute top-3 left-3 z-10">
                        <div className="bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg flex items-center">
                          <Crown className="w-3 h-3 mr-1" />
                          Most Recent
                        </div>
                      </div>
                    )}
                    
                    {/* Position Badge for City View */}
                    {viewMode === "pulse" && position <= 3 && !vision.hasWatermark && (
                      <div className="absolute top-3 left-3 z-10">
                        <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg flex items-center">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          #{position}
                        </div>
                      </div>
                    )}
                    
                    {/* Action Buttons */}
                    <div className="absolute top-3 right-3 flex items-center space-x-1 z-10">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleVisionShare(vision.id, vision.imageUrl)
                        }}
                        className="p-2 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/40 hover:shadow-md transition-all duration-200 transform hover:scale-110 active:scale-95"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleVisionLike(vision.id, vision.imageUrl)
                        }}
                        className={`p-2 rounded-full transition-all duration-200 
                          transform hover:scale-110 active:scale-95 
                          ${
                          isLiked 
                            ? 'bg-red-500 text-white shadow-lg hover:bg-red-600' 
                            : 'bg-white/20 backdrop-blur-sm text-white hover:bg-white/40 hover:shadow-md'
                        }`}
                      >
                        <Heart className={`w-4 h-4 transition-all duration-200 ${isLiked ? 'fill-current' : ''}`} />
                      </button>
                    </div>

                    {/* Like Animation */}
                    {showAnimation && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                        <div className="relative">
                          <div className="absolute inset-0 bg-red-500 rounded-full blur-xl animate-ping" />
                          <div className="relative bg-red-500 text-white px-4 py-2 rounded-full shadow-xl animate-bounce font-semibold">
                            +{POINT_VALUES.IMAGE_LIKE} pt
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div className="absolute inset-0 flex flex-col justify-end p-3">
                      <div
                        className={`w-8 h-8 ${category.color} rounded-lg flex items-center justify-center mb-2 opacity-90`}
                      >
                        <IconComponent className="w-4 h-4 text-white" />
                      </div>
                      <h3 className="text-white font-semibold text-sm leading-tight">{category.name}</h3>
                      
                      <div className="mt-1">
                        <div className="flex items-center justify-between text-xs text-white/80">
                          <span className="flex items-center">
                            <Heart className="w-3 h-3 mr-1 fill-current" />
                            {vision.likes}
                          </span>
                          <div className="flex items-center space-x-1">
                            {vision.trending && (
                              <span className="bg-red-500 text-white px-1 py-0.5 rounded text-[10px] font-bold">
                                HOT
                              </span>
                            )}
                            {isUserVision && (
                              <Sparkles className="w-3 h-3 text-purple-300" />
                            )}
                          </div>
                        </div>
                        {vision.userName && (
                          <div className="text-[10px] text-white/60 mt-1">
                            by {vision.userName}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )
              })}
              </motion.div>
            </AnimatePresence>
            
            {/* View All Button */}
            <div className="mt-6 text-center">
              <Link href="/gallery">
                <Button variant="outline" className="group">
                  <Eye className="w-4 h-4 mr-2" />
                  View All Visions
                  <span className="ml-2 text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">
                    {viewMode === "personal" ? myVisions.length : cityVisions.length}+
                  </span>
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Vision Input Section */}
        <div className="fixed inset-x-0 z-40 px-4 pointer-events-none" style={{ top: `${Math.max(180, 280 - scrollY * 0.4)}px` }}>
          <div className="max-w-lg mx-auto pointer-events-auto">
            <div className="relative">
              <textarea
                ref={textareaRef}
                value={vision}
                onChange={handleVisionChange}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder="I envision a San Francisco where..."
                maxLength={MAX_CHARACTERS}
                className={`w-full text-slate-800 placeholder-slate-500 bg-white/95 backdrop-blur-md border-0 shadow-xl rounded-xl resize-none focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-300 overflow-hidden ${
                  isActive ? "min-h-16 p-4 text-base pb-8" : "h-10 px-4 py-2 text-sm text-center"
                } ${validationError ? "ring-2 ring-red-400" : ""}`}
              />
              
              {/* Character Counter */}
              {isActive && (
                <div className="absolute bottom-2 right-3 text-xs">
                  <span className={`${remainingChars < 20 ? 'text-red-500' : 'text-slate-400'}`}>
                    {remainingChars} left
                  </span>
                </div>
              )}
            </div>
            
            {/* Validation Message */}
            {validationError && (
              <div className="mt-2 text-center">
                <span className="text-red-500 text-sm bg-white/95 px-3 py-1 rounded-full shadow-lg">
                  {validationError}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className={`fixed z-40 pointer-events-none transition-all duration-300 ${isActive ? "opacity-100" : "opacity-0"}`}
          style={{ top: `${Math.max(260, 360 - scrollY * 0.5)}px`, right: "20px" }}>
          <div className="pointer-events-auto">
            <Button
              onClick={handleVisionSubmit}
              size="sm"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2 rounded-full text-sm font-semibold shadow-xl hover:shadow-2xl transition-all disabled:opacity-50"
              disabled={!isValidVision || isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>{isGeneratingImage ? "Generating..." : "Submitting..."}</span>
                </div>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Create Vision
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Points indicator */}
        {isClient && currentPoints !== undefined && (
          <div className="fixed top-4 right-4 z-50">
            <div className="flex items-center space-x-2 bg-gradient-to-r from-blue-50 to-purple-50 px-4 py-2 rounded-full group relative">
              <Coins className="w-4 h-4 text-blue-600" />
              <span className="font-semibold text-blue-600">
                {currentPoints.toLocaleString()}
              </span>
              {!session?.user && (
                <button
                  onClick={() => triggerConversionModal({ trigger: 'rate-limit' })}
                  className="text-xs text-blue-500 hover:text-blue-700 underline ml-1"
                >
                  Unlock ∞
                </button>
              )}
              
              {/* Points Change Animation */}
              {pointsChange.show && (
                <div className={`absolute -top-8 left-1/2 transform -translate-x-1/2 px-2 py-1 rounded-full text-xs font-semibold animate-bounce ${
                  pointsChange.amount > 0 ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                }`}>
                  {pointsChange.amount > 0 ? '+' : ''}{pointsChange.amount}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Category Match Notification */}
        {showCategoryMatch && matchedCategory && (
          <div className="fixed inset-x-0 top-20 z-50 px-4 pointer-events-none">
            <div className="max-w-md mx-auto pointer-events-auto">
              <div className="bg-white/95 backdrop-blur-md border border-green-200 rounded-xl shadow-xl p-4 animate-in slide-in-from-top duration-500">
                <div className="flex items-start space-x-3">
                  <div className={`w-8 h-8 ${matchedCategory.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    {(() => {
                      const IconComponent = iconMap[matchedCategory.icon as keyof typeof iconMap]
                      return <IconComponent className="w-4 h-4 text-white" />
                    })()}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-green-800 mb-1">Vision Matched!</h4>
                    <p className="text-sm text-green-700">
                      Your vision fits: <span className="font-medium">{matchedCategory.name}</span>
                    </p>
                  </div>
                  <div className="text-green-600">
                    <Gift className="w-5 h-5" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content - Rest of the page */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-32">
          <section id="community" className="mb-8">
            <h2 className="text-3xl font-bold mb-4">Community Categories</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {cityCategories.map((category, index) => {
                const IconComponent = iconMap[category.icon as keyof typeof iconMap]
                return (
                  <Card key={index} className={`bg-white ${category.color}`}>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <IconComponent className="w-6 h-6 text-white" />
                        <span className="text-white">{category.name}</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Image
                        src={category.image || "/placeholder.svg"}
                        alt={category.name}
                        width={300}
                        height={200}
                        className="mb-4"
                      />
                      <p className="text-lg text-slate-600">
                        {category.description}
                      </p>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </section>
        </main>
      </div>

      {/* Conversion Modal */}
      {conversionContext && (
        <ConversionModal
          isOpen={showConversionModal}
          onClose={() => setShowConversionModal(false)}
          context={conversionContext}
          onSignUp={handleConversionModalSignUp}
          visionThumbnail={conversionContext.visionThumbnail}
        />
      )}
    </>
  )
}