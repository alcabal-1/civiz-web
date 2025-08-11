// Points System for CIVIZ
// Manages user points, image likes, and point tracking

export interface ImageData {
  id: string
  categoryId: string
  imageUrl: string
  title: string
  description: string
  submitterPoints: number // Points of the user who submitted this image
  likes: number // Number of likes this image has
  points: number // Total points this image has earned
  likedBy: string[] // User IDs who liked this image
  submitterId?: string
  createdAt: Date
}

export interface UserPointsData {
  totalPoints: number
  pointsFromVisions: number
  pointsFromLikes: number
  pointsFromFunding: number
  likedImages: string[] // Image IDs the user has liked
}

export const POINT_VALUES = {
  VISION_SUBMISSION: 3,
  IMAGE_LIKE: 1,
  FUNDING_MULTIPLIER: 2,
} as const

// Calculate image points based on likes and submitter points
export function calculateImagePoints(image: ImageData): number {
  const likesPoints = image.likes * POINT_VALUES.IMAGE_LIKE
  const submitterBonus = Math.floor(image.submitterPoints * 0.1) // 10% of submitter's points as bonus
  return likesPoints + submitterBonus
}

// Calculate user's contribution to an image's points when they like it
export function calculateUserContribution(userPoints: number): number {
  return POINT_VALUES.IMAGE_LIKE + Math.floor(userPoints * 0.05) // Base 1 point + 5% of user's points
}

// Update image points when liked
export function updateImageOnLike(
  image: ImageData, 
  userId: string, 
  userPoints: number
): ImageData {
  if (image.likedBy.includes(userId)) {
    return image // Already liked, no change
  }

  const newLikes = image.likes + 1
  const userContribution = calculateUserContribution(userPoints)
  
  return {
    ...image,
    likes: newLikes,
    points: image.points + userContribution,
    likedBy: [...image.likedBy, userId],
  }
}

// Remove like from image
export function updateImageOnUnlike(
  image: ImageData, 
  userId: string, 
  userPoints: number
): ImageData {
  if (!image.likedBy.includes(userId)) {
    return image // Not liked, no change
  }

  const newLikes = image.likes - 1
  const userContribution = calculateUserContribution(userPoints)
  
  return {
    ...image,
    likes: newLikes,
    points: Math.max(0, image.points - userContribution),
    likedBy: image.likedBy.filter(id => id !== userId),
  }
}

// Update user points when they like an image
export function updateUserPointsOnLike(userPointsData: UserPointsData, imageId: string): UserPointsData {
  if (userPointsData.likedImages.includes(imageId)) {
    return userPointsData // Already liked
  }

  return {
    ...userPointsData,
    totalPoints: userPointsData.totalPoints + POINT_VALUES.IMAGE_LIKE,
    pointsFromLikes: userPointsData.pointsFromLikes + POINT_VALUES.IMAGE_LIKE,
    likedImages: [...userPointsData.likedImages, imageId],
  }
}

// Update user points when they unlike an image
export function updateUserPointsOnUnlike(userPointsData: UserPointsData, imageId: string): UserPointsData {
  if (!userPointsData.likedImages.includes(imageId)) {
    return userPointsData // Not liked
  }

  return {
    ...userPointsData,
    totalPoints: Math.max(0, userPointsData.totalPoints - POINT_VALUES.IMAGE_LIKE),
    pointsFromLikes: Math.max(0, userPointsData.pointsFromLikes - POINT_VALUES.IMAGE_LIKE),
    likedImages: userPointsData.likedImages.filter(id => id !== imageId),
  }
}

// Sort images by points (highest first)
export function sortImagesByPoints(images: ImageData[]): ImageData[] {
  return [...images].sort((a, b) => b.points - a.points)
}

// Calculate funding points
export function calculateFundingPoints(donationAmount: number): number {
  return donationAmount * POINT_VALUES.FUNDING_MULTIPLIER
}