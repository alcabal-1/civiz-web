// Real AI Image Generation Service using Replicate API
// Stable Diffusion for stunning civic visions

import Replicate from 'replicate'

// Civic-focused prompt templates for each category
const CATEGORY_PROMPTS = {
  'housing-development': {
    prefix: 'A beautiful modern San Francisco housing development showing',
    suffix: 'architectural rendering, sustainable design, community spaces, golden hour lighting, photorealistic, high quality, 8k resolution',
    style: 'architectural visualization'
  },
  'environment-parks': {
    prefix: 'A stunning San Francisco park featuring',
    suffix: 'lush greenery, native California plants, people enjoying nature, golden gate bridge in distance, beautiful landscape photography, vibrant colors, professional photography',
    style: 'landscape photography'
  },
  'education-youth': {
    prefix: 'An inspiring San Francisco educational facility with',
    suffix: 'modern learning spaces, diverse students, innovative technology, bright natural lighting, architectural photography, warm atmosphere',
    style: 'architectural photography'
  },
  'public-safety': {
    prefix: 'A safe and vibrant San Francisco neighborhood showing',
    suffix: 'community engagement, well-lit streets, public safety infrastructure, people feeling secure, urban photography, golden hour',
    style: 'urban photography'
  },
  'transportation': {
    prefix: 'A futuristic San Francisco transit system featuring',
    suffix: 'clean modern design, electric vehicles, bike lanes, pedestrian friendly, sustainable transportation, architectural visualization, bright and optimistic',
    style: 'transportation design'
  },
  'healthcare-access': {
    prefix: 'A welcoming San Francisco healthcare facility with',
    suffix: 'modern medical technology, caring atmosphere, accessibility features, healing environment, architectural photography, natural light',
    style: 'healthcare architecture'
  },
  'economic-development': {
    prefix: 'A thriving San Francisco business district showcasing',
    suffix: 'local businesses, innovation hubs, diverse entrepreneurs, economic vitality, urban photography, dynamic atmosphere',
    style: 'commercial photography'
  },
  'community-services': {
    prefix: 'A vibrant San Francisco community center featuring',
    suffix: 'diverse community members, social services, gathering spaces, inclusive design, warm lighting, photojournalistic style',
    style: 'community photography'
  },
  'digital-infrastructure': {
    prefix: 'A cutting-edge San Francisco digital infrastructure showing',
    suffix: 'fiber optic networks, smart city technology, digital innovation, futuristic design, tech visualization, neon accents, cyberpunk aesthetic',
    style: 'tech visualization'
  }
}

// Fallback for unknown categories
const DEFAULT_PROMPT = {
  prefix: 'A beautiful civic vision for San Francisco showing',
  suffix: 'inspiring urban design, community benefit, photorealistic rendering, high quality, professional photography',
  style: 'civic visualization'
}

export interface AIGeneratedImage {
  id: string
  imageUrl: string
  prompt: string
  userVision: string
  categoryId: string
  generatedAt: Date
  model: string
}

export class AIImageService {
  private replicate: Replicate | null = null
  private modelVersion = "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b"
  
  constructor() {
    // Initialize Replicate client if API key is available
    const apiKey = process.env.NEXT_PUBLIC_REPLICATE_API_KEY
    console.log('AI Service initialized:', {
      hasApiKey: !!apiKey,
      keyLength: apiKey?.length || 0,
      keyPrefix: apiKey?.substring(0, 8) || 'none'
    })
    
    if (apiKey && apiKey !== 'your_replicate_api_key_here') {
      this.replicate = new Replicate({
        auth: apiKey,
      })
      console.log('✅ Replicate client initialized - AI generation enabled!')
    } else {
      console.log('⚠️ No valid API key found - using fallback images')
    }
  }

  /**
   * Generate a stunning civic vision image using Stable Diffusion
   */
  async generateCivicVision(
    userVision: string, 
    categoryId: string
  ): Promise<AIGeneratedImage> {
    try {
      // Build the enhanced prompt
      const prompt = this.buildEnhancedPrompt(userVision, categoryId)
      
      // If no API key, return a high-quality placeholder with proper metadata
      if (!this.replicate) {
        console.warn('Replicate API key not found. Using placeholder image.')
        return this.generatePlaceholder(userVision, categoryId, prompt)
      }

      // Generate image using Stable Diffusion XL
      console.log('Generating civic vision with prompt:', prompt)
      
      const output = await this.replicate.run(
        this.modelVersion,
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
      ) as string[]

      if (!output || output.length === 0) {
        throw new Error('No image generated from AI model')
      }

      return {
        id: `ai-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        imageUrl: output[0],
        prompt: prompt,
        userVision: userVision,
        categoryId: categoryId,
        generatedAt: new Date(),
        model: 'stable-diffusion-xl'
      }

    } catch (error) {
      console.error('Error generating AI image:', error)
      // Fallback to placeholder on error
      const prompt = this.buildEnhancedPrompt(userVision, categoryId)
      return this.generatePlaceholder(userVision, categoryId, prompt)
    }
  }

  /**
   * Build an enhanced prompt optimized for civic imagery
   */
  private buildEnhancedPrompt(userVision: string, categoryId: string): string {
    const template = CATEGORY_PROMPTS[categoryId as keyof typeof CATEGORY_PROMPTS] || DEFAULT_PROMPT
    
    // Clean and enhance user vision
    const cleanVision = userVision.trim().toLowerCase()
    
    // Build the full prompt
    const fullPrompt = `${template.prefix} ${cleanVision}, ${template.suffix}`
    
    return fullPrompt
  }

  /**
   * Generate a placeholder when API is not available
   */
  private generatePlaceholder(
    userVision: string, 
    categoryId: string,
    prompt: string
  ): AIGeneratedImage {
    // Use Unsplash for high-quality placeholders based on category
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

    return {
      id: `placeholder-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      imageUrl: categoryImages[categoryId] || categoryImages['community-services'],
      prompt: prompt,
      userVision: userVision,
      categoryId: categoryId,
      generatedAt: new Date(),
      model: 'placeholder'
    }
  }

  /**
   * Check if AI generation is available
   */
  isAIAvailable(): boolean {
    return !!this.replicate
  }
}

// Singleton instance
export const aiImageService = new AIImageService()

// Export the enhanced prompt builder for testing
export function buildCivicPrompt(userVision: string, categoryName?: string): string {
  const cleanVision = userVision.trim()
  if (!categoryName) {
    return `A stunning civic vision for San Francisco: ${cleanVision}, photorealistic, high quality, professional photography, golden hour lighting`
  }
  
  const categoryKey = categoryName.toLowerCase().replace(/\s+/g, '-').replace('&', '').trim()
  const template = CATEGORY_PROMPTS[categoryKey as keyof typeof CATEGORY_PROMPTS] || DEFAULT_PROMPT
  
  return `${template.prefix} ${cleanVision}, ${template.suffix}`
}