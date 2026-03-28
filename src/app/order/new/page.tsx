'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'

const CATEGORIES = ['식품', '뷰티', '생활용품', '패션', '전자제품', '기타']

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
      toast.error('이미지는 최대 3장까지 업로드 가능합니다')
      return
    }
    setImages(files)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.product_name || !form.category || !form.description) {
      toast.error('모든 항목을 입력해주세요')
      return
    }

    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      // 이미지 업로드
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

      // 주문 생성
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

      toast.success('주문이 생성됐습니다! AI 생성을 시작합니다...')

      // Claude API 호출
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: order.id }),
      })

      if (!res.ok) throw new Error('AI 생성 실패')

      toast.success('상세페이지가 생성됐습니다!')
      router.push(`/order/${order.id}`)

    } catch (err: any) {
      toast.error(err.message || '오류가 발생했습니다')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-6 py-4">
        <h1 className="text-lg font-semibold">새 상세페이지 주문</h1>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-8">
        <Card>
          <CardHeader>
            <CardTitle>제품 정보 입력</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">

              <div className="space-y-2">
                <Label>제품명 *</Label>
                <Input
                  placeholder="예: 제주 유기농 녹차 추출 세럼"
                  value={form.product_name}
                  onChange={e => setForm({ ...form, product_name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>카테고리 *</Label>
                <Select onValueChange={v => setForm({ ...form, category: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="카테고리 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(c => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>제품 설명 *</Label>
                <Textarea
                  placeholder="제품의 주요 특징, 효능, 타겟 고객 등을 자세히 입력해주세요. 더 자세할수록 AI가 더 좋은 상세페이지를 만들어줍니다."
                  rows={5}
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>제품 사진 (최대 3장)</Label>
                <Input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="cursor-pointer"
                />
                {images.length > 0 && (
                  <p className="text-sm text-gray-500">{images.length}장 선택됨</p>
                )}
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? 'AI가 상세페이지를 만드는 중...' : '상세페이지 생성 시작 →'}
              </Button>

            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
