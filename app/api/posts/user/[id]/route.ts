import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = params.id

    if (!ObjectId.isValid(userId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db("lostfound")

    const posts = await db
      .collection("posts")
      .find({
        userId: new ObjectId(userId),
        status: "active", // Only show active posts on public profiles
      })
      .sort({ createdAt: -1 })
      .toArray()

    return NextResponse.json(posts)
  } catch (error) {
    console.error("Public user posts fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
