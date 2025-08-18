// Watermark service for anonymous images
export interface WatermarkOptions {
  text?: string
  position?: 'bottom-right' | 'bottom-left' | 'center'
  opacity?: number
  fontSize?: number
  color?: string
}

export async function addWatermarkToImage(
  imageUrl: string, 
  options: WatermarkOptions = {}
): Promise<string> {
  const {
    text = 'CIVIZ.app',
    position = 'bottom-right',
    opacity = 0.7,
    fontSize = 16,
    color = '#ffffff'
  } = options

  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()
    
    img.crossOrigin = 'anonymous'
    
    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      
      // Draw the original image
      ctx?.drawImage(img, 0, 0)
      
      if (!ctx) {
        reject(new Error('Could not get canvas context'))
        return
      }
      
      // Configure watermark text
      ctx.font = `${fontSize}px Inter, -apple-system, BlinkMacSystemFont, sans-serif`
      ctx.fillStyle = color
      ctx.globalAlpha = opacity
      
      // Add subtle shadow for better visibility
      ctx.shadowColor = 'rgba(0, 0, 0, 0.5)'
      ctx.shadowBlur = 4
      ctx.shadowOffsetX = 1
      ctx.shadowOffsetY = 1
      
      const textMetrics = ctx.measureText(text)
      const textWidth = textMetrics.width
      const textHeight = fontSize
      
      // Position the watermark
      let x, y
      const padding = 16
      
      switch (position) {
        case 'bottom-right':
          x = canvas.width - textWidth - padding
          y = canvas.height - padding
          break
        case 'bottom-left':
          x = padding
          y = canvas.height - padding
          break
        case 'center':
          x = (canvas.width - textWidth) / 2
          y = (canvas.height + textHeight) / 2
          break
        default:
          x = canvas.width - textWidth - padding
          y = canvas.height - padding
      }
      
      // Draw the watermark
      ctx.fillText(text, x, y)
      
      // Convert to data URL
      const watermarkedImageUrl = canvas.toDataURL('image/jpeg', 0.9)
      resolve(watermarkedImageUrl)
    }
    
    img.onerror = () => {
      // If watermarking fails, return original image
      resolve(imageUrl)
    }
    
    img.src = imageUrl
  })
}

export function createWatermarkHint(isAnonymous: boolean): string {
  if (!isAnonymous) return ''
  
  return 'Sign up to save clean, watermark-free images perfect for sharing!'
}

export function shouldShowWatermarkHint(trigger: string): boolean {
  return trigger === 'share' || trigger === 'watermark'
}