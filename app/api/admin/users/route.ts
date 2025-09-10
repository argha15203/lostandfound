import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import clientPromise from "@/lib/mongodb"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any

    if (!decoded.isAdmin) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const client = await clientPromise
    const db = client.db("lostfound")

    // Get users with post counts
    const users = await db
      .collection("users")
      .aggregate([
        {
          $lookup: {
            from: "posts",
            localField: "_id",
            foreignField: "userId",
            as: "posts",
          },
        },
        {
          $project: {
            password: 0,
            posts: 0,
          },
        },
        {
          $addFields: {
            postCount: { $size: "$posts" },
          },
        },
        {
          $sort: { createdAt: -1 },
        },
      ])
      .toArray()

    return NextResponse.json(users)
  } catch (error) {
    console.error("Admin users fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
