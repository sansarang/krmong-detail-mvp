import HomePage from '@/components/HomePage'
import { createServerSupabaseClient } from '@/lib/supabase/server'
export default async function ZhHome() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  return <HomePage lang="zh" isLoggedIn={!!user} />
}
