import { createHmac, timingSafeEqual } from 'crypto'

/** 기본 30일 */
const DEFAULT_TTL_SEC = 60 * 60 * 24 * 30

function secret(): string | undefined {
  return process.env.ORDER_SHARE_SECRET?.trim() || undefined
}

export function isShareLinkConfigured(): boolean {
  return Boolean(secret())
}

export function signOrderShareToken(orderId: string, ttlSec = DEFAULT_TTL_SEC): string {
  const s = secret()
  if (!s) throw new Error('ORDER_SHARE_SECRET is not set')
  const exp = Math.floor(Date.now() / 1000) + ttlSec
  const sig = createHmac('sha256', s).update(`${orderId}:${exp}`).digest('hex')
  return `${exp}.${sig}`
}

export function verifyOrderShareToken(orderId: string, token: string | undefined): boolean {
  const s = secret()
  if (!s || !token) return false
  const [expStr, sig] = token.split('.')
  if (!expStr || !sig || sig.length !== 64) return false
  const exp = Number(expStr)
  if (!Number.isFinite(exp) || exp < Math.floor(Date.now() / 1000)) return false
  const expected = createHmac('sha256', s).update(`${orderId}:${exp}`).digest('hex')
  try {
    return timingSafeEqual(Buffer.from(sig, 'utf8'), Buffer.from(expected, 'utf8'))
  } catch {
    return false
  }
}
