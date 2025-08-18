import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

const MAX_USERS = 10

export async function POST(req: Request) {
  try {
    const { email, password, name } = await req.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      )
    }

    // Check if we've reached the user limit
    const userCount = await prisma.user.count()
    
    if (userCount >= MAX_USERS) {
      // Add to waiting list instead
      try {
        await prisma.waitingList.create({
          data: {
            email,
            name
          }
        })
        return NextResponse.json(
          { 
            error: "Maximum user limit reached", 
            waitingList: true,
            message: "You've been added to the waiting list! We'll notify you when space becomes available."
          },
          { status: 403 }
        )
      } catch (waitingListError) {
        // Email already on waiting list
        return NextResponse.json(
          { 
            error: "Maximum user limit reached", 
            waitingList: true,
            message: "You're already on the waiting list!"
          },
          { status: 403 }
        )
      }
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user with initial points
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        points: 100, // Starting points for new users
        pointsFromVisions: 0,
        pointsFromLikes: 0,
        pointsFromFunding: 0
      },
      select: {
        id: true,
        email: true,
        name: true,
        points: true
      }
    })

    return NextResponse.json(
      { 
        message: "User created successfully",
        user,
        remainingSlots: MAX_USERS - userCount - 1
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    )
  }
}