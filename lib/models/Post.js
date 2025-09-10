export const PostSchema = {
  _id: "ObjectId",
  title: "string",
  description: "string",
  category: "string", // "lost" or "found"
  itemType: "string", // "electronics", "clothing", "documents", etc.
  location: "string",
  dateOccurred: "Date",
  images: ["string"], // Array of Cloudinary URLs
  contactInfo: {
    phone: "string",
    email: "string",
    preferredContact: "string", // "phone" or "email"
  },
  userId: "ObjectId", // Reference to user
  status: "string", // "active", "resolved", "expired"
  createdAt: "Date",
  updatedAt: "Date",
  views: "number",
}

export const createPostIndexes = async (db) => {
  const posts = db.collection("posts")
  await posts.createIndex({ userId: 1 })
  await posts.createIndex({ category: 1 })
  await posts.createIndex({ status: 1 })
  await posts.createIndex({ createdAt: -1 })
  await posts.createIndex({ location: "text", title: "text", description: "text" })
}
