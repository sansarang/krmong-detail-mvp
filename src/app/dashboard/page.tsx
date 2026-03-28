import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'

type StatusKey = 'pending' | 'generating' | 'done' | 'error'
type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline'

const statusMap: Record<StatusKey, { label: string; variant: BadgeVariant; color: string }> = {
  pending:    { label: '대기중', variant: 'secondary', color: 'text-yellow-400' },
  generating: { label: '생성중', variant: 'default',   color: 'text-blue-400' },
  done:       { label: '완료',   variant: 'outline',   color: 'text-green-400' },
  error:      { label: '오류',   variant: 'destructive', color: 'text-red-400' },
}

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: orders } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* 배경 효과 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10" />
      </div>

      {/* 헤더 */}
      <header className="relative z-10 bg-white/5 backdrop-blur-xl border-b border-white/10 px-6 py-4">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg" />
            <span className="text-white font-bold text-lg">AI 상세페이지</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-white/50 text-sm hidden sm:block">{user.email}</span>
            <form action={async () => { 'use server'; const { createServerSupabaseClient } = await import('@/lib/supabase/server'); const s = await createServerSupabaseClient(); await s.auth.signOut(); redirect('/login'); }}>
              <button type="submit" className="text-white/50 hover:text-white text-sm transition-colors">
                로그아웃
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-10">
        {/* 상단 */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">내 주문</h1>
            <p className="text-white/40 text-sm">AI가 생성한 상세페이지 목록</p>
          </div>
          <Link
            href="/order/new"
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition-all hover:scale-105 hover:shadow-lg hover:shadow-purple-500/30"
          >
            + 새 주문
          </Link>
        </div>

        {!orders || orders.length === 0 ? (
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-16 text-center">
            <div className="text-6xl mb-4">✨</div>
            <p className="text-white/60 mb-6 text-lg">아직 주문이 없습니다</p>
            <Link
              href="/order/new"
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-3 rounded-xl font-semibold hover:opacity-90 transition-all inline-block"
            >
              첫 상세페이지 만들기
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => {
              const status = statusMap[order.status as StatusKey] || statusMap.pending
              return (
                <div
                  key={order.id}
                  className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-all duration-300 hover:border-white/20"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-white font-semibold text-lg">{order.product_name}</h3>
                        <span className={`text-xs font-medium ${status.color}`}>● {status.label}</span>
                      </div>
                      <p className="text-white/40 text-sm">
                        {order.category} · {new Date(order.created_at).toLocaleDateString('ko-KR')}
                      </p>
                    </div>
                    {order.status === 'done' && (
                      <Link
                        href={"/order/" + order.id}
                        className="bg-white/10 border border-white/20 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-white/20 transition-all ml-4"
                      >
                        결과 보기 →
                      </Link>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
