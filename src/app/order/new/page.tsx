'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'

const CATEGORIES = ['food', 'beauty', 'living', 'fashion', 'electronics', 'other']

export default function NewOrderPage() {
  const router = useRouter()
  const supabase = createClient()

  const [loading, setLoading] = useState(false)
  const [images, setImages] = useState<File[]>([])
  const [form, setForm] = useState({
    product_name: '',
    category: '',
    description: '',
  })

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || [])
    if (files.length > 3) {
      toast.error('Max 3 images allowed')
      return
    }
    setImages(files)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.product_name || !form.category || !form.description) {
      toast.error('Please fill in all fields')
      return
    }

    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const imageUrls: string[] = []
      for (const image of images) {
        const ext = image.name.split('.').pop()
        const path = `${user.id}/${Date.now()}.${ext}`
        const { error } = await supabase.storage
          .from('product-images')
          .upload(path, image)
        if (error) throw error
        const { data: { publicUrl } } = supabase.storage
          .from('product-images')
          .getPublicUrl(path)
        imageUrls.push(publicUrl)
      }

      const { data: order, error } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          product_name: form.product_name,
          category: form.category,
          description: form.description,
          image_urls: imageUrls,
          status: 'pending',
        })
        .select()
        .single()

      if (error) throw error

      toast.success('Order created! Generating...')

      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: order.id }),
      })

      if (!res.ok) throw new Error('Generation failed')

      toast.success('Detail page created!')
      router.push(`/order/${order.id}`)

    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An error occurred'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-6 py-4">
        <h1 className="text-lg font-semibold">New Order</h1>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Product Info</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">

              <div className="space-y-2">
                <Label>Product Name *</Label>
                <Input
                  placeholder="e.g. Jeju Green Tea Serum"
                  value={form.product_name}
                  onChange={e => setForm({ ...form, product_name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Category *</Label>
                <select
                  className="w-full border rounded-md px-3 py-2 text-sm"
                  value={form.category}
                  onChange={e => setForm({ ...form, category: e.target.value })}
                  required
                >
                  <option value="">Select category</option>
                  {CATEGORIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label>Description *</Label>
                <Textarea
                  placeholder="Describe key features, benefits, and target customers..."
                  rows={5}
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Product Images (max 3)</Label>
                <Input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="cursor-pointer"
                />
                {images.length > 0 && (
                  <p className="text-sm text-gray-500">{images.length} file(s) selected</p>
                )}
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? 'AI is generating...' : 'Generate Detail Page'}
              </Button>

            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}