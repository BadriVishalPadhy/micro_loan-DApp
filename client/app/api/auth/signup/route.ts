import { type NextRequest, NextResponse } from "next/server"

const mockUsers: Record<string, any> = {}

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, role } = await request.json()

    if (!email || !password || !name || !role) {
      return NextResponse.json({ error: "All fields required" }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 })
    }

    if (mockUsers[email]) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 })
    }

    // Create new user
    const newUser = {
      id: Date.now().toString(),
      email,
      password, // In production, use bcrypt
      name,
      role,
      createdAt: new Date().toISOString(),
    }

    mockUsers[email] = newUser

    // Return user data without password
    const { password: _, ...userWithoutPassword } = newUser
    return NextResponse.json(userWithoutPassword)
  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
