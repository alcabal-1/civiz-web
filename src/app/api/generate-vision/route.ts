// API Route for AI Image Generation
// Handles CORS and server-side Replicate API calls

import { NextRequest, NextResponse } from 'next/server'
import Replicate from 'replicate'

// Civic-focused prompt templates for each category
const CATEGORY_PROMPTS = {
  'housing-development': {
    prefix: 'A beautiful modern San Francisco housing development showing',
    suffix: 'architectural rendering, sustainable design, community spaces, golden hour lighting, photorealistic, high quality, 8k resolution',
  },
  'environment-parks': {
    prefix: 'A stunning San Francisco park featuring',
    suffix: 'lush greenery, native California plants, people enjoying nature, golden gate bridge in distance, beautiful landscape photography, vibrant colors, professional photography',
  },
  'education-youth': {
    prefix: 'An inspiring San Francisco educational facility with',
    suffix: 'modern learning spaces, diverse students, innovative technology, bright natural lighting, architectural photography, warm atmosphere',
  },
  'public-safety': {
    prefix: 'A safe and vibrant San Francisco neighborhood showing',
    suffix: 'community engagement, well-lit streets, public safety infrastructure, people feeling secure, urban photography, golden hour',
  },
  'transportation': {
    prefix: 'A futuristic San Francisco transit system featuring',
    suffix: 'clean modern design, electric vehicles, bike lanes, pedestrian friendly, sustainable transportation, architectural visualization, bright and optimistic',
  },
  'healthcare-access': {
    prefix: 'A welcoming San Francisco healthcare facility with',
    suffix: 'modern medical technology, caring atmosphere, accessibility features, healing environment, architectural photography, natural light',
  },
  'economic-development': {
    prefix: 'A thriving San Francisco business district showcasing',
    suffix: 'local businesses, innovation hubs, diverse entrepreneurs, economic vitality, urban photography, dynamic atmosphere',
  },
  'community-services': {
    prefix: 'A vibrant San Francisco community center featuring',
    suffix: 'diverse community members, social services, gathering spaces, inclusive design, warm lighting, photojournalistic style',
  },
  'digital-infrastructure': {
    prefix: 'A cutting-edge San Francisco digital infrastructure showing',
    suffix: 'fiber optic networks, smart city technology, digital innovation, futuristic design, tech visualization, neon accents, cyberpunk aesthetic',
  }
}

const DEFAULT_PROMPT = {
  prefix: 'A beautiful civic vision for San Francisco showing',
  suffix: 'inspiring urban design, community benefit, photorealistic rendering, high quality, professional photography',
}

function buildEnhancedPrompt(userVision: string, categoryId: string): string {
  const template = CATEGORY_PROMPTS[categoryId as keyof typeof CATEGORY_PROMPTS] || DEFAULT_PROMPT
  const cleanVision = userVision.trim().toLowerCase()
  return `${template.prefix} ${cleanVision}, ${template.suffix}`
}

export async function POST(request: NextRequest) {
  let userVision: string = ''
  let categoryId: string = ''
  
  try {
    const body = await request.json()
    userVision = body.userVision
    categoryId = body.categoryId

    if (!userVision || !categoryId) {
      return NextResponse.json(
        { error: 'Missing userVision or categoryId' },
        { status: 400 }
      )
    }

    // Check if API key is configured (try both server and client env vars)
    const apiKey = process.env.REPLICATE_API_KEY || process.env.NEXT_PUBLIC_REPLICATE_API_KEY
    
    console.log('🔑 API Key check:', {
      hasServerKey: !!process.env.REPLICATE_API_KEY,
      hasClientKey: !!process.env.NEXT_PUBLIC_REPLICATE_API_KEY,
      keyLength: apiKey?.length || 0,
      keyPrefix: apiKey?.substring(0, 8) || 'none'
    })
    
    if (!apiKey || apiKey === 'your_replicate_api_key_here') {
      console.log('⚠️ No valid Replicate API key - using fallback')
      
      // Return high-quality fallback
      const categoryImages: Record<string, string> = {
        'housing-development': 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1024&h=768&fit=crop',
        'environment-parks': 'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=1024&h=768&fit=crop',
        'education-youth': 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=1024&h=768&fit=crop',
        'public-safety': 'https://images.unsplash.com/photo-1584359977767-192b025bb957?w=1024&h=768&fit=crop',
        'transportation': 'https://images.unsplash.com/photo-1570125909517-53cb21c89ff2?w=1024&h=768&fit=crop',
        'healthcare-access': 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1024&h=768&fit=crop',
        'economic-development': 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1024&h=768&fit=crop',
        'community-services': 'https://images.unsplash.com/photo-1569163139394-de4798aa62b6?w=1024&h=768&fit=crop',
        'digital-infrastructure': 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1024&h=768&fit=crop'
      }

      return NextResponse.json({
        id: `fallback-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        imageUrl: categoryImages[categoryId] || categoryImages['community-services'],
        prompt: buildEnhancedPrompt(userVision, categoryId),
        userVision: userVision,
        categoryId: categoryId,
        generatedAt: new Date().toISOString(),
        model: 'fallback'
      })
    }

    // Initialize Replicate client
    const replicate = new Replicate({
      auth: apiKey,
    })

    const prompt = buildEnhancedPrompt(userVision, categoryId)
    console.log('🎨 Generating AI image with prompt:', prompt)

    // Generate image using Stable Diffusion XL with timeout
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Request timeout after 60 seconds')), 60000)
    )
    
    const generatePromise = replicate.run(
      "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
      {
        input: {
          prompt: prompt,
          negative_prompt: "low quality, blurry, distorted, ugly, bad anatomy, bad proportions, cartoon, anime, sketch, painting",
          width: 1024,
          height: 768,
          num_outputs: 1,
          scheduler: "K_EULER",
          num_inference_steps: 30,
          guidance_scale: 7.5,
          prompt_strength: 0.9,
          refine: "expert_ensemble_refiner",
          high_noise_frac: 0.8
        }
      }
    )

    // Race between generation and timeout
    const output = await Promise.race([generatePromise, timeoutPromise]) as any

    console.log('🔍 Replicate output type:', typeof output)
    console.log('🔍 Replicate output:', JSON.stringify(output, null, 2))

    if (!output) {
      throw new Error('No image generated from AI model')
    }

    // Handle different output formats from Replicate
    let imageUrl: string = ''
    
    if (Array.isArray(output) && output.length > 0) {
      // If it's an array, take the first element
      imageUrl = typeof output[0] === 'string' ? output[0] : String(output[0])
    } else if (typeof output === 'string') {
      // If it's already a string URL
      imageUrl = output
    } else if (output && typeof output === 'object') {
      // If it's an object, try to extract URL from common properties
      imageUrl = output.url || output.output || output.image || String(output)
    } else {
      // Fallback to string conversion
      imageUrl = String(output)
    }

    // Validate that we have a proper URL
    if (!imageUrl || !imageUrl.startsWith('http')) {
      console.error('Invalid image URL received:', output)
      throw new Error('Invalid image URL from AI model')
    }

    const result = {
      id: `ai-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      imageUrl: imageUrl,
      prompt: prompt,
      userVision: userVision,
      categoryId: categoryId,
      generatedAt: new Date().toISOString(),
      model: 'stable-diffusion-xl'
    }

    console.log('✅ AI image generated successfully:', result.imageUrl)
    return NextResponse.json(result)

  } catch (error) {
    console.error('❌ Error generating AI image:', error)
    
    // If it's a billing error, return a nice fallback instead of 500
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.log('🔍 Error details:', {
      message: errorMessage,
      type: typeof error,
      name: error instanceof Error ? error.name : 'unknown',
      stack: error instanceof Error ? error.stack?.slice(0, 500) : 'no stack'
    })
    
    if (errorMessage.includes('Insufficient credit') || errorMessage.includes('Payment Required') || errorMessage.includes('timeout')) {
      console.log('💰 Billing issue detected - returning high-quality fallback')
      
      const categoryImages: Record<string, string> = {
        'housing-development': 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1024&h=768&fit=crop',
        'environment-parks': 'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=1024&h=768&fit=crop',
        'education-youth': 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=1024&h=768&fit=crop',
        'public-safety': 'https://images.unsplash.com/photo-1584359977767-192b025bb957?w=1024&h=768&fit=crop',
        'transportation': 'https://images.unsplash.com/photo-1570125909517-53cb21c89ff2?w=1024&h=768&fit=crop',
        'healthcare-access': 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1024&h=768&fit=crop',
        'economic-development': 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1024&h=768&fit=crop',
        'community-services': 'https://images.unsplash.com/photo-1569163139394-de4798aa62b6?w=1024&h=768&fit=crop',
        'digital-infrastructure': 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1024&h=768&fit=crop'
      }

      return NextResponse.json({
        id: `billing-fallback-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        imageUrl: categoryImages[categoryId] || categoryImages['community-services'],
        prompt: userVision ? buildEnhancedPrompt(userVision, categoryId) : 'A beautiful civic vision for San Francisco',
        userVision: userVision || 'Civic vision',
        categoryId: categoryId || 'community-services',
        generatedAt: new Date().toISOString(),
        model: 'billing-fallback'
      })
    }
    
    // For other errors, still return 500
    return NextResponse.json(
      { error: 'Failed to generate AI image', details: errorMessage },
      { status: 500 }
    )
  }
}