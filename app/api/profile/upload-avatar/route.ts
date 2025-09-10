import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import clientPromise from "@/lib/mongodb"
import { uploadImage } from "@/lib/cloudinary"
import { ObjectId } from "mongodb"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Convert file to base64 for Cloudinary
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = `data:${file.type};base64,${buffer.toString("base64")}`

    const imageUrl = await uploadImage(base64, "lost-found/avatars")

    // Update user profile with new image
    const client = await clientPromise
    const db = client.db("lostfound")

    await db.collection("users").updateOne(
      { _id: new ObjectId(decoded.userId) },
      {
        $set: {
          profileImage: imageUrl,
          updatedAt: new Date(),
        },
      },
    )

    return NextResponse.json({ url: imageUrl })
  } catch (error) {
    console.error("Avatar upload error:", error)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}
