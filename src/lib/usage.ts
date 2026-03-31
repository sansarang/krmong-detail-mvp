import { createAdminClient } from '@/lib/supabase/server'

const PLAN_LIMIT: Record<string, number> = {
  free: 5,
  pro: -1,       // unlimited
  business: -1,  // unlimited
}

export async function checkAndIncrementUsage(userId: string): Promise<{ ok: boolean; error?: string }> {
  const supabase = createAdminClient()

  // user_profiles 조회
  const { data: profile, error: fetchErr } = await supabase
    .from('user_profiles')
    .select('plan, monthly_usage, usage_reset_at')
    .eq('id', userId)
    .single()

  if (fetchErr || !profile) {
    // 프로필 없으면 자동 생성
    await supabase.from('user_profiles').upsert({ id: userId })
    return checkAndIncrementUsage(userId)
  }

  const plan = profile.plan ?? 'free'
  const limit = PLAN_LIMIT[plan] ?? 5

  // 한 달 이상 지났으면 리셋
  const resetAt = new Date(profile.usage_reset_at)
  const now = new Date()
  const monthDiff =
    (now.getFullYear() - resetAt.getFullYear()) * 12 + (now.getMonth() - resetAt.getMonth())

  let currentUsage = profile.monthly_usage ?? 0

  if (monthDiff >= 1) {
    // 리셋
    await supabase.from('user_profiles').update({
      monthly_usage: 0,
      usage_reset_at: now.toISOString(),
    }).eq('id', userId)
    currentUsage = 0
  }

  // 무제한 플랜
  if (limit === -1) {
    await supabase.from('user_profiles').update({ monthly_usage: currentUsage + 1 }).eq('id', userId)
    return { ok: true }
  }

  // 무료 플랜 한도 체크
  if (currentUsage >= limit) {
    return { ok: false, error: `월 ${limit}회 생성 한도를 초과했습니다. 프로 플랜으로 업그레이드하세요.` }
  }

  // 사용량 +1
  await supabase.from('user_profiles').update({ monthly_usage: currentUsage + 1 }).eq('id', userId)
  return { ok: true }
}
