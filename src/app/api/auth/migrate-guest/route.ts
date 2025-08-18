import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "You must be signed in to migrate guest data" },
        { status: 401 }
      )
    }
    
    const body = await req.json()
    const { guestVisions, guestUser } = body
    
    if (!guestVisions || !guestUser) {
      return NextResponse.json(
        { error: "No guest data to migrate" },
        { status: 400 }
      )
    }
    
    let migratedVisions = []
    let pointsAdded = 0
    
    // Migrate guest visions to database
    if (Array.isArray(guestVisions) && guestVisions.length > 0) {
      for (const guestVision of guestVisions) {
        try {
          // Remove watermark from image URL if it's a data URL
          let cleanImageUrl = guestVision.imageUrl
          if (guestVision.hasWatermark && guestVision.imageUrl.startsWith('data:')) {
            // For now, keep the watermarked version - in production you'd unwatermark here
            cleanImageUrl = guestVision.imageUrl
          }
          
          const vision = await prisma.vision.create({
            data: {
              promptText: guestVision.promptText,
              imageUrl: cleanImageUrl,
              category: guestVision.category,
              categoryId: guestVision.categoryId,
              likes: guestVision.likes || 0,
              userId: session.user.id,
              createdAt: new Date(guestVision.createdAt)
            }
          })
          
          migratedVisions.push(vision)
        } catch (error) {
          console.error(`Failed to migrate vision ${guestVision.id}:`, error)
          // Continue with other visions
        }
      }
    }
    
    // Update user points to include guest points
    if (guestUser.points > 0) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          points: { increment: guestUser.points },
          pointsFromVisions: { increment: guestUser.pointsFromVisions || 0 },
          pointsFromLikes: { increment: guestUser.pointsFromLikes || 0 }
        }
      })
      pointsAdded = guestUser.points
    }
    
    return NextResponse.json({
      message: "Guest data migrated successfully",
      migratedVisionsCount: migratedVisions.length,
      pointsAdded,
      visions: migratedVisions
    }, { status: 200 })
    
  } catch (error) {
    console.error("Failed to migrate guest data:", error)
    return NextResponse.json(
      { error: "Failed to migrate guest data" },
      { status: 500 }
    )
  }
}