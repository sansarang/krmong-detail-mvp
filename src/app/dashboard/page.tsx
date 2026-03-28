import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const statusMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  pending:    { label: '대기중',   variant: 'secondary' },
  generating: { label: '생성중',   variant: 'default' },
  done:       { label: '완료',     variant: 'outline' },
  error:      { label: '오류',     variant: 'destructive' },
}

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: orders } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })

  async function signOut() {
    'use server'
    const supabase = await createServerSupabaseClient()
    await supabase.auth.signOut()
    redirect('/login')
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-6 py-4 flex justify-between items-center">
        <h1 className="text-lg font-semibold">상세페이지 AI 제작</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">{user.email}</span>
          <form action={signOut}>
            <Button variant="outline" size="sm" type="submit">로그아웃</Button>
          </form>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">내 주문 목록</h2>
          <Button asChild>
            <Link href="/order/new">+ 새 주문</Link>
          </Button>
        </div>

        {!orders || orders.length === 0 ? (
          <Card>
            <CardContent className="text-center py-16">
              <p className="text-gray-400 mb-4">아직 주문이 없습니다</p>
              <Button asChild>
                <Link href="/order/new">첫 상세페이지 만들기</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {orders.map(order => {
              const status = statusMap[order.status] || statusMap.pending
              return (
                <Card key={order.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="flex items-center justify-between py-4">
                    <div>
                      <p className="font-medium">{order.product_name}</p>
                      <p className="text-sm text-gray-400 mt-0.5">
                        {order.category} · {new Date(order.created_at).toLocaleDateString('ko-KR')}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={status.variant}>{status.label}</Badge>
                      {order.status === 'done' && (
                        <Button asChild size="sm" variant="outline">
                          <Link href={`/order/${order.id}`}>결과 보기</Link>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
