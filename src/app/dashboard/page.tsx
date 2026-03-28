import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

type StatusKey = 'pending' | 'generating' | 'done' | 'error'
type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline'

const statusMap: Record<StatusKey, { label: string; variant: BadgeVariant }> = {
  pending:    { label: 'waiting', variant: 'secondary' },
  generating: { label: 'working', variant: 'default' },
  done:       { label: 'done',    variant: 'outline' },
  error:      { label: 'error',   variant: 'destructive' },
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
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-6 py-4 flex justify-between items-center">
        <h1 className="text-lg font-semibold">AI Detail Page</h1>
        <span className="text-sm text-gray-500">{user.email}</span>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Orders</h2>
          <Link href="/order/new">
            <Button>+ New Order</Button>
          </Link>
        </div>

        {!orders || orders.length === 0 ? (
          <Card>
            <CardContent className="text-center py-16">
              <p className="text-gray-400 mb-4">No orders yet</p>
              <Link href="/order/new">
                <Button>Create First Page</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {orders.map(order => {
              const status = statusMap[order.status as StatusKey] || statusMap.pending
              return (
                <Card key={order.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="flex items-center justify-between py-4">
                    <div>
                      <p className="font-medium">{order.product_name}</p>
                      <p className="text-sm text-gray-400 mt-0.5">
                        {order.category} · {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={status.variant}>{status.label}</Badge>
                      {order.status === 'done' && (
                        <Link href={"/order/" + order.id}>
                          <Button size="sm" variant="outline">View</Button>
                        </Link>
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