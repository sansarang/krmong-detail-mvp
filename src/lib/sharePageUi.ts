import type { UiLang } from '@/lib/uiLocale'

export type SharePageUi = {
  readonlyBadge: string
  invalidTitle: string
  invalidBody: string
  feedbackTitle: string
  feedbackBody: string
  pageTitle: (product: string) => string
}

export const SHARE_PAGE_UI: Record<UiLang, SharePageUi> = {
  ko: {
    readonlyBadge: '읽기 전용 미리보기',
    invalidTitle: '링크를 열 수 없습니다',
    invalidBody: '만료되었거나 잘못된 공유 링크입니다. 담당자에게 새 링크를 요청해 주세요.',
    feedbackTitle: '팀 피드백',
    feedbackBody:
      '이 페이지는 편집할 수 없습니다. 수정 의견은 슬랙·메일 등으로 담당자에게 전달해 주세요. (코멘트 저장 기능은 추후 연동 예정입니다.)',
    pageTitle: (product) => `공유: ${product}`,
  },
  en: {
    readonlyBadge: 'Read-only preview',
    invalidTitle: 'Link unavailable',
    invalidBody: 'This share link is invalid or expired. Ask the owner for a new link.',
    feedbackTitle: 'Team feedback',
    feedbackBody:
      'You cannot edit this page. Send notes to the owner via Slack, email, etc. Inline comments are planned for a later release.',
    pageTitle: (product) => `Shared: ${product}`,
  },
  ja: {
    readonlyBadge: '読み取り専用プレビュー',
    invalidTitle: 'リンクを開けません',
    invalidBody: '共有リンクの期限切れか無効です。担当者に新しいリンクを依頼してください。',
    feedbackTitle: 'チームからのフィードバック',
    feedbackBody:
      'このページは編集できません。Slack・メールなどで担当者にご連絡ください。（コメント保存は今後対応予定です。）',
    pageTitle: (product) => `共有: ${product}`,
  },
  zh: {
    readonlyBadge: '只读预览',
    invalidTitle: '无法打开链接',
    invalidBody: '分享链接无效或已过期，请联系负责人获取新链接。',
    feedbackTitle: '团队反馈',
    feedbackBody:
      '此页面不可编辑。请通过企业微信、邮件等把意见发给负责人。（后续将支持留言存档。）',
    pageTitle: (product) => `分享：${product}`,
  },
}
