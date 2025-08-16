# 🎨 AI Image Generation Setup for CIVIZ

## Transform civic visions into stunning AI-generated imagery!

### Quick Start (2 minutes)

1. **Get your Replicate API Key**
   - Sign up at [Replicate.com](https://replicate.com)
   - Go to [API Tokens](https://replicate.com/account/api-tokens)
   - Create a new token

2. **Configure Environment**
   ```bash
   # Copy the example env file
   cp .env.local.example .env.local
   
   # Add your API key
   echo "NEXT_PUBLIC_REPLICATE_API_KEY=your_key_here" > .env.local
   ```

3. **Restart the Development Server**
   ```bash
   npm run dev
   ```

4. **Test It Out!**
   - Submit a vision like "a park with community gardens and solar panels"
   - Watch as AI generates a stunning visualization in ~10-15 seconds
   - Your vision appears as the first image in the grid!

### Features

✨ **Real AI Generation**
- Powered by Stable Diffusion XL
- Creates photorealistic civic visions
- ~$0.002 per image (50x cheaper than DALL-E!)

🎯 **Category-Specific Prompts**
- Each civic category has optimized prompts
- Parks → Lush landscapes with golden hour lighting
- Housing → Modern architectural renderings
- Transit → Futuristic transportation systems
- And more!

🚀 **Enhanced UX**
- "Generating your vision..." animation
- Success notification with share button
- Image appears in top-left position
- Points awarded immediately

### How It Works

1. **User submits vision text**
   - "I envision a San Francisco where bike lanes connect every neighborhood"

2. **AI enhances the prompt**
   - Category detected: Transportation
   - Enhanced: "A futuristic San Francisco transit system featuring bike lanes connecting every neighborhood, clean modern design, electric vehicles, bike lanes, pedestrian friendly, sustainable transportation, architectural visualization, bright and optimistic"

3. **Stable Diffusion generates image**
   - 1024x768 resolution
   - Photorealistic quality
   - Takes 10-15 seconds

4. **Image displayed with metadata**
   - Original user vision
   - AI-enhanced prompt
   - Timestamp and points

### Cost Breakdown

- **Replicate/Stable Diffusion**: ~$0.002 per image
- **DALL-E 3**: ~$0.04-0.08 per image
- **Midjourney**: ~$0.10 per image

**Result**: 20-50x cost savings with similar quality!

### Fallback System

If no API key is configured:
- Uses high-quality Unsplash images as placeholders
- Maintains full functionality
- Shows warning in console
- Perfect for development/testing

### Advanced Configuration

**Use a different model:**
```env
NEXT_PUBLIC_SD_MODEL=stability-ai/sdxl:latest
```

**Adjust generation settings:**
Edit `/src/lib/aiImageService.ts`:
```typescript
{
  num_inference_steps: 30,  // Speed vs quality (20-50)
  guidance_scale: 7.5,      // Prompt adherence (5-15)
  width: 1024,              // Image width
  height: 768,              // Image height
}
```

### Prompt Templates

Each category has custom prompts in `/src/lib/aiImageService.ts`:

```typescript
'environment-parks': {
  prefix: 'A stunning San Francisco park featuring',
  suffix: 'lush greenery, golden gate bridge in distance...',
  style: 'landscape photography'
}
```

### Troubleshooting

**Images not generating?**
- Check API key in `.env.local`
- Check console for errors
- Verify Replicate account has credits

**Slow generation?**
- Normal: 10-15 seconds for high quality
- Reduce `num_inference_steps` for faster (lower quality)

**Want different style?**
- Edit prompt templates in `aiImageService.ts`
- Adjust negative prompts to remove unwanted elements

### Next Steps

After setting up AI generation:
1. Test with various civic visions
2. Share generated images on social media
3. Prepare for Step 8: Video generation from images

### Support

- Replicate Docs: https://replicate.com/docs
- Stable Diffusion XL: https://replicate.com/stability-ai/sdxl
- CIVIZ Issues: Create an issue in this repo

---

**Ready to see civic visions come to life? Add your API key and start generating!** 🚀