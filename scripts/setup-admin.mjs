// 관리자 계정 생성 스크립트 — 한 번만 실행하세요
// 사용: node --env-file=.env.local scripts/setup-admin.mjs

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const EMAIL = 'jyj1653@krmong.local'
const PASSWORD = 'jini1653'

// 1. 이미 있으면 삭제 후 재생성
const { data: existing } = await supabase.auth.admin.listUsers()
const old = existing?.users?.find(u => u.email === EMAIL)
if (old) {
  await supabase.auth.admin.deleteUser(old.id)
  console.log('기존 계정 삭제 완료')
}

// 2. 새 계정 생성 (이메일 인증 없이 바로 활성화)
const { data, error } = await supabase.auth.admin.createUser({
  email: EMAIL,
  password: PASSWORD,
  email_confirm: true,
})

if (error) {
  console.error('생성 실패:', error.message)
  process.exit(1)
}

const userId = data.user.id
console.log('계정 생성 완료. user_id:', userId)

// 3. profiles 테이블에 plan = 'pro' 설정 (무제한)
const { error: profileErr } = await supabase
  .from('profiles')
  .upsert({ id: userId, plan: 'pro' }, { onConflict: 'id' })

if (profileErr) {
  console.warn('profiles 업데이트 실패 (테이블이 없으면 무시):', profileErr.message)
} else {
  console.log('플랜 설정 완료: pro (무제한)')
}

console.log('\n✅ 완료!')
console.log('이메일:', EMAIL)
console.log('비밀번호:', PASSWORD)
