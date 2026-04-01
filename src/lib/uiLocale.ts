export type UiLang = 'ko' | 'en' | 'ja' | 'zh'

const STORAGE_KEY = 'pageai-ui-lang'
export const LANG_COOKIE = 'pageai-lang'

export function persistUiLang(lang: UiLang) {
  try {
    localStorage.setItem(STORAGE_KEY, lang)
    // 서버에서도 읽을 수 있도록 쿠키에도 저장
    document.cookie = `${LANG_COOKIE}=${lang};path=/;max-age=31536000;SameSite=Lax`
  } catch {
    /* ignore */
  }
}

export function readStoredUiLang(): UiLang | null {
  try {
    const s = localStorage.getItem(STORAGE_KEY)
    if (s === 'ko' || s === 'en' || s === 'ja' || s === 'zh') return s
  } catch {
    /* ignore */
  }
  return null
}

/** 로그인 URL (랜딩 언어와 맞춤) */
export function loginPathForLang(lang: UiLang): string {
  if (lang === 'ko') return '/login'
  return `/${lang}/login`
}
