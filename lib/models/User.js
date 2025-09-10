export const UserSchema = {
  _id: "ObjectId",
  email: "string",
  password: "string", // hashed
  name: "string",
  phone: "string",
  profileImage: "string", // Cloudinary URL
  isAdmin: "boolean",
  createdAt: "Date",
  updatedAt: "Date",
  isVerified: "boolean",
}

export const createUserIndexes = async (db) => {
  const users = db.collection("users")
  await users.createIndex({ email: 1 }, { unique: true })
  await users.createIndex({ phone: 1 })
}
