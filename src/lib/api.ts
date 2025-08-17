// Future-proof API architecture for CIVIZ
// Mock data for rapid MVP development, ready for backend swap

import { cityCategories } from "./cityData"

export interface Vision {
  id: string
  imageUrl: string
  promptText: string
  category: string
  categoryId: string
  likes: number
  createdAt: Date
  userId: string
  position?: number
  trending?: boolean
  budgetImpact?: {
    allocated: number
    remaining: number
    percentage: number
  }
}

export interface UserProfile {
  id: string
  name: string
  points: number
  visionsCreated: number
  likesGiven: number
  achievements: string[]
}

// Mock current user ID
const CURRENT_USER_ID = "current_user"

// Generate mock visions for testing
const generateMockVisions = (count: number, isUserVisions: boolean = false): Vision[] => {
  const visions: Vision[] = []
  const prompts = [
    "Transform Market Street with protected bike lanes and green spaces",
    "Create urban forest park with native California plants",
    "Build community center with free coding classes for youth",
    "Install solar panels on all public buildings downtown",
    "Convert parking lots into affordable housing with rooftop gardens",
    "Design pedestrian-only zones with local artist installations",
    "Establish mental health support centers in every neighborhood",
    "Create smart traffic system to reduce congestion by 50%",
    "Build vertical farms to provide fresh food access",
    "Install public art that generates clean energy",
    "Develop waterfront with accessible recreation spaces",
    "Create innovation hubs for local entrepreneurs",
    "Plant 10,000 trees along major corridors",
    "Build elevated park connecting neighborhoods",
    "Install smart waste management system citywide",
    "Create network of community gardens in food deserts",
    "Develop rapid transit to underserved areas",
    "Build climate resilience centers for extreme weather",
    "Install interactive digital kiosks for civic engagement",
    "Create maker spaces in public libraries"
  ]
  
  for (let i = 0; i < count; i++) {
    const category = cityCategories[Math.floor(Math.random() * cityCategories.length)]
    const promptIndex = Math.floor(Math.random() * prompts.length)
    const daysAgo = Math.floor(Math.random() * 30)
    const hoursAgo = Math.floor(Math.random() * 24)
    
    visions.push({
      id: `vision-${isUserVisions ? 'user' : 'city'}-${i}-${Date.now()}`,
      imageUrl: category.image,
      promptText: prompts[promptIndex],
      category: category.name,
      categoryId: category.id,
      likes: isUserVisions 
        ? Math.floor(Math.random() * 50) + 1  // User visions: 1-50 likes
        : Math.floor(Math.random() * 200) + 1, // City visions: 1-200 likes
      createdAt: new Date(Date.now() - (daysAgo * 24 + hoursAgo) * 60 * 60 * 1000),
      userId: isUserVisions ? CURRENT_USER_ID : `user-${Math.floor(Math.random() * 1000)}`,
      trending: Math.random() > 0.7,
      budgetImpact: {
        allocated: category.totalBudget,
        remaining: category.remainingFunding,
        percentage: Math.round(((category.totalBudget - category.remainingFunding) / category.totalBudget) * 100)
      }
    })
  }
  
  return visions
}

// Mock data stores (in-memory for MVP)
let mockMyVisions = generateMockVisions(6, true)
let mockCityVisions = generateMockVisions(20, false)
let userLikedVisions = new Set<string>()

// Mock user profile
const mockUserProfile: UserProfile = {
  id: CURRENT_USER_ID,
  name: "Civic Visionary",
  points: 1250,
  visionsCreated: mockMyVisions.length,
  likesGiven: 0,
  achievements: ["Early Adopter", "Vision Creator", "Community Builder"]
}

// API functions - async for easy backend integration
export const api = {
  visions: {
    // Fetch user's personal visions
    fetchMy: async (): Promise<Vision[]> => {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // Sort by created date (most recent first) then by likes
      return [...mockMyVisions].sort((a, b) => {
        const timeDiff = b.createdAt.getTime() - a.createdAt.getTime()
        if (Math.abs(timeDiff) < 1000 * 60 * 60) { // Within same hour
          return b.likes - a.likes
        }
        return timeDiff
      })
    },
    
    // Fetch all community visions
    fetchCity: async (): Promise<Vision[]> => {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // Sort by likes (democratic ranking)
      return [...mockCityVisions].sort((a, b) => b.likes - a.likes)
    },
    
    // Like/unlike a vision
    like: async (visionId: string): Promise<{ liked: boolean; newLikeCount: number }> => {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 50))
      
      const isLiked = userLikedVisions.has(visionId)
      
      if (isLiked) {
        userLikedVisions.delete(visionId)
      } else {
        userLikedVisions.add(visionId)
      }
      
      // Update like count in mock data
      const updateVision = (vision: Vision) => {
        if (vision.id === visionId) {
          vision.likes = isLiked ? vision.likes - 1 : vision.likes + 1
          return vision
        }
        return vision
      }
      
      mockMyVisions = mockMyVisions.map(updateVision)
      mockCityVisions = mockCityVisions.map(updateVision)
      
      // Find the vision to get new like count
      const vision = [...mockMyVisions, ...mockCityVisions].find(v => v.id === visionId)
      
      return {
        liked: !isLiked,
        newLikeCount: vision?.likes || 0
      }
    },
    
    // Check if user has liked specific visions
    getLikedStatus: async (visionIds: string[]): Promise<Set<string>> => {
      await new Promise(resolve => setTimeout(resolve, 50))
      return new Set(visionIds.filter(id => userLikedVisions.has(id)))
    },
    
    // Create new vision (placeholder)
    create: async (prompt: string, categoryId: string): Promise<Vision> => {
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const category = cityCategories.find(c => c.id === categoryId)
      const newVision: Vision = {
        id: `vision-user-new-${Date.now()}`,
        imageUrl: category?.image || "/placeholder.svg",
        promptText: prompt,
        category: category?.name || "Community",
        categoryId: categoryId,
        likes: 0,
        createdAt: new Date(),
        userId: CURRENT_USER_ID,
        trending: false,
        budgetImpact: {
          allocated: category?.totalBudget || 0,
          remaining: category?.remainingFunding || 0,
          percentage: 0
        }
      }
      
      mockMyVisions = [newVision, ...mockMyVisions]
      mockCityVisions = [newVision, ...mockCityVisions]
      
      return newVision
    }
  },
  
  budget: {
    // Fetch budget categories with real-time data
    fetchCategories: async () => {
      await new Promise(resolve => setTimeout(resolve, 100))
      return cityCategories.map(cat => ({
        ...cat,
        visionsCount: mockCityVisions.filter(v => v.categoryId === cat.id).length,
        totalLikes: mockCityVisions
          .filter(v => v.categoryId === cat.id)
          .reduce((sum, v) => sum + v.likes, 0)
      }))
    }
  },
  
  user: {
    // Fetch user profile
    fetchProfile: async (): Promise<UserProfile> => {
      await new Promise(resolve => setTimeout(resolve, 50))
      return {
        ...mockUserProfile,
        likesGiven: userLikedVisions.size
      }
    },
    
    // Update user points (placeholder)
    updatePoints: async (points: number): Promise<number> => {
      await new Promise(resolve => setTimeout(resolve, 50))
      mockUserProfile.points += points
      return mockUserProfile.points
    }
  },
  
  // Analytics tracking (placeholder for future)
  analytics: {
    trackToggle: async (mode: "personal" | "pulse") => {
      console.log(`[Analytics] View toggled to: ${mode}`)
    },
    
    trackLike: async (visionId: string, liked: boolean) => {
      console.log(`[Analytics] Vision ${liked ? 'liked' : 'unliked'}: ${visionId}`)
    },
    
    trackShare: async (visionId: string, platform: string) => {
      console.log(`[Analytics] Vision shared to ${platform}: ${visionId}`)
    }
  }
}

// Export types and utilities
export type { UserProfile }
export { CURRENT_USER_ID }