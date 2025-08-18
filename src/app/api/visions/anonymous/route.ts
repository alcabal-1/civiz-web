import { NextResponse } from "next/server"
import { headers } from "next/headers"

// Simple in-memory rate limiting for anonymous users
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()
const MAX_ANONYMOUS_REQUESTS_PER_DAY = 3
const RATE_LIMIT_WINDOW = 24 * 60 * 60 * 1000 // 24 hours

function getRateLimitKey(ip: string): string {
  return `anonymous:${ip}`
}

function checkRateLimit(ip: string): { allowed: boolean; remaining: number; resetTime?: number } {
  const key = getRateLimitKey(ip)
  const now = Date.now()
  const existing = rateLimitMap.get(key)
  
  if (!existing || now > existing.resetTime) {
    // Reset or first request
    rateLimitMap.set(key, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW
    })
    return { allowed: true, remaining: MAX_ANONYMOUS_REQUESTS_PER_DAY - 1 }
  }
  
  if (existing.count >= MAX_ANONYMOUS_REQUESTS_PER_DAY) {
    return { 
      allowed: false, 
      remaining: 0, 
      resetTime: existing.resetTime 
    }
  }
  
  // Increment count
  existing.count++
  rateLimitMap.set(key, existing)
  
  return { 
    allowed: true, 
    remaining: MAX_ANONYMOUS_REQUESTS_PER_DAY - existing.count 
  }
}

export async function POST(req: Request) {
  try {
    const headersList = headers()
    const forwarded = headersList.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0] : '127.0.0.1'
    
    // Check rate limit
    const rateLimit = checkRateLimit(ip)
    
    if (!rateLimit.allowed) {
      const resetDate = new Date(rateLimit.resetTime || Date.now() + RATE_LIMIT_WINDOW)
      return NextResponse.json({
        error: "Rate limit exceeded",
        message: "You've created amazing visions! Sign up to continue unlimited civic visioning.",
        resetTime: resetDate.toISOString(),
        conversionTrigger: "rate-limit"
      }, { 
        status: 429,
        headers: {
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': resetDate.toISOString()
        }
      })
    }
    
    const body = await req.json()
    const { promptText, imageUrl, category, categoryId } = body
    
    if (!promptText || !imageUrl || !category || !categoryId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }
    
    // Create anonymous vision (no database save)
    const anonymousVision = {
      id: `anon-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      promptText,
      imageUrl,
      category,
      categoryId,
      likes: 0,
      createdAt: new Date().toISOString(),
      isAnonymous: true,
      hasWatermark: true,
      userId: 'anonymous'
    }
    
    return NextResponse.json({
      ...anonymousVision,
      remaining: rateLimit.remaining,
      message: rateLimit.remaining === 0 
        ? "Last free vision! Sign up for unlimited generations."
        : `${rateLimit.remaining} free generations remaining today.`
    }, { 
      status: 201,
      headers: {
        'X-RateLimit-Remaining': rateLimit.remaining.toString()
      }
    })
  } catch (error) {
    console.error("Failed to create anonymous vision:", error)
    return NextResponse.json(
      { error: "Failed to create vision" },
      { status: 500 }
    )
  }
}