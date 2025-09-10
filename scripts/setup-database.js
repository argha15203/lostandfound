import clientPromise from "../lib/mongodb.js"
import { createUserIndexes } from "../lib/models/User.js"
import { createPostIndexes } from "../lib/models/Post.js"

async function setupDatabase() {
  try {
    const client = await clientPromise
    const db = client.db("lostfound")

    console.log("Setting up database collections and indexes...")

    // Create collections
    await db.createCollection("users")
    await db.createCollection("posts")

    // Create indexes
    await createUserIndexes(db)
    await createPostIndexes(db)

    // Create admin user if it doesn't exist
    const adminExists = await db.collection("users").findOne({ email: "admin@lostfound.com" })

    if (!adminExists) {
      const bcrypt = await import("bcryptjs")
      const hashedPassword = await bcrypt.hash("admin123", 12)

      await db.collection("users").insertOne({
        email: "admin@lostfound.com",
        password: hashedPassword,
        name: "Admin User",
        phone: "+1234567890",
        isAdmin: true,
        isVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      console.log("Admin user created: admin@lostfound.com / admin123")
    }

    console.log("Database setup completed successfully!")
  } catch (error) {
    console.error("Database setup failed:", error)
  }
}

setupDatabase()
