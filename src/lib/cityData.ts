// San Francisco City Funding Categories Data Structure
// Based on SF's actual budget categories with mock data for development

export interface CityCategory {
  id: string
  name: string
  icon: string // Lucide icon name
  color: string // Tailwind color class
  totalBudget: number // in millions
  directFunding: number // in millions
  nonprofitFunding: number // in millions
  budgetDeficit: number // in millions (negative if surplus)
  remainingFunding: number // in millions
  impactMetrics: string[]
  keywords: string[] // For vision matching
  description: string
  image: string
}

export const cityCategories: CityCategory[] = [
  {
    id: "housing-development",
    name: "Housing & Development",
    icon: "Building",
    color: "bg-blue-500",
    totalBudget: 850.5,
    directFunding: 520.3,
    nonprofitFunding: 180.2,
    budgetDeficit: -15.8,
    remainingFunding: 134.2,
    impactMetrics: [
      "2,400 affordable housing units planned",
      "15% increase in homeownership assistance",
      "85% of projects completed on time"
    ],
    keywords: [
      "housing", "apartment", "home", "rent", "affordable", "development", 
      "construction", "building", "shelter", "homeless", "zoning", "property"
    ],
    description: "Creating affordable housing and sustainable urban development",
    image: "https://placehold.co/300x200/3B82F6/white.png?text=Housing"
  },
  {
    id: "environment-parks",
    name: "Environment & Parks",
    icon: "TreePine",
    color: "bg-green-500",
    totalBudget: 320.8,
    directFunding: 180.5,
    nonprofitFunding: 85.3,
    budgetDeficit: 8.2,
    remainingFunding: 46.8,
    impactMetrics: [
      "50 new trees planted monthly",
      "12 parks renovated this year",
      "30% reduction in carbon emissions"
    ],
    keywords: [
      "park", "tree", "green", "environment", "climate", "nature", "garden", 
      "sustainability", "pollution", "carbon", "renewable", "clean", "air", "water"
    ],
    description: "Protecting environment and maintaining beautiful public spaces",
    image: "https://placehold.co/300x200/10B981/white.png?text=Parks"
  },
  {
    id: "education-youth",
    name: "Education & Youth",
    icon: "GraduationCap",
    color: "bg-purple-500",
    totalBudget: 1200.4,
    directFunding: 980.1,
    nonprofitFunding: 150.3,
    budgetDeficit: -25.4,
    remainingFunding: 45.6,
    impactMetrics: [
      "95% high school graduation rate",
      "500+ after-school programs",
      "40% increase in college readiness"
    ],
    keywords: [
      "school", "education", "student", "teacher", "learning", "youth", "child", 
      "college", "university", "scholarship", "literacy", "STEM", "arts", "library"
    ],
    description: "Investing in education and youth development programs",
    image: "https://placehold.co/300x200/8B5CF6/white.png?text=Education"
  },
  {
    id: "public-safety",
    name: "Public Safety",
    icon: "Shield",
    color: "bg-red-500",
    totalBudget: 680.7,
    directFunding: 580.2,
    nonprofitFunding: 45.5,
    budgetDeficit: 12.3,
    remainingFunding: 42.7,
    impactMetrics: [
      "15% reduction in crime rate",
      "3-minute average emergency response",
      "85% community satisfaction rating"
    ],
    keywords: [
      "safety", "police", "fire", "emergency", "crime", "security", "911", 
      "violence", "prevention", "patrol", "community policing", "disaster"
    ],
    description: "Ensuring community safety and emergency response services",
    image: "https://placehold.co/300x200/EF4444/white.png?text=Safety"
  },
  {
    id: "transportation",
    name: "Transportation",
    icon: "Zap",
    color: "bg-yellow-500",
    totalBudget: 450.3,
    directFunding: 320.8,
    nonprofitFunding: 65.5,
    budgetDeficit: -8.9,
    remainingFunding: 72.9,
    impactMetrics: [
      "25 miles of bike lanes added",
      "90% on-time public transit rate",
      "20% increase in electric vehicle charging"
    ],
    keywords: [
      "transit", "bus", "train", "bike", "walk", "road", "traffic", "parking", 
      "electric", "transportation", "mobility", "accessibility", "infrastructure"
    ],
    description: "Improving public transit and sustainable transportation options",
    image: "https://placehold.co/300x200/F59E0B/white.png?text=Transit"
  },
  {
    id: "healthcare-access",
    name: "Healthcare Access",
    icon: "Heart",
    color: "bg-pink-500",
    totalBudget: 580.9,
    directFunding: 380.4,
    nonprofitFunding: 120.5,
    budgetDeficit: 15.6,
    remainingFunding: 64.4,
    impactMetrics: [
      "98% vaccination coverage achieved",
      "5 new community health centers",
      "30% reduction in wait times"
    ],
    keywords: [
      "health", "medical", "clinic", "hospital", "doctor", "nurse", "medicine", 
      "mental health", "wellness", "healthcare", "insurance", "treatment", "prevention"
    ],
    description: "Expanding healthcare access and community wellness programs",
    image: "https://placehold.co/300x200/EC4899/white.png?text=Health"
  },
  {
    id: "economic-development",
    name: "Economic Development",
    icon: "TrendingUp",
    color: "bg-indigo-500",
    totalBudget: 280.6,
    directFunding: 150.3,
    nonprofitFunding: 80.8,
    budgetDeficit: -5.2,
    remainingFunding: 54.7,
    impactMetrics: [
      "2,500 new jobs created",
      "150 small businesses supported",
      "12% increase in local revenue"
    ],
    keywords: [
      "business", "job", "employment", "economy", "startup", "entrepreneur", 
      "small business", "workforce", "training", "development", "innovation", "tech"
    ],
    description: "Supporting local businesses and economic growth initiatives",
    image: "https://placehold.co/300x200/6366F1/white.png?text=Economy"
  },
  {
    id: "community-services",
    name: "Community Services",
    icon: "Users",
    color: "bg-teal-500",
    totalBudget: 380.2,
    directFunding: 220.7,
    nonprofitFunding: 95.5,
    budgetDeficit: 8.8,
    remainingFunding: 55.2,
    impactMetrics: [
      "80 community events hosted",
      "95% senior services satisfaction",
      "200+ volunteer programs active"
    ],
    keywords: [
      "community", "senior", "family", "social", "volunteer", "recreation", 
      "cultural", "arts", "events", "services", "support", "neighborhood"
    ],
    description: "Strengthening community bonds and social services",
    image: "https://placehold.co/300x200/14B8A6/white.png?text=Community"
  },
  {
    id: "digital-infrastructure",
    name: "Digital Infrastructure",
    icon: "Zap",
    color: "bg-orange-500",
    totalBudget: 180.4,
    directFunding: 120.8,
    nonprofitFunding: 35.6,
    budgetDeficit: -3.2,
    remainingFunding: 27.2,
    impactMetrics: [
      "95% citywide fiber coverage",
      "50 free WiFi hotspots installed",
      "90% digital service satisfaction"
    ],
    keywords: [
      "internet", "digital", "technology", "wifi", "broadband", "connectivity", 
      "smart city", "data", "innovation", "tech", "infrastructure", "online"
    ],
    description: "Building modern digital infrastructure and connectivity",
    image: "https://placehold.co/300x200/FB923C/white.png?text=Digital"
  }
]

// Vision categorization function using keyword matching
export function categorizeVision(visionText: string): CityCategory | null {
  const normalizedVision = visionText.toLowerCase()
  let bestMatch: { category: CityCategory; score: number } | null = null

  for (const category of cityCategories) {
    let score = 0
    
    // Count keyword matches
    for (const keyword of category.keywords) {
      if (normalizedVision.includes(keyword.toLowerCase())) {
        score += 1
      }
    }
    
    // Bonus points for exact category name match
    if (normalizedVision.includes(category.name.toLowerCase())) {
      score += 3
    }
    
    // Update best match if this category scores higher
    if (score > 0 && (!bestMatch || score > bestMatch.score)) {
      bestMatch = { category, score }
    }
  }
  
  return bestMatch?.category || null
}

// Get category by ID
export function getCategoryById(id: string): CityCategory | undefined {
  return cityCategories.find(cat => cat.id === id)
}

// Calculate total city budget
export function getTotalCityBudget(): number {
  return cityCategories.reduce((total, cat) => total + cat.totalBudget, 0)
}