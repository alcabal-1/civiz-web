// Local storage utilities for CIVIZ data persistence

import { ImageData, UserPointsData } from './pointsSystem'

const STORAGE_KEYS = {
  IMAGE_DATA: 'civiz_image_data',
  USER_POINTS: 'civiz_user_points',
  GENERATED_IMAGES: 'civiz_generated_images',
} as const

// Save image data to localStorage
export function saveImageData(images: ImageData[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.IMAGE_DATA, JSON.stringify(images))
  } catch (error) {
    console.error('Failed to save image data:', error)
  }
}

// Load image data from localStorage
export function loadImageData(): ImageData[] | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.IMAGE_DATA)
    if (!stored) return null
    
    const data = JSON.parse(stored)
    // Convert date strings back to Date objects
    return data.map((img: any) => ({
      ...img,
      createdAt: new Date(img.createdAt)
    }))
  } catch (error) {
    console.error('Failed to load image data:', error)
    return null
  }
}

// Save user points data to localStorage
export function saveUserPointsData(points: UserPointsData): void {
  try {
    localStorage.setItem(STORAGE_KEYS.USER_POINTS, JSON.stringify(points))
  } catch (error) {
    console.error('Failed to save user points data:', error)
  }
}

// Load user points data from localStorage
export function loadUserPointsData(): UserPointsData | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.USER_POINTS)
    if (!stored) return null
    return JSON.parse(stored)
  } catch (error) {
    console.error('Failed to load user points data:', error)
    return null
  }
}

// Clear all stored data (useful for testing or reset)
export function clearStoredData(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.IMAGE_DATA)
    localStorage.removeItem(STORAGE_KEYS.USER_POINTS)
    localStorage.removeItem(STORAGE_KEYS.GENERATED_IMAGES)
  } catch (error) {
    console.error('Failed to clear stored data:', error)
  }
}

// Check if localStorage is available
export function isStorageAvailable(): boolean {
  try {
    const test = '__storage_test__'
    localStorage.setItem(test, test)
    localStorage.removeItem(test)
    return true
  } catch {
    return false
  }
}