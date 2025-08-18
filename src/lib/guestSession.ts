// Guest session management for anonymous users
export interface GuestVision {
  id: string
  promptText: string
  imageUrl: string
  category: string
  categoryId: string
  likes: number
  createdAt: string
  isAnonymous: true
  hasWatermark?: boolean
}

export interface GuestUser {
  id: string
  anonymousId: string
  points: number
  pointsFromVisions: number
  pointsFromLikes: number
  createdAt: string
  generationsToday: number
  lastGenerationTime?: string
}

export interface ConversionContext {
  trigger: 'share' | 'like' | 'my-view' | 'rate-limit' | 'watermark'
  visionId?: string
  visionThumbnail?: string
  customMessage?: string
}

const GUEST_USER_KEY = 'civiz-guest-user'
const GUEST_VISIONS_KEY = 'civiz-guest-visions'
const CONVERSION_CONTEXT_KEY = 'civiz-conversion-context'

// Rate limiting
const MAX_ANONYMOUS_GENERATIONS_PER_DAY = 3
const RATE_LIMIT_WINDOW_HOURS = 24

export function createGuestUser(): GuestUser {
  const guestUser: GuestUser = {
    id: `guest-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    anonymousId: `anon-${Date.now()}`,
    points: 0,
    pointsFromVisions: 0,
    pointsFromLikes: 0,
    createdAt: new Date().toISOString(),
    generationsToday: 0
  }
  
  if (typeof window !== 'undefined') {
    localStorage.setItem(GUEST_USER_KEY, JSON.stringify(guestUser))
  }
  
  return guestUser
}

export function getGuestUser(): GuestUser | null {
  if (typeof window === 'undefined') return null
  
  try {
    const stored = localStorage.getItem(GUEST_USER_KEY)
    if (!stored) return null
    
    const guestUser = JSON.parse(stored) as GuestUser
    
    // Reset daily generation count if it's a new day
    const lastGenTime = guestUser.lastGenerationTime ? new Date(guestUser.lastGenerationTime) : null
    const now = new Date()
    
    if (lastGenTime && now.getTime() - lastGenTime.getTime() > RATE_LIMIT_WINDOW_HOURS * 60 * 60 * 1000) {
      guestUser.generationsToday = 0
      updateGuestUser(guestUser)
    }
    
    return guestUser
  } catch {
    return null
  }
}

export function updateGuestUser(updates: Partial<GuestUser>): GuestUser {
  const current = getGuestUser() || createGuestUser()
  const updated = { ...current, ...updates }
  
  if (typeof window !== 'undefined') {
    localStorage.setItem(GUEST_USER_KEY, JSON.stringify(updated))
  }
  
  return updated
}

export function getGuestVisions(): GuestVision[] {
  if (typeof window === 'undefined') return []
  
  try {
    const stored = localStorage.getItem(GUEST_VISIONS_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

export function addGuestVision(vision: Omit<GuestVision, 'id' | 'isAnonymous' | 'hasWatermark'>): GuestVision {
  const newVision: GuestVision = {
    ...vision,
    id: `guest-vision-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    isAnonymous: true,
    hasWatermark: true // Anonymous images get watermarks
  }
  
  const currentVisions = getGuestVisions()
  const updatedVisions = [newVision, ...currentVisions]
  
  if (typeof window !== 'undefined') {
    localStorage.setItem(GUEST_VISIONS_KEY, JSON.stringify(updatedVisions))
  }
  
  return newVision
}

export function updateGuestVision(visionId: string, updates: Partial<GuestVision>): GuestVision[] {
  const visions = getGuestVisions()
  const updatedVisions = visions.map(v => 
    v.id === visionId ? { ...v, ...updates } : v
  )
  
  if (typeof window !== 'undefined') {
    localStorage.setItem(GUEST_VISIONS_KEY, JSON.stringify(updatedVisions))
  }
  
  return updatedVisions
}

export function canGenerateAnonymously(): { allowed: boolean; remaining: number; resetIn?: string } {
  const guestUser = getGuestUser()
  
  if (!guestUser) {
    return { allowed: true, remaining: MAX_ANONYMOUS_GENERATIONS_PER_DAY }
  }
  
  const remaining = Math.max(0, MAX_ANONYMOUS_GENERATIONS_PER_DAY - guestUser.generationsToday)
  
  if (remaining <= 0 && guestUser.lastGenerationTime) {
    const resetTime = new Date(guestUser.lastGenerationTime)
    resetTime.setHours(resetTime.getHours() + RATE_LIMIT_WINDOW_HOURS)
    return { 
      allowed: false, 
      remaining: 0, 
      resetIn: resetTime.toLocaleTimeString()
    }
  }
  
  return { allowed: remaining > 0, remaining }
}

export function recordGeneration(): void {
  const guestUser = getGuestUser() || createGuestUser()
  updateGuestUser({
    generationsToday: guestUser.generationsToday + 1,
    lastGenerationTime: new Date().toISOString(),
    points: guestUser.points + 3,
    pointsFromVisions: guestUser.pointsFromVisions + 3
  })
}

export function setConversionContext(context: ConversionContext): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(CONVERSION_CONTEXT_KEY, JSON.stringify(context))
  }
}

export function getConversionContext(): ConversionContext | null {
  if (typeof window === 'undefined') return null
  
  try {
    const stored = localStorage.getItem(CONVERSION_CONTEXT_KEY)
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

export function clearConversionContext(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(CONVERSION_CONTEXT_KEY)
  }
}

export function clearGuestData(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(GUEST_USER_KEY)
    localStorage.removeItem(GUEST_VISIONS_KEY)
    localStorage.removeItem(CONVERSION_CONTEXT_KEY)
  }
}