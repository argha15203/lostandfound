"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Plus, MapPin, Calendar, Eye, Filter, Loader2 } from "lucide-react"
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
  views: number
  createdAt: string
  user: {
    name: string
    profileImage?: string
    isVerified: boolean
  }
}

interface Pagination {
  page: number
  limit: number
  total: number
  pages: number
}

export default function HomePage() {
  const { user, logout } = useAuth()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  })

  useEffect(() => {
    fetchPosts()
  }, [categoryFilter, pagination.page])

  const fetchPosts = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      })

      if (categoryFilter !== "all") {
        params.append("category", categoryFilter)
      }

      if (searchTerm) {
        params.append("search", searchTerm)
      }

      const response = await fetch(`/api/posts?${params}`)
      if (response.ok) {
        const data = await response.json()
        setPosts(data.posts)
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error("Failed to fetch posts:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPagination((prev) => ({ ...prev, page: 1 }))
    fetchPosts()
  }

  const handleCategoryChange = (value: string) => {
    setCategoryFilter(value)
    setPagination((prev) => ({ ...prev, page: 1 }))
  }

  const loadMore = () => {
    if (pagination.page < pagination.pages) {
      setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <Link href="/" className="text-2xl font-bold text-primary">
                Lost & Found
              </Link>
              <nav className="hidden md:flex items-center gap-6">
                <Link href="/" className="text-sm font-medium hover:text-primary transition-colors">
                  Feed
                </Link>
                {user && (
                  <Link href="/profile" className="text-sm font-medium hover:text-primary transition-colors">
                    My Profile
                  </Link>
                )}
              </nav>
            </div>

            <div className="flex items-center gap-4">
              <Link href="/post/create">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Post Item
                </Button>
              </Link>
              {user ? (
                <div className="flex items-center gap-3">
                  <Link href="/profile">
                    <Avatar className="h-8 w-8 cursor-pointer">
                      <AvatarImage src={user.profileImage || "/placeholder.svg"} />
                      <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                  </Link>
                  <Button variant="outline" onClick={logout}>
                    Logout
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link href="/login">
                    <Button variant="outline">Sign In</Button>
                  </Link>
                  <Link href="/register">
                    <Button>Sign Up</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-muted/50 to-background py-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 text-balance">
            Find What <span className="text-primary">Matters</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 text-pretty max-w-2xl mx-auto">
            A trusted community platform to help you recover lost items and return found items to their rightful owners.
          </p>

          {/* Search and Filter */}
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardContent className="p-6">
                <form onSubmit={handleSearch} className="space-y-4">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search for lost or found items..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Select value={categoryFilter} onValueChange={handleCategoryChange}>
                        <SelectTrigger className="w-40">
                          <Filter className="h-4 w-4 mr-2" />
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Items</SelectItem>
                          <SelectItem value="lost">Lost Items</SelectItem>
                          <SelectItem value="found">Found Items</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button type="submit">Search</Button>
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Posts Feed */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold">Recent Posts</h2>
              <p className="text-muted-foreground">
                {pagination.total} {categoryFilter === "all" ? "items" : `${categoryFilter} items`} found
              </p>
            </div>
          </div>

          {loading && posts.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                <p className="text-muted-foreground">Loading posts...</p>
              </div>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-12">
              <div className="max-w-md mx-auto">
                <div className="h-24 w-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="h-12 w-12 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No items found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm
                    ? "Try adjusting your search terms or filters"
                    : "Be the first to post a lost or found item!"}
                </p>
                <Link href="/post/create">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Post an Item
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts.map((post) => (
                  <PostCard key={post._id} post={post} />
                ))}
              </div>

              {/* Load More */}
              {pagination.page < pagination.pages && (
                <div className="text-center mt-8">
                  <Button onClick={loadMore} disabled={loading} variant="outline">
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      "Load More"
                    )}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card mt-12">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <Link href="/" className="text-xl font-bold text-primary mb-4 block">
                Lost & Found
              </Link>
              <p className="text-muted-foreground mb-4">
                Helping communities reconnect with their lost belongings through a trusted and secure platform.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <div className="space-y-2">
                <Link href="/" className="block text-sm text-muted-foreground hover:text-primary">
                  Browse Items
                </Link>
                <Link href="/post/create" className="block text-sm text-muted-foreground hover:text-primary">
                  Post Item
                </Link>
                {user ? (
                  <Link href="/profile" className="block text-sm text-muted-foreground hover:text-primary">
                    My Profile
                  </Link>
                ) : (
                  <Link href="/register" className="block text-sm text-muted-foreground hover:text-primary">
                    Sign Up
                  </Link>
                )}
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Help Center</p>
                <p className="text-sm text-muted-foreground">Privacy Policy</p>
                <p className="text-sm text-muted-foreground">Terms of Service</p>
              </div>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 Lost & Found. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

function PostCard({ post }: { post: Post }) {
  return (
    <Link href={`/post/${post._id}`}>
      <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
        <CardHeader className="p-0">
          {post.images.length > 0 && (
            <div className="relative h-48 overflow-hidden rounded-t-lg">
              <img src={post.images[0] || "/placeholder.svg"} alt={post.title} className="w-full h-full object-cover" />
              <div className="absolute top-3 left-3">
                <Badge variant={post.category === "lost" ? "destructive" : "default"}>{post.category}</Badge>
              </div>
            </div>
          )}
        </CardHeader>
        <CardContent className="p-4">
          <div className="space-y-3">
            <div>
              <h3 className="font-semibold line-clamp-1">{post.title}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{post.description}</p>
            </div>

            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {post.location}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {new Date(post.dateOccurred).toLocaleDateString()}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={post.user.profileImage || "/placeholder.svg"} />
                  <AvatarFallback className="text-xs">{post.user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex items-center gap-1">
                  <span className="text-xs font-medium">{post.user.name}</span>
                  {post.user.isVerified && (
                    <Badge variant="secondary" className="text-xs px-1 py-0">
                      ✓
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Eye className="h-3 w-3" />
                {post.views}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
