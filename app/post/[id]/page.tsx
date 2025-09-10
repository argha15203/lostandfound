"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { MapPin, Calendar, Eye, Phone, Mail, User, ArrowLeft, Share } from "lucide-react"
import Link from "next/link"

interface Post {
  _id: string
  title: string
  description: string
  category: string
  itemType: string
  location: string
  dateOccurred: string
  images: string[]
  contactInfo: {
    phone: string
    email: string
    preferredContact: string
  }
  status: string
  views: number
  createdAt: string
  user: {
    _id: string
    name: string
    profileImage?: string
    isVerified: boolean
  }
}

export default function PostDetailPage() {
  const params = useParams()
  const postId = params.id as string
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  useEffect(() => {
    if (postId) {
      fetchPost()
    }
  }, [postId])

  const fetchPost = async () => {
    try {
      const response = await fetch(`/api/posts/${postId}`)
      if (response.ok) {
        const data = await response.json()
        setPost(data)
      }
    } catch (error) {
      console.error("Failed to fetch post:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post?.title,
          text: post?.description,
          url: window.location.href,
        })
      } catch (error) {
        console.log("Error sharing:", error)
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href)
      alert("Link copied to clipboard!")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading post...</p>
        </div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Post not found.</p>
          <Link href="/">
            <Button className="mt-4">Back to Feed</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-primary">
              Lost & Found
            </Link>
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={handleShare}>
                <Share className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Link href="/">
                <Button variant="outline">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Feed
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant={post.category === "lost" ? "destructive" : "default"} className="text-sm">
                        {post.category.toUpperCase()}
                      </Badge>
                      <Badge variant="outline">{post.itemType}</Badge>
                      <Badge variant={post.status === "active" ? "default" : "secondary"}>{post.status}</Badge>
                    </div>
                    <CardTitle className="text-2xl mb-2">{post.title}</CardTitle>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {post.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(post.dateOccurred).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        {post.views} views
                      </span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Images */}
                {post.images.length > 0 && (
                  <div className="mb-6">
                    <div className="relative">
                      <img
                        src={post.images[currentImageIndex] || "/placeholder.svg"}
                        alt={post.title}
                        className="w-full h-64 md:h-96 object-cover rounded-lg"
                      />
                      {post.images.length > 1 && (
                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                          <div className="flex gap-2">
                            {post.images.map((_, index) => (
                              <button
                                key={index}
                                onClick={() => setCurrentImageIndex(index)}
                                className={`w-2 h-2 rounded-full ${
                                  index === currentImageIndex ? "bg-white" : "bg-white/50"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    {post.images.length > 1 && (
                      <div className="flex gap-2 mt-4 overflow-x-auto">
                        {post.images.map((image, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentImageIndex(index)}
                            className={`flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 ${
                              index === currentImageIndex ? "border-primary" : "border-transparent"
                            }`}
                          >
                            <img
                              src={image || "/placeholder.svg"}
                              alt={`${post.title} ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Description */}
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Description</h3>
                    <p className="text-muted-foreground leading-relaxed">{post.description}</p>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Category:</span>
                      <span className="ml-2 capitalize">{post.category}</span>
                    </div>
                    <div>
                      <span className="font-medium">Item Type:</span>
                      <span className="ml-2 capitalize">{post.itemType}</span>
                    </div>
                    <div>
                      <span className="font-medium">Location:</span>
                      <span className="ml-2">{post.location}</span>
                    </div>
                    <div>
                      <span className="font-medium">Date:</span>
                      <span className="ml-2">{new Date(post.dateOccurred).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Contact Information */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
                <CardDescription>Get in touch about this item</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{post.contactInfo.phone}</p>
                      <p className="text-xs text-muted-foreground">Phone</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{post.contactInfo.email}</p>
                      <p className="text-xs text-muted-foreground">Email</p>
                    </div>
                  </div>
                  <div className="pt-2">
                    <Badge variant="outline">
                      Preferred: {post.contactInfo.preferredContact === "phone" ? "Phone" : "Email"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Posted By */}
            <Card>
              <CardHeader>
                <CardTitle>Posted By</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={post.user.profileImage || "/placeholder.svg"} />
                    <AvatarFallback>{post.user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{post.user.name}</p>
                      {post.user.isVerified && <Badge variant="secondary">Verified</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Posted on {new Date(post.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <Link href={`/profile/${post.user._id}`}>
                  <Button variant="outline" className="w-full mt-4 bg-transparent">
                    <User className="h-4 w-4 mr-2" />
                    View Profile
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
