"use client"
import { useState, useEffect, useRef } from "react"
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
} from "lucide-react"
import Image from "next/image"
import { cityCategories, categorizeVision, type CityCategory } from "@/lib/cityData"
import { 
  type ImageData, 
  type UserPointsData, 
  updateImageOnLike,
  updateImageOnUnlike,
  updateUserPointsOnLike,
  updateUserPointsOnUnlike,
  sortImagesByPoints,
  POINT_VALUES 
} from "@/lib/pointsSystem"
import { DalleService, visionToImageRequest, type GeneratedImage } from "@/lib/dalleService"

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

// Mock image data for each category
const createMockImages = (): ImageData[] => {
  const mockImages: ImageData[] = []
  
  cityCategories.forEach((category, categoryIndex) => {
    // Create 1-2 images per category
    const imageCount = Math.floor(Math.random() * 2) + 1
    
    for (let i = 0; i < imageCount; i++) {
      const imageId = `${category.id}-${i}`
      const likes = Math.floor(Math.random() * 15) + 2 // 2-16 likes
      const submitterPoints = Math.floor(Math.random() * 500) + 100 // 100-600 points
      
      mockImages.push({
        id: imageId,
        categoryId: category.id,
        imageUrl: category.image,
        title: `${category.name} Vision ${i + 1}`,
        description: `Community vision for better ${category.name.toLowerCase()}`,
        submitterPoints,
        likes,
        points: likes + Math.floor(submitterPoints * 0.1),
        likedBy: [], // Will be populated dynamically
        submitterId: `user-${Math.floor(Math.random() * 100)}`,
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) // Last 30 days
      })
    }
  })
  
  return sortImagesByPoints(mockImages)
}

const CURRENT_USER_ID = "current-user" // Mock current user ID

export default function CivizHomepage() {
  const [vision, setVision] = useState("")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrollY, setScrollY] = useState(0)
  const [isFocused, setIsFocused] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [validationError, setValidationError] = useState("")
  const [matchedCategory, setMatchedCategory] = useState<CityCategory | null>(null)
  const [showCategoryMatch, setShowCategoryMatch] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  
  // Points system state
  const [userPointsData, setUserPointsData] = useState<UserPointsData>({
    totalPoints: 1250,
    pointsFromVisions: 1200,
    pointsFromLikes: 25,
    pointsFromFunding: 25,
    likedImages: []
  })
  const [imageData, setImageData] = useState<ImageData[]>([])
  const [likeAnimations, setLikeAnimations] = useState<{[key: string]: boolean}>({})
  const [pointsChange, setPointsChange] = useState<{amount: number, show: boolean}>({amount: 0, show: false})
  const [isGeneratingImage, setIsGeneratingImage] = useState(false)
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([])
  
  const MAX_CHARACTERS = 300
  const remainingChars = MAX_CHARACTERS - vision.length
  const isActive = isFocused || vision.length > 0
  const isValidVision = vision.trim().length > 10 && vision.length <= MAX_CHARACTERS

  // Initialize mock image data
  useEffect(() => {
    const testImages: ImageData[] = cityCategories.slice(0, 9).map((category, index) => ({
      id: `test-${category.id}-${index}`,
      categoryId: category.id,
      imageUrl: category.image,
      title: `${category.name} Vision`,
      description: `Test vision for ${category.name}`,
      submitterPoints: 100 + index * 50,
      likes: Math.floor(Math.random() * 10) + 1,
      points: Math.floor(Math.random() * 50) + 10,
      likedBy: [],
      submitterId: `user-${index}`,
      createdAt: new Date()
    }))
    
    setImageData(testImages)
  }, [])

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

  const handleVisionSubmit = async () => {
    if (!isValidVision) {
      setValidationError("Please enter a valid vision (10-300 characters)")
      return
    }

    setIsSubmitting(true)
    setValidationError("")

    try {
      // Match vision with city funding category
      const matchedCat = categorizeVision(vision.trim())
      setMatchedCategory(matchedCat)
      
      // Update points (3 points for vision submission)
      setUserPointsData(prev => ({
        ...prev,
        totalPoints: prev.totalPoints + POINT_VALUES.VISION_SUBMISSION,
        pointsFromVisions: prev.pointsFromVisions + POINT_VALUES.VISION_SUBMISSION
      }))
      showPointsChange(POINT_VALUES.VISION_SUBMISSION)
      
      // Show category match result
      if (matchedCat) {
        setShowCategoryMatch(true)
        console.log("Vision matched to category:", matchedCat.name)
        console.log("Category budget info:", {
          totalBudget: matchedCat.totalBudget,
          remainingFunding: matchedCat.remainingFunding,
          directFunding: matchedCat.directFunding
        })
        
        // Hide category match after 4 seconds
        setTimeout(() => setShowCategoryMatch(false), 4000)
      }

      // Start image generation with DALL-E
      setIsGeneratingImage(true)
      try {
        const imageRequest = visionToImageRequest(
          vision.trim(), 
          matchedCat?.name, 
          'realistic'
        )
        
        // Generate image using DALL-E
        const generatedImage = await DalleService.generateImage(imageRequest)
        
        // Convert generated image to ImageData format
        const newImageData: ImageData = {
          id: generatedImage.id,
          categoryId: matchedCat?.id || 'community-services',
          imageUrl: generatedImage.imageUrl,
          title: `Vision: ${vision.trim().slice(0, 50)}...`,
          description: vision.trim(),
          submitterPoints: userPointsData.totalPoints,
          likes: 0,
          points: Math.floor(userPointsData.totalPoints * 0.1), // 10% of submitter points as starting points
          likedBy: [],
          submitterId: CURRENT_USER_ID,
          createdAt: generatedImage.generatedAt
        }
        
        // Add new image to the grid
        setImageData(prev => sortImagesByPoints([newImageData, ...prev]))
        setGeneratedImages(prev => [generatedImage, ...prev])
        
        console.log("Generated image for vision:", generatedImage.imageUrl)
        
      } catch (imageError) {
        console.error("Failed to generate image:", imageError)
        // Continue with vision submission even if image generation fails
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

  // Handle image like/unlike
  const handleImageLike = (imageId: string) => {
    const image = imageData.find(img => img.id === imageId)
    if (!image) return

    const isCurrentlyLiked = userPointsData.likedImages.includes(imageId)

    if (isCurrentlyLiked) {
      // Unlike the image
      const updatedImage = updateImageOnUnlike(image, CURRENT_USER_ID, userPointsData.totalPoints)
      const updatedUserPoints = updateUserPointsOnUnlike(userPointsData, imageId)
      
      setImageData(prev => 
        sortImagesByPoints(prev.map(img => img.id === imageId ? updatedImage : img))
      )
      setUserPointsData(updatedUserPoints)
      showPointsChange(-POINT_VALUES.IMAGE_LIKE)
    } else {
      // Like the image
      const updatedImage = updateImageOnLike(image, CURRENT_USER_ID, userPointsData.totalPoints)
      const updatedUserPoints = updateUserPointsOnLike(userPointsData, imageId)
      
      setImageData(prev => 
        sortImagesByPoints(prev.map(img => img.id === imageId ? updatedImage : img))
      )
      setUserPointsData(updatedUserPoints)
      showPointsChange(POINT_VALUES.IMAGE_LIKE)

      // Show like animation
      setLikeAnimations(prev => ({ ...prev, [imageId]: true }))
      setTimeout(() => {
        setLikeAnimations(prev => ({ ...prev, [imageId]: false }))
      }, 1000)
    }
  }

  return (
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
              <a href="#impact" className="text-slate-600 hover:text-blue-600 font-medium transition-colors">
                Impact
              </a>
              <a href="#vision" className="text-slate-600 hover:text-blue-600 font-medium transition-colors">
                Vision
              </a>
              <a href="#community" className="text-slate-600 hover:text-blue-600 font-medium transition-colors">
                Community
              </a>
              <div className="flex items-center space-x-2 bg-gradient-to-r from-blue-50 to-purple-50 px-4 py-2 rounded-full group relative">
                <Coins className="w-4 h-4 text-blue-600" />
                <span className="font-semibold text-blue-600">{userPointsData.totalPoints.toLocaleString()}</span>
                
                {/* Points Change Animation */}
                {pointsChange.show && (
                  <div className={`absolute -top-8 left-1/2 transform -translate-x-1/2 px-2 py-1 rounded-full text-xs font-semibold animate-bounce ${
                    pointsChange.amount > 0 
                      ? 'bg-green-500 text-white' 
                      : 'bg-red-500 text-white'
                  }`}>
                    {pointsChange.amount > 0 ? '+' : ''}{pointsChange.amount}
                  </div>
                )}
                
                {/* Points Breakdown Tooltip */}
                <div className="absolute top-full left-0 mt-2 bg-white/95 backdrop-blur-md border border-gray-200 rounded-lg shadow-xl p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 min-w-48">
                  <div className="text-xs space-y-1">
                    <div className="font-semibold text-gray-700 mb-2">Points Breakdown:</div>
                    <div className="flex justify-between text-gray-600">
                      <span>Visions:</span>
                      <span className="font-medium text-blue-600">{userPointsData.pointsFromVisions}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Likes:</span>
                      <span className="font-medium text-green-600">{userPointsData.pointsFromLikes}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Funding:</span>
                      <span className="font-medium text-purple-600">{userPointsData.pointsFromFunding}</span>
                    </div>
                    <hr className="my-2" />
                    <div className="flex justify-between font-semibold text-gray-800">
                      <span>Total:</span>
                      <span className="text-blue-600">{userPointsData.totalPoints}</span>
                    </div>
                  </div>
                </div>
              </div>
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

      {/* Tight 3x3 Civic Impact Collage */}
      <section className="pt-16 pb-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="grid grid-cols-3 gap-1 rounded-2xl overflow-hidden shadow-2xl">
            {isGeneratingImage && imageData.length < 9 && (
              <div className="relative aspect-square group cursor-pointer overflow-hidden bg-gradient-to-br from-purple-500 to-blue-500">
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                
                {/* Generation Animation */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <Sparkles className="w-8 h-8 text-white animate-pulse mx-auto mb-2" />
                    <div className="text-white text-xs font-semibold animate-bounce">
                      Generating...
                    </div>
                  </div>
                </div>
                
                <div className="absolute inset-0 flex flex-col justify-end p-3">
                  <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center mb-2 opacity-90">
                    <ImageIcon className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="text-white font-semibold text-sm leading-tight">AI Generated Vision</h3>
                  <div className="flex items-center justify-between mt-1 text-white/80 text-xs">
                    <span>Creating...</span>
                    <span className="flex items-center">
                      <Sparkles className="w-3 h-3 mr-1" />
                      AI
                    </span>
                  </div>
                </div>
              </div>
            )}
            {imageData.slice(0, isGeneratingImage ? 8 : 9).map((image, index) => {
              const category = cityCategories.find(cat => cat.id === image.categoryId)
              if (!category) return null
              
              const IconComponent = iconMap[category.icon as keyof typeof iconMap]
              const isLiked = userPointsData.likedImages.includes(image.id)
              const showAnimation = likeAnimations[image.id]
              
              return (
                <div key={image.id} className="relative aspect-square group cursor-pointer overflow-hidden">
                  <Image
                    src={image.imageUrl || "/placeholder.svg"}
                    alt={image.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  
                  {/* Like Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleImageLike(image.id)
                    }}
                    className={`absolute top-3 right-3 p-2 rounded-full transition-all duration-200 ${
                      isLiked 
                        ? 'bg-red-500 text-white shadow-lg' 
                        : 'bg-white/20 text-white hover:bg-white/30'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                  </button>

                  {/* Like Animation */}
                  {showAnimation && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="bg-red-500 text-white px-3 py-2 rounded-full shadow-xl animate-bounce">
                        +{POINT_VALUES.IMAGE_LIKE} pt
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
                    
                    {/* Points and Likes Display */}
                    <div className="flex items-center justify-between mt-1 text-white/80 text-xs">
                      <span>{image.likes} likes</span>
                      <div className="flex items-center space-x-1">
                        <span>{image.points} pts</span>
                        {image.submitterId === CURRENT_USER_ID && (
                          <Sparkles className="w-3 h-3 text-purple-300" />
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-blue-600/0 group-hover:bg-blue-600/20 transition-colors duration-300" />
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Floating Title Text */}
      <div
        className="fixed inset-x-0 z-40 px-4 pointer-events-none"
        style={{
          top: `${Math.max(120, 200 - scrollY * 0.3)}px`,
        }}
      >
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-4xl font-bold text-white drop-shadow-lg transition-opacity duration-300">
            Share Your Vision for
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent drop-shadow-lg">
              {" "}
              San Francisco
            </span>
          </h2>
        </div>
      </div>

      {/* Dynamic Growing Input Field */}
      <div
        className="fixed inset-x-0 z-40 px-4 pointer-events-none"
        style={{
          top: `${Math.max(180, 280 - scrollY * 0.4)}px`,
        }}
      >
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

      {/* Floating Points Indicator */}
      <div
        className={`fixed z-40 pointer-events-none transition-all duration-300 ${
          isActive ? "opacity-100" : "opacity-0"
        }`}
        style={{
          top: `${Math.max(260, 360 - scrollY * 0.5)}px`,
          left: "20px",
        }}
      >
        <div className="pointer-events-auto">
          <div className="flex items-center space-x-2 bg-white/95 backdrop-blur-md px-3 py-2 rounded-full shadow-xl">
            <Gift className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-semibold text-blue-600">+3 pts</span>
          </div>
        </div>
      </div>

      {/* Floating Submit Button */}
      <div
        className={`fixed z-40 pointer-events-none transition-all duration-300 ${
          isActive ? "opacity-100" : "opacity-0"
        }`}
        style={{
          top: `${Math.max(260, 360 - scrollY * 0.5)}px`,
          right: "20px",
        }}
      >
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
                <span>{isGeneratingImage ? "Generating Image..." : "Submitting..."}</span>
              </div>
            ) : (
              "Submit Vision"
            )}
          </Button>
        </div>
      </div>

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
                  <p className="text-xs text-green-600 mt-1">
                    Budget: ${matchedCategory.totalBudget}M • Available: ${matchedCategory.remainingFunding}M
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

      {/* Spacer for when elements are in normal flow */}
      <div className="h-8" style={{ marginTop: scrollY > 400 ? "0" : "50px" }} />

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-16 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col space-y-4 p-4">
              <a href="#impact" className="text-slate-600 hover:text-blue-600 font-medium transition-colors">
                Impact
              </a>
              <a href="#vision" className="text-slate-600 hover:text-blue-600 font-medium transition-colors">
                Vision
              </a>
              <a href="#community" className="text-slate-600 hover:text-blue-600 font-medium transition-colors">
                Community
              </a>
            </div>
          </div>
        </nav>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <section id="impact" className="mb-8">
          <h2 className="text-3xl font-bold mb-4">Our Impact</h2>
          <p className="text-lg text-slate-600">
            We are making a positive impact in our community by focusing on various civic categories.
          </p>
        </section>

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
                    <div className="mt-3 space-y-2">
                      <div className="text-sm">
                        <span className="font-semibold">Budget:</span> ${category.totalBudget}M
                      </div>
                      <div className="text-sm">
                        <span className="font-semibold">Remaining:</span> ${category.remainingFunding}M
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </section>
      </main>
    </div>
  )
}
