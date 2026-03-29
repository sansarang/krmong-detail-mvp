import type { SupabaseClient } from '@supabase/supabase-js'

const MAX_IMAGES = 3
const MAX_FETCH_BYTES = 12 * 1024 * 1024
const MAX_PROMPT_LEN = 800

export type ImageAction = {
  action: 'replace' | 'append'
  slot?: number
  mode: 'generate' | 'fetch_url'
  prompt?: string
  source_url?: string
}

export function isImageAction(a: unknown): a is ImageAction {
  if (!a || typeof a !== 'object') return false
  const o = a as Record<string, unknown>
  if (o.action !== 'replace' && o.action !== 'append') return false
  if (o.mode !== 'generate' && o.mode !== 'fetch_url') return false
  if (o.mode === 'generate') {
    if (typeof o.prompt !== 'string' || !o.prompt.trim()) return false
  } else {
    if (typeof o.source_url !== 'string' || !o.source_url.trim().startsWith('https://')) return false
  }
  if (o.slot !== undefined && (typeof o.slot !== 'number' || !Number.isInteger(o.slot))) return false
  return true
}

function truncatePrompt(p: string): string {
  const t = p.trim().slice(0, MAX_PROMPT_LEN)
  return t || 'professional product photo, clean background, high quality'
}

function sleep(ms: number) {
  return new Promise<void>(resolve => setTimeout(resolve, ms))
}

/** Pollinations — 키 없이 데모·MVP용 (Replicate 미설정 또는 실패 시) */
async function fetchPollinationsImageBuffer(prompt: string): Promise<{ buffer: Buffer; contentType: string }> {
  const q = encodeURIComponent(truncatePrompt(prompt))
  const url = `https://image.pollinations.ai/prompt/${q}?width=1024&height=1024&nologo=true&enhance=true`
  const res = await fetch(url, {
    headers: { Accept: 'image/*' },
    signal: AbortSignal.timeout(90_000),
  })
  if (!res.ok) throw new Error(`이미지 생성 응답 오류 (${res.status})`)
  const ct = res.headers.get('content-type') || 'image/png'
  if (!ct.startsWith('image/')) throw new Error('생성 결과가 이미지가 아닙니다')
  const buf = Buffer.from(await res.arrayBuffer())
  if (buf.length > MAX_FETCH_BYTES) throw new Error('생성 이미지가 너무 큽니다')
  if (buf.length < 500) throw new Error('생성 이미지가 비어 있습니다')
  return { buffer: buf, contentType: ct.split(';')[0].trim() || 'image/png' }
}

/**
 * Replicate — `REPLICATE_API_TOKEN` + 선택 `REPLICATE_IMAGE_MODEL` (기본 flux-schnell)
 * @see https://replicate.com/black-forest-labs/flux-schnell
 */
async function fetchReplicateImageBuffer(prompt: string): Promise<{ buffer: Buffer; contentType: string }> {
  const token = process.env.REPLICATE_API_TOKEN?.trim()
  if (!token) throw new Error('REPLICATE_API_TOKEN 없음')

  const model = (process.env.REPLICATE_IMAGE_MODEL || 'black-forest-labs/flux-schnell').trim()
  if (!model.includes('/')) {
    throw new Error('REPLICATE_IMAGE_MODEL은 owner/name 형식이어야 합니다 (예: black-forest-labs/flux-schnell)')
  }

  const createUrl = `https://api.replicate.com/v1/models/${model}/predictions`
  const inputBody: Record<string, unknown> = {
    prompt: truncatePrompt(prompt),
    aspect_ratio: '1:1',
    output_format: 'webp',
    output_quality: 90,
    go_fast: true,
  }

  let createRes = await fetch(createUrl, {
    method: 'POST',
    headers: {
      Authorization: `Token ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ input: inputBody }),
  })

  if (createRes.status === 422) {
    createRes = await fetch(createUrl, {
      method: 'POST',
      headers: {
        Authorization: `Token ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ input: { prompt: truncatePrompt(prompt) } }),
    })
  }

  if (!createRes.ok) {
    const errText = await createRes.text()
    throw new Error(`Replicate 요청 실패 (${createRes.status}): ${errText.slice(0, 240)}`)
  }

  let pred = (await createRes.json()) as {
    urls?: { get?: string }
    status?: string
    output?: string | string[]
    error?: string
  }
  const getUrl = pred.urls?.get
  if (!getUrl) throw new Error('Replicate 응답에 polling URL이 없습니다')

  const pollMaxMs = Number(process.env.REPLICATE_POLL_MAX_MS) || 120_000
  const deadline = Date.now() + pollMaxMs

  while (Date.now() < deadline) {
    const pollRes = await fetch(getUrl, {
      headers: { Authorization: `Token ${token}` },
    })
    pred = (await pollRes.json()) as typeof pred

    if (pred.status === 'succeeded') {
      const out = pred.output
      const imageUrl = Array.isArray(out) ? out[0] : out
      if (typeof imageUrl !== 'string' || !imageUrl.startsWith('http')) {
        throw new Error('Replicate 출력이 이미지 URL이 아닙니다')
      }
      const imgRes = await fetch(imageUrl, { signal: AbortSignal.timeout(60_000) })
      if (!imgRes.ok) throw new Error(`생성 이미지 다운로드 실패 (${imgRes.status})`)
      const ct = imgRes.headers.get('content-type') || 'image/webp'
      const buf = Buffer.from(await imgRes.arrayBuffer())
      if (buf.length > MAX_FETCH_BYTES) throw new Error('생성 이미지가 너무 큽니다')
      if (buf.length < 500) throw new Error('생성 이미지가 비어 있습니다')
      return { buffer: buf, contentType: ct.split(';')[0].trim() || 'image/webp' }
    }

    if (pred.status === 'failed' || pred.status === 'canceled') {
      throw new Error(pred.error || `Replicate: ${pred.status}`)
    }

    await sleep(1500)
  }

  throw new Error('Replicate 이미지 생성 시간 초과')
}

/**
 * `REPLICATE_API_TOKEN` 이 있으면 Replicate 우선, 실패 시 Pollinations.
 * Pollinations만 쓰려면 토큰을 비우면 됩니다.
 */
export async function fetchGeneratedImageBuffer(prompt: string): Promise<{ buffer: Buffer; contentType: string }> {
  if (process.env.REPLICATE_API_TOKEN?.trim()) {
    try {
      return await fetchReplicateImageBuffer(prompt)
    } catch (e) {
      if (process.env.REPLICATE_NO_FALLBACK === '1') {
        throw e instanceof Error ? e : new Error(String(e))
      }
      console.warn('[chatImage] Replicate failed, falling back to Pollinations:', e)
    }
  }
  return fetchPollinationsImageBuffer(prompt)
}

function isBlockedUrl(u: URL): boolean {
  const h = u.hostname.toLowerCase()
  if (h === 'localhost' || h.endsWith('.local')) return true
  if (h === '0.0.0.0') return true
  const m = h.match(/^(\d+)\.(\d+)\.(\d+)\.(\d+)$/)
  if (m) {
    const a = Number(m[1]), b = Number(m[2]), c = Number(m[3]), d = Number(m[4])
    if (a === 10) return true
    if (a === 127) return true
    if (a === 192 && b === 168) return true
    if (a === 172 && b >= 16 && b <= 31) return true
    if (a === 169 && b === 254) return true
    if (a === 0) return true
  }
  return false
}

export async function fetchUrlImageBuffer(sourceUrl: string): Promise<{ buffer: Buffer; contentType: string }> {
  let u: URL
  try {
    u = new URL(sourceUrl)
  } catch {
    throw new Error('잘못된 이미지 주소입니다')
  }
  if (u.protocol !== 'https:') throw new Error('https 이미지 URL만 사용할 수 있습니다')
  if (isBlockedUrl(u)) throw new Error('허용되지 않는 주소입니다')

  const res = await fetch(u.toString(), {
    redirect: 'follow',
    headers: { Accept: 'image/*' },
    signal: AbortSignal.timeout(30_000),
  })
  if (!res.ok) throw new Error(`이미지를 가져오지 못했습니다 (${res.status})`)
  const ct = res.headers.get('content-type') || ''
  if (!ct.startsWith('image/')) throw new Error('URL이 이미지가 아닙니다')
  const buf = Buffer.from(await res.arrayBuffer())
  if (buf.length > MAX_FETCH_BYTES) throw new Error('이미지가 너무 큽니다 (최대 12MB)')
  if (buf.length < 100) throw new Error('이미지 데이터가 너무 작습니다')
  return { buffer: buf, contentType: ct.split(';')[0].trim() }
}

export async function uploadOrderImage(
  admin: SupabaseClient,
  userId: string,
  orderId: string,
  slot: number,
  buffer: Buffer,
  contentType: string
): Promise<string> {
  const ext =
    contentType.includes('jpeg') || contentType.includes('jpg') ? 'jpg'
    : contentType.includes('webp') ? 'webp'
    : contentType.includes('gif') ? 'gif'
    : 'png'
  const path = `${userId}/${orderId}/ai-${Date.now()}-s${slot}.${ext}`
  const { error } = await admin.storage.from('product-images').upload(path, buffer, {
    contentType,
    upsert: true,
  })
  if (error) throw new Error(`스토리지 업로드 실패: ${error.message}`)
  const { data } = admin.storage.from('product-images').getPublicUrl(path)
  return data.publicUrl
}

/** image_actions 순서대로 적용 후 최종 image_urls */
export async function applyImageActions(
  admin: SupabaseClient,
  userId: string,
  orderId: string,
  currentUrls: string[],
  actions: ImageAction[]
): Promise<{ image_urls: string[]; errors: string[] }> {
  const errors: string[] = []
  let urls = [...(currentUrls || [])]
  const limited = actions.slice(0, 3)

  for (const act of limited) {
    try {
      const { buffer, contentType } =
        act.mode === 'fetch_url'
          ? await fetchUrlImageBuffer((act.source_url ?? '').trim())
          : await fetchGeneratedImageBuffer((act.prompt ?? '').trim())

      if (act.action === 'replace') {
        const slot = typeof act.slot === 'number' ? act.slot : 0
        if (slot < 0 || slot >= MAX_IMAGES) throw new Error('슬롯은 0~2만 가능합니다')
        const publicUrl = await uploadOrderImage(admin, userId, orderId, slot, buffer, contentType)
        if (slot < urls.length) {
          urls = urls.map((u, i) => (i === slot ? publicUrl : u))
        } else if (slot === urls.length && urls.length < MAX_IMAGES) {
          urls = [...urls, publicUrl]
        } else {
          throw new Error(`슬롯 ${slot + 1}번에는 아직 이미지가 없습니다. 먼저 추가하거나 기존 칸을 지정하세요.`)
        }
      } else {
        if (urls.length >= MAX_IMAGES) throw new Error('이미지는 최대 3장까지입니다')
        const slot = urls.length
        const publicUrl = await uploadOrderImage(admin, userId, orderId, slot, buffer, contentType)
        urls = [...urls, publicUrl]
      }
    } catch (e) {
      errors.push(e instanceof Error ? e.message : String(e))
    }
  }

  return { image_urls: urls, errors }
}
