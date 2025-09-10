import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const postId = params.id

    if (!ObjectId.isValid(postId)) {
      return NextResponse.json({ error: "Invalid post ID" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db("lostfound")

    // Increment view count
    await db.collection("posts").updateOne({ _id: new ObjectId(postId) }, { $inc: { views: 1 } })

    // Get post with user information
    const post = await db
      .collection("posts")
      .aggregate([
        { $match: { _id: new ObjectId(postId) } },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "user",
          },
        },
        { $unwind: "$user" },
        {
          $project: {
            title: 1,
            description: 1,
            category: 1,
            itemType: 1,
            location: 1,
            dateOccurred: 1,
            images: 1,
            contactInfo: 1,
            status: 1,
            views: 1,
            createdAt: 1,
            "user._id": 1,
            "user.name": 1,
            "user.profileImage": 1,
            "user.isVerified": 1,
          },
        },
      ])
      .toArray()

    if (post.length === 0) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 })
    }

    return NextResponse.json(post[0])
  } catch (error) {
    console.error("Post fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
