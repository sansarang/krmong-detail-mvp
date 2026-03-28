import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: orders } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })

  const statusLabel: Record<string, { text: string; color: string }> = {
    pending:    { text: '대기중', color: 'bg-yellow-50 text-yellow-600 border-yellow-200' },
    generating: { text: '생성중', color: 'bg-blue-50 text-blue-600 border-blue-200' },
    done:       { text: '완료',   color: 'bg-green-50 text-green-700 border-green-200' },
    error:      { text: '오류',   color: 'bg-red-50 text-red-600 border-red-200' },
  }

  return (
    <main className="min-h-screen bg-white">
      <nav className="flex items-center justify-between px-8 py-5 border-b border-gray-100">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-black rounded-lg" />
          <span className="font-bold text-lg tracking-tight">페이지AI</span>
        </Link>
        <span className="text-gray-400 text-sm">{user.email}</span>
      </nav>

      <div className="max-w-3xl mx-auto px-8 py-16">
        <div className="flex justify-between items-end mb-12">
          <div>
            <p className="text-xs font-bold text-gray-300 uppercase tracking-widest mb-2">대시보드</p>
            <h1 className="text-4xl font-black text-black tracking-tight">내 상세페이지</h1>
          </div>
          <Link href="/order/new" className="bg-black text-white px-6 py-3 rounded-2xl text-sm font-bold hover:bg-gray-800 transition-all">
            + 새 주문
          </Link>
        </div>

        {!orders || orders.length === 0 ? (
          <div className="border border-gray-100 rounded-3xl p-20 text-center bg-gray-50">
            <div className="text-5xl mb-4">✨</div>
            <p className="text-gray-400 mb-6 font-medium">아직 생성된 상세페이지가 없습니다</p>
            <Link href="/order/new" className="bg-black text-white px-8 py-3 rounded-2xl text-sm font-bold hover:bg-gray-800 transition-all inline-block">
              첫 상세페이지 만들기
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map(order => {
              const s = statusLabel[order.status] || statusLabel.pending
              return (
                <div key={order.id} className="flex items-center justify-between p-5 border border-gray-100 rounded-2xl hover:border-gray-300 hover:shadow-sm transition-all bg-white">
                  <div>
                    <p className="font-bold text-gray-900">{order.product_name}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {order.category} · {new Date(order.created_at).toLocaleDateString('ko-KR')}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full border ${s.color}`}>{s.text}</span>
                    {order.status === 'done' && (
                      <Link href={"/order/" + order.id} className="bg-black text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-gray-800 transition-all">
                        결과 보기
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
