import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any
    const postData = await request.json()

    const { title, description, category, itemType, location, dateOccurred, images, contactInfo } = postData

    if (!title || !description || !category || !itemType || !location || !dateOccurred || !contactInfo) {
      return NextResponse.json({ error: "All required fields must be provided" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db("lostfound")

    const newPost = {
      title,
      description,
      category,
      itemType,
      location,
      dateOccurred: new Date(dateOccurred),
      images: images || [],
      contactInfo,
      userId: new ObjectId(decoded.userId),
      status: "active",
      views: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection("posts").insertOne(newPost)

    return NextResponse.json({ id: result.insertedId, message: "Post created successfully" })
  } catch (error) {
    console.error("Post creation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const search = searchParams.get("search")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const skip = (page - 1) * limit

    const client = await clientPromise
    const db = client.db("lostfound")

    // Build query
    const query: any = { status: "active" }

    if (category && category !== "all") {
      query.category = category
    }

    if (search) {
      query.$text = { $search: search }
    }

    // Get posts with user information
    const posts = await db
      .collection("posts")
      .aggregate([
        { $match: query },
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
            views: 1,
            createdAt: 1,
            "user.name": 1,
            "user.profileImage": 1,
            "user.isVerified": 1,
          },
        },
        { $sort: { createdAt: -1 } },
        { $skip: skip },
        { $limit: limit },
      ])
      .toArray()

    const total = await db.collection("posts").countDocuments(query)

    return NextResponse.json({
      posts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Posts fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
