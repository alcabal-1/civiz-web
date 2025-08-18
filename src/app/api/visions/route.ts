import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET all visions (community view)
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const view = searchParams.get("view") || "community"
    
    const session = await auth()
    
    if (view === "personal" && session?.user?.id) {
      // Get user's personal visions
      const visions = await prisma.vision.findMany({
        where: { userId: session.user.id },
        include: {
          user: {
            select: { name: true, email: true }
          },
          _count: {
            select: { likedBy: true }
          }
        },
        orderBy: { createdAt: "desc" }
      })
      
      return NextResponse.json(visions.map(v => ({
        ...v,
        likes: v._count.likedBy,
        userName: v.user.name || v.user.email?.split('@')[0]
      })))
    } else {
      // Get all community visions
      const visions = await prisma.vision.findMany({
        include: {
          user: {
            select: { name: true, email: true }
          },
          _count: {
            select: { likedBy: true }
          }
        },
        orderBy: { likes: "desc" }
      })
      
      return NextResponse.json(visions.map(v => ({
        ...v,
        likes: v._count.likedBy,
        userName: v.user.name || v.user.email?.split('@')[0]
      })))
    }
  } catch (error) {
    console.error("Failed to fetch visions:", error)
    return NextResponse.json(
      { error: "Failed to fetch visions" },
      { status: 500 }
    )
  }
}

// POST new vision
export async function POST(req: Request) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "You must be signed in to create visions" },
        { status: 401 }
      )
    }
    
    const body = await req.json()
    const { promptText, imageUrl, category, categoryId } = body
    
    if (!promptText || !imageUrl || !category || !categoryId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }
    
    // Create vision and update user points
    const [vision, user] = await prisma.$transaction([
      prisma.vision.create({
        data: {
          promptText,
          imageUrl,
          category,
          categoryId,
          userId: session.user.id
        },
        include: {
          user: {
            select: { name: true, email: true }
          }
        }
      }),
      prisma.user.update({
        where: { id: session.user.id },
        data: {
          points: { increment: 3 },
          pointsFromVisions: { increment: 3 }
        }
      })
    ])
    
    return NextResponse.json({
      ...vision,
      likes: 0,
      userName: vision.user.name || vision.user.email?.split('@')[0]
    }, { status: 201 })
  } catch (error) {
    console.error("Failed to create vision:", error)
    return NextResponse.json(
      { error: "Failed to create vision" },
      { status: 500 }
    )
  }
}