"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Mail, Phone, Calendar, FileText, Eye, ArrowLeft } from "lucide-react"
import Link from "next/link"

interface PublicUser {
  _id: string
  name: string
  email: string
  phone: string
  profileImage?: string
  isVerified: boolean
  createdAt: string
}

interface UserPost {
  _id: string
  title: string
  description: string
  category: string
  status: string
  createdAt: string
  views: number
  images: string[]
}

export default function PublicProfilePage() {
  const params = useParams()
  const userId = params.id as string
  const [user, setUser] = useState<PublicUser | null>(null)
  const [posts, setPosts] = useState<UserPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (userId) {
      fetchUserProfile()
    }
  }, [userId])

  const fetchUserProfile = async () => {
    try {
      const [userRes, postsRes] = await Promise.all([
        fetch(`/api/profile/${userId}`),
        fetch(`/api/posts/user/${userId}`),
      ])

      if (userRes.ok) {
        const userData = await userRes.json()
        setUser(userData)
      }

      if (postsRes.ok) {
        const postsData = await postsRes.json()
        setPosts(postsData)
      }
    } catch (error) {
      console.error("Failed to fetch user profile:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">User not found.</p>
          <Link href="/">
            <Button className="mt-4">Back to Home</Button>
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
            <Link href="/">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Feed
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Info */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Profile</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center text-center mb-6">
                  <Avatar className="h-24 w-24 mb-4">
                    <AvatarImage src={user.profileImage || "/placeholder.svg"} />
                    <AvatarFallback className="text-2xl">{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-semibold">{user.name}</h2>
                    {user.isVerified && <Badge variant="secondary">Verified</Badge>}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{user.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{user.phone}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Member since {new Date(user.createdAt).getFullYear()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stats Card */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Activity Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-primary">{posts.length}</div>
                    <div className="text-sm text-muted-foreground">Total Posts</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-primary">
                      {posts.reduce((sum, post) => sum + post.views, 0)}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Views</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Posts Section */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>{user.name}'s Posts</CardTitle>
                <CardDescription>Lost and found posts by this user</CardDescription>
              </CardHeader>
              <CardContent>
                {posts.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No posts found</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {posts.map((post) => (
                      <div key={post._id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-medium">{post.title}</h3>
                              <Badge variant={post.category === "lost" ? "destructive" : "default"}>
                                {post.category}
                              </Badge>
                              <Badge variant={post.status === "active" ? "default" : "secondary"}>{post.status}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{post.description}</p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(post.createdAt).toLocaleDateString()}
                              </span>
                              <span className="flex items-center gap-1">
                                <Eye className="h-3 w-3" />
                                {post.views} views
                              </span>
                            </div>
                          </div>
                          {post.images.length > 0 && (
                            <div className="ml-4">
                              <img
                                src={post.images[0] || "/placeholder.svg"}
                                alt={post.title}
                                className="w-16 h-16 object-cover rounded-md"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
