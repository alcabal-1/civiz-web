import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      )
    }
    
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        points: true,
        pointsFromVisions: true,
        pointsFromLikes: true,
        pointsFromFunding: true,
        _count: {
          select: {
            visions: true,
            likes: true
          }
        }
      }
    })
    
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      ...user,
      visionsCount: user._count.visions,
      likesCount: user._count.likes
    })
  } catch (error) {
    console.error("Failed to fetch user data:", error)
    return NextResponse.json(
      { error: "Failed to fetch user data" },
      { status: 500 }
    )
  }
}