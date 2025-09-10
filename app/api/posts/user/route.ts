import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any

    const client = await clientPromise
    const db = client.db("lostfound")

    const posts = await db
      .collection("posts")
      .find({ userId: new ObjectId(decoded.userId) })
      .sort({ createdAt: -1 })
      .toArray()

    return NextResponse.json(posts)
  } catch (error) {
    console.error("User posts fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
