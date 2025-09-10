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

    // Get posts with user information
    const posts = await db
      .collection("posts")
      .aggregate([
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "user",
          },
        },
        {
          $unwind: "$user",
        },
        {
          $project: {
            title: 1,
            category: 1,
            status: 1,
            createdAt: 1,
            views: 1,
            userName: "$user.name",
            userEmail: "$user.email",
          },
        },
        {
          $sort: { createdAt: -1 },
        },
      ])
      .toArray()

    return NextResponse.json(posts)
  } catch (error) {
    console.error("Admin posts fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
