"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function ProfilePage() {
  const { user, isLoading, updateProfile } = useAuth()
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    businessName: "",
  })
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState("")

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/auth/login")
    } else if (user) {
      setFormData({
        name: user.name,
        bio: user.bio || "",
        businessName: user.businessName || "",
      })
    }
  }, [user, isLoading, router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setMessage("")

    try {
      await updateProfile(formData)
      setMessage("Profile updated successfully")
      setTimeout(() => setMessage(""), 3000)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to update profile")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Link href="/dashboard" className="flex items-center gap-2 text-primary hover:underline mb-8">
          <ArrowLeft size={18} />
          Back to Dashboard
        </Link>

        <Card className="p-8">
          <h1 className="text-3xl font-bold text-foreground mb-8">Edit Profile</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {message && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800">{message}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Full Name</label>
              <Input type="text" name="name" value={formData.name} onChange={handleChange} disabled={isSaving} />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                {user.role === "borrower" ? "Business Name" : "Company Name"}
              </label>
              <Input
                type="text"
                name="businessName"
                placeholder={user.role === "borrower" ? "Your business name" : "Your company name"}
                value={formData.businessName}
                onChange={handleChange}
                disabled={isSaving}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Bio</label>
              <textarea
                name="bio"
                placeholder="Tell us about yourself..."
                value={formData.bio}
                onChange={handleChange}
                disabled={isSaving}
                rows={4}
                className="w-full px-3 py-2 border border-muted rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="pt-4">
              <Button type="submit" className="w-full" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 size={18} className="animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  )
}
