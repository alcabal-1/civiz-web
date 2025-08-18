import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "You must be signed in to like visions" },
        { status: 401 }
      )
    }
    
    const visionId = params.id
    const userId = session.user.id
    
    // Check if already liked
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_visionId: {
          userId,
          visionId
        }
      }
    })
    
    if (existingLike) {
      // Unlike: Remove like and decrement points
      await prisma.$transaction([
        prisma.like.delete({
          where: { id: existingLike.id }
        }),
        prisma.vision.update({
          where: { id: visionId },
          data: { likes: { decrement: 1 } }
        }),
        prisma.user.update({
          where: { id: userId },
          data: {
            points: { decrement: 1 },
            pointsFromLikes: { decrement: 1 }
          }
        })
      ])
      
      return NextResponse.json({ liked: false, message: "Vision unliked" })
    } else {
      // Like: Add like and increment points
      await prisma.$transaction([
        prisma.like.create({
          data: {
            userId,
            visionId
          }
        }),
        prisma.vision.update({
          where: { id: visionId },
          data: { likes: { increment: 1 } }
        }),
        prisma.user.update({
          where: { id: userId },
          data: {
            points: { increment: 1 },
            pointsFromLikes: { increment: 1 }
          }
        })
      ])
      
      return NextResponse.json({ liked: true, message: "Vision liked" })
    }
  } catch (error) {
    console.error("Failed to toggle like:", error)
    return NextResponse.json(
      { error: "Failed to toggle like" },
      { status: 500 }
    )
  }
}