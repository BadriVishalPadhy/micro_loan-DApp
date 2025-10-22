import { type NextRequest, NextResponse } from "next/server"

// Mock user database - in production, use a real database
const mockUsers: Record<string, any> = {
  "demo@microloan.com": {
    id: "1",
    email: "demo@microloan.com",
    password: "demo123456", // In production, use bcrypt
    name: "Demo Borrower",
    role: "borrower",
    createdAt: new Date().toISOString(),
  },
  "lender@microloan.com": {
    id: "2",
    email: "lender@microloan.com",
    password: "lender123456",
    name: "Demo Lender",
    role: "lender",
    createdAt: new Date().toISOString(),
  },
}

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 })
    }

    const user = mockUsers[email]

    if (!user || user.password !== password) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Return user data without password
    const { password: _, ...userWithoutPassword } = user
    return NextResponse.json(userWithoutPassword)
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
