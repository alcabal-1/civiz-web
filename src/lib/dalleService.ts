// DALL-E Integration Service for CIVIZ
// Handles AI image generation for civic visions

export interface ImageGenerationRequest {
  visionText: string
  categoryName?: string
  cityName?: string
  style?: 'realistic' | 'artistic' | 'architectural' | 'community'
}

export interface GeneratedImage {
  id: string
  imageUrl: string
  prompt: string
  visionText: string
  categoryId?: string
  generatedAt: Date
  style: string
}

// Mock DALL-E service for development
// In production, this would call the actual OpenAI DALL-E API
export class DalleService {
  private static apiKey: string = process.env.NEXT_PUBLIC_OPENAI_API_KEY || 'demo-key'
  private static baseUrl: string = 'https://api.openai.com/v1/images/generations'

  // Generate optimized prompt for civic visions
  static generateCivicPrompt(request: ImageGenerationRequest): string {
    const { visionText, categoryName, cityName = 'San Francisco', style = 'realistic' } = request
    
    // Style-specific prefixes
    const styleMap = {
      realistic: 'High-quality photograph of',
      artistic: 'Beautiful artistic rendering of', 
      architectural: 'Professional architectural visualization of',
      community: 'Vibrant community scene showing'
    }

    const stylePrefix = styleMap[style]
    const categoryContext = categoryName ? ` related to ${categoryName}` : ''
    
    return `${stylePrefix} ${visionText} in ${cityName}${categoryContext}, modern civic infrastructure, community-focused, uplifting atmosphere, high detail, professional photography style`
  }

  // Mock image generation for development
  static async generateImage(request: ImageGenerationRequest): Promise<GeneratedImage> {
    const prompt = this.generateCivicPrompt(request)
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Mock response with placeholder images
    // Using placehold.co for reliable placeholder images
    // In production, this would be the actual DALL-E response
    const colors = ['3B82F6', '8B5CF6', '10B981', 'EF4444', 'F59E0B', '6366F1']
    const randomColor = colors[Math.floor(Math.random() * colors.length)]
    
    // Generate a unique placeholder with the vision text
    const encodedText = encodeURIComponent(request.visionText.slice(0, 30))
    const randomImage = `https://placehold.co/512x512/${randomColor}/white.png?text=${encodedText}`
    
    return {
      id: `generated-${Date.now()}`,
      imageUrl: randomImage,
      prompt,
      visionText: request.visionText,
      categoryId: request.categoryName?.toLowerCase().replace(/\s+/g, '-'),
      generatedAt: new Date(),
      style: request.style || 'realistic'
    }
  }

  // Production DALL-E integration (commented out for development)
  /*
  static async generateImageProduction(request: ImageGenerationRequest): Promise<GeneratedImage> {
    const prompt = this.generateCivicPrompt(request)
    
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          n: 1,
          size: '512x512',
          quality: 'standard',
          model: 'dall-e-3'
        }),
      })

      if (!response.ok) {
        throw new Error(`DALL-E API error: ${response.status}`)
      }

      const data = await response.json()
      
      return {
        id: `generated-${Date.now()}`,
        imageUrl: data.data[0].url,
        prompt,
        visionText: request.visionText,
        categoryId: request.categoryName?.toLowerCase().replace(/\s+/g, '-'),
        generatedAt: new Date(),
        style: request.style || 'realistic'
      }
    } catch (error) {
      console.error('DALL-E generation failed:', error)
      throw error
    }
  }
  */

  // Batch generate multiple style variations
  static async generateVariations(request: ImageGenerationRequest): Promise<GeneratedImage[]> {
    const styles: Array<'realistic' | 'artistic' | 'architectural' | 'community'> = 
      ['realistic', 'artistic', 'architectural', 'community']
    
    const variations = await Promise.all(
      styles.map(style => this.generateImage({ ...request, style }))
    )
    
    return variations
  }
}

// Helper function to convert vision to image generation request
export function visionToImageRequest(
  visionText: string, 
  categoryName?: string, 
  style: 'realistic' | 'artistic' | 'architectural' | 'community' = 'realistic'
): ImageGenerationRequest {
  return {
    visionText: visionText.trim(),
    categoryName,
    cityName: 'San Francisco',
    style
  }
}