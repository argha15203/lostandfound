"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ImageUpload } from "@/components/image-upload"
import { Mail, Phone, Calendar, FileText, Eye, Edit, Save, X, Camera } from "lucide-react"
import Link from "next/link"

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

export default function ProfilePage() {
  const { user } = useAuth()
  const [posts, setPosts] = useState<UserPost[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [updateLoading, setUpdateLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [showAvatarUpload, setShowAvatarUpload] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
  })

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        phone: user.phone,
      })
      fetchUserPosts()
    }
  }, [user])

  const fetchUserPosts = async () => {
    try {
      const response = await fetch("/api/posts/user")
      if (response.ok) {
        const data = await response.json()
        setPosts(data)
      }
    } catch (error) {
      console.error("Failed to fetch user posts:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setUpdateLoading(true)
    setMessage("")

    try {
      const response = await fetch("/api/profile/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setMessage("Profile updated successfully!")
        setEditing(false)
        // Refresh auth context
        window.location.reload()
      } else {
        const data = await response.json()
        setMessage(data.error || "Failed to update profile")
      }
    } catch (error) {
      setMessage("Failed to update profile")
    } finally {
      setUpdateLoading(false)
    }
  }

  const handleAvatarUpload = async (imageUrl: string) => {
    if (imageUrl) {
      setMessage("Profile picture updated successfully!")
      setShowAvatarUpload(false)
      // Refresh to show new avatar
      setTimeout(() => window.location.reload(), 1000)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const cancelEdit = () => {
    setFormData({
      name: user?.name || "",
      phone: user?.phone || "",
    })
    setEditing(false)
    setMessage("")
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Please log in to view your profile.</p>
          <Link href="/login">
            <Button className="mt-4">Go to Login</Button>
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
              <Link href="/post/create">
                <Button>Create Post</Button>
              </Link>
              <Link href="/">
                <Button variant="outline">Back to Feed</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Info */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Profile Information</CardTitle>
                  {!editing ? (
                    <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={cancelEdit}>
                        <X className="h-4 w-4" />
                      </Button>
                      <Button size="sm" onClick={handleUpdateProfile} disabled={updateLoading}>
                        <Save className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {message && (
                  <Alert className="mb-4">
                    <AlertDescription>{message}</AlertDescription>
                  </Alert>
                )}

                <div className="flex flex-col items-center text-center mb-6">
                  <div className="relative">
                    <Avatar className="h-24 w-24 mb-4">
                      <AvatarImage src={user.profileImage || "/placeholder.svg"} />
                      <AvatarFallback className="text-2xl">{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <Button
                      variant="outline"
                      size="sm"
                      className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0 bg-transparent"
                      onClick={() => setShowAvatarUpload(!showAvatarUpload)}
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                  </div>

                  {showAvatarUpload && (
                    <div className="w-full mb-4">
                      <ImageUpload
                        onImageUploaded={handleAvatarUpload}
                        className="w-full"
                        maxSize={5}
                        accept="image/*"
                      />
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-semibold">{user.name}</h2>
                    {user.isVerified && <Badge variant="secondary">Verified</Badge>}
                  </div>
                </div>

                {editing ? (
                  <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input id="phone" name="phone" value={formData.phone} onChange={handleChange} required />
                    </div>
                  </form>
                ) : (
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
                      <span>Member since {new Date().getFullYear()}</span>
                    </div>
                  </div>
                )}
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
                <CardTitle>My Posts</CardTitle>
                <CardDescription>Manage your lost and found posts</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="all" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="lost">Lost</TabsTrigger>
                    <TabsTrigger value="found">Found</TabsTrigger>
                    <TabsTrigger value="resolved">Resolved</TabsTrigger>
                  </TabsList>

                  <TabsContent value="all" className="mt-6">
                    <PostsList posts={posts} />
                  </TabsContent>

                  <TabsContent value="lost" className="mt-6">
                    <PostsList posts={posts.filter((post) => post.category === "lost")} />
                  </TabsContent>

                  <TabsContent value="found" className="mt-6">
                    <PostsList posts={posts.filter((post) => post.category === "found")} />
                  </TabsContent>

                  <TabsContent value="resolved" className="mt-6">
                    <PostsList posts={posts.filter((post) => post.status === "resolved")} />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

function PostsList({ posts }: { posts: UserPost[] }) {
  if (posts.length === 0) {
    return (
      <div className="text-center py-8">
        <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">No posts found</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <div key={post._id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-medium">{post.title}</h3>
                <Badge variant={post.category === "lost" ? "destructive" : "default"}>{post.category}</Badge>
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
  )
}
