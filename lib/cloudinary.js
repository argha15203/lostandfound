import { v2 as cloudinary } from "cloudinary"

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "dbhl52bav",
  api_key: process.env.CLOUDINARY_API_KEY || "619763533896431",
  api_secret: process.env.CLOUDINARY_API_SECRET || "lZ-8dOfSULi3SddVzBgcpTvefa0",
})

export const uploadImage = async (file, folder = "lost-found") => {
  try {
    const result = await cloudinary.uploader.upload(file, {
      folder: folder,
      resource_type: "auto",
      transformation: [{ width: 800, height: 600, crop: "limit" }, { quality: "auto" }, { fetch_format: "auto" }],
      // Add unique filename to prevent conflicts
      public_id: `${Date.now()}_${Math.random().toString(36).substring(7)}`,
    })
    return result.secure_url
  } catch (error) {
    console.error("Cloudinary upload error:", error)
    throw new Error("Image upload failed")
  }
}

export const deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId)
    return result
  } catch (error) {
    console.error("Cloudinary delete error:", error)
    throw new Error("Image deletion failed")
  }
}

export default cloudinary
