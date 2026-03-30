'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import Logo from '@/components/Logo'
import { readStoredUiLang, persistUiLang, loginPathForLang, type UiLang } from '@/lib/uiLocale'

// ── 카테고리 그룹 (언어별) ──────────────────────────────────────
const CAT_GROUPS: Record<UiLang, { group: string; items: { value: string; label: string }[] }[]> = {
  ko: [
    { group: '📦 제품·쇼핑몰', items: [
      { value: 'food', label: '식품/음료' }, { value: 'beauty', label: '뷰티/화장품' },
      { value: 'living', label: '생활용품' }, { value: 'fashion', label: '패션/의류' },
      { value: 'electronics', label: '전자제품' }, { value: 'health', label: '건강기능식품' },
      { value: 'pet', label: '반려동물' }, { value: 'sports', label: '스포츠/레저' },
      { value: 'baby', label: '육아/아동' },
    ]},
    { group: '🚗 자동차·모빌리티', items: [
      { value: 'used_car', label: '중고차 판매' }, { value: 'new_car', label: '신차/리스' },
      { value: 'car_service', label: '자동차 시공 (썬팅/랩핑/블박)' }, { value: 'car_repair', label: '자동차 정비/수리' },
    ]},
    { group: '🏠 인테리어·시공', items: [
      { value: 'interior', label: '인테리어 시공' }, { value: 'window', label: '창호/도어' },
      { value: 'cleaning', label: '청소/방역' }, { value: 'moving', label: '이사/운반' },
      { value: 'construction', label: '건설/리모델링' },
    ]},
    { group: '🍽️ 음식·F&B', items: [
      { value: 'restaurant', label: '음식점/식당' }, { value: 'cafe', label: '카페/디저트' },
      { value: 'delivery', label: '배달 전문점' }, { value: 'franchise', label: '프랜차이즈' },
    ]},
    { group: '📚 교육·서비스', items: [
      { value: 'academy', label: '학원/교습소' }, { value: 'coaching', label: '코칭/컨설팅' },
      { value: 'medical', label: '병원/의원/한의원' }, { value: 'beauty_shop', label: '미용실/네일/피부관리' },
      { value: 'fitness', label: '헬스장/요가/필라테스' },
    ]},
    { group: '🏢 부동산·금융', items: [
      { value: 'realestate', label: '부동산 매물' }, { value: 'pension', label: '펜션/숙박' },
      { value: 'travel', label: '여행 상품' }, { value: 'insurance', label: '보험/금융' },
    ]},
    { group: '💻 IT·디지털', items: [
      { value: 'saas', label: 'SaaS/앱/소프트웨어' }, { value: 'it_service', label: 'IT 개발·외주' },
      { value: 'design', label: '디자인/마케팅 대행' },
    ]},
    { group: '📋 공공기관·관공서', items: [
      { value: 'press_release', label: '보도자료' }, { value: 'policy_pr', label: '정책 홍보문' },
      { value: 'public_notice', label: '공고문/공지사항' }, { value: 'project_intro', label: '사업 안내문' },
    ]},
    { group: '🏛️ 정부과제·R&D', items: [
      { value: 'gov_proposal', label: '사업계획서' }, { value: 'research_proposal', label: '연구 제안서' },
      { value: 'performance_report', label: '성과보고서' }, { value: 'tech_intro', label: '기술이전 소개서' },
    ]},
    { group: '📄 논문·학술', items: [
      { value: 'paper_summary', label: '논문 요약/소개' }, { value: 'research_intro', label: '연구 발표자료' },
      { value: 'patent_intro', label: '특허 소개문' }, { value: 'academic_report', label: '학술 보고서' },
    ]},
    { group: '📝 기획·IR·PR', items: [
      { value: 'business_proposal', label: '사업제안서' }, { value: 'company_intro', label: '회사 소개서' },
      { value: 'ir_pitch', label: 'IR 피칭 문서' }, { value: 'pr_article', label: '보도자료/PR' },
    ]},
    { group: '기타', items: [{ value: 'other', label: '기타 (직접 설명)' }] },
  ],
  en: [
    { group: '📦 Products & E-commerce', items: [
      { value: 'food', label: 'Food & Beverage' }, { value: 'beauty', label: 'Beauty & Skincare' },
      { value: 'living', label: 'Home & Living' }, { value: 'fashion', label: 'Fashion & Apparel' },
      { value: 'electronics', label: 'Electronics' }, { value: 'health', label: 'Health Supplements' },
      { value: 'pet', label: 'Pet Products' }, { value: 'sports', label: 'Sports & Outdoor' },
      { value: 'baby', label: 'Baby & Kids' },
    ]},
    { group: '🚗 Automotive', items: [
      { value: 'used_car', label: 'Used Car Sales' }, { value: 'new_car', label: 'New Car / Lease' },
      { value: 'car_service', label: 'Car Customization' }, { value: 'car_repair', label: 'Car Repair & Service' },
    ]},
    { group: '🏠 Interior & Construction', items: [
      { value: 'interior', label: 'Interior Design' }, { value: 'window', label: 'Windows & Doors' },
      { value: 'cleaning', label: 'Cleaning & Pest Control' }, { value: 'moving', label: 'Moving & Delivery' },
      { value: 'construction', label: 'Construction & Renovation' },
    ]},
    { group: '🍽️ Food & F&B', items: [
      { value: 'restaurant', label: 'Restaurant' }, { value: 'cafe', label: 'Café & Dessert' },
      { value: 'delivery', label: 'Delivery Kitchen' }, { value: 'franchise', label: 'Franchise' },
    ]},
    { group: '📚 Education & Services', items: [
      { value: 'academy', label: 'Academy / Tutoring' }, { value: 'coaching', label: 'Coaching / Consulting' },
      { value: 'medical', label: 'Hospital / Clinic' }, { value: 'beauty_shop', label: 'Beauty Salon' },
      { value: 'fitness', label: 'Gym / Yoga / Pilates' },
    ]},
    { group: '🏢 Real Estate & Finance', items: [
      { value: 'realestate', label: 'Real Estate Listing' }, { value: 'pension', label: 'Accommodation / B&B' },
      { value: 'travel', label: 'Travel Package' }, { value: 'insurance', label: 'Insurance / Finance' },
    ]},
    { group: '💻 IT & Digital', items: [
      { value: 'saas', label: 'SaaS / App / Software' }, { value: 'it_service', label: 'IT Development' },
      { value: 'design', label: 'Design / Marketing Agency' },
    ]},
    { group: '📋 Public Institution', items: [
      { value: 'press_release', label: 'Press Release' }, { value: 'policy_pr', label: 'Policy PR Document' },
      { value: 'public_notice', label: 'Public Notice' }, { value: 'project_intro', label: 'Project Introduction' },
    ]},
    { group: '🏛️ Government Project / R&D', items: [
      { value: 'gov_proposal', label: 'Business Plan' }, { value: 'research_proposal', label: 'Research Proposal' },
      { value: 'performance_report', label: 'Performance Report' }, { value: 'tech_intro', label: 'Technology Transfer Doc' },
    ]},
    { group: '📄 Academic', items: [
      { value: 'paper_summary', label: 'Paper Summary' }, { value: 'research_intro', label: 'Research Presentation' },
      { value: 'patent_intro', label: 'Patent Introduction' }, { value: 'academic_report', label: 'Academic Report' },
    ]},
    { group: '📝 Business & PR', items: [
      { value: 'business_proposal', label: 'Business Proposal' }, { value: 'company_intro', label: 'Company Profile' },
      { value: 'ir_pitch', label: 'IR Pitch Deck' }, { value: 'pr_article', label: 'PR Article' },
    ]},
    { group: 'Other', items: [{ value: 'other', label: 'Other (describe below)' }] },
  ],
  ja: [
    { group: '📦 商品・EC', items: [
      { value: 'food', label: '食品・飲料' }, { value: 'beauty', label: 'ビューティー・化粧品' },
      { value: 'living', label: '生活雑貨' }, { value: 'fashion', label: 'ファッション・衣類' },
      { value: 'electronics', label: '電子機器' }, { value: 'health', label: '健康食品・サプリ' },
      { value: 'pet', label: 'ペット用品' }, { value: 'sports', label: 'スポーツ・アウトドア' },
      { value: 'baby', label: 'ベビー・キッズ' },
    ]},
    { group: '🚗 自動車・モビリティ', items: [
      { value: 'used_car', label: '中古車販売' }, { value: 'new_car', label: '新車・リース' },
      { value: 'car_service', label: 'カスタマイズ・施工' }, { value: 'car_repair', label: '整備・修理' },
    ]},
    { group: '🏠 インテリア・施工', items: [
      { value: 'interior', label: 'インテリア施工' }, { value: 'window', label: '窓・ドア' },
      { value: 'cleaning', label: '清掃・害虫駆除' }, { value: 'moving', label: '引越し・運搬' },
      { value: 'construction', label: '建設・リノベーション' },
    ]},
    { group: '🍽️ 飲食・F&B', items: [
      { value: 'restaurant', label: '飲食店・レストラン' }, { value: 'cafe', label: 'カフェ・スイーツ' },
      { value: 'delivery', label: 'デリバリー専門' }, { value: 'franchise', label: 'フランチャイズ' },
    ]},
    { group: '📚 教育・サービス', items: [
      { value: 'academy', label: '塾・教室' }, { value: 'coaching', label: 'コーチング・コンサル' },
      { value: 'medical', label: '病院・クリニック' }, { value: 'beauty_shop', label: '美容室・ネイル・エステ' },
      { value: 'fitness', label: 'ジム・ヨガ・ピラティス' },
    ]},
    { group: '🏢 不動産・金融', items: [
      { value: 'realestate', label: '不動産物件' }, { value: 'pension', label: '宿泊・民泊' },
      { value: 'travel', label: '旅行商品' }, { value: 'insurance', label: '保険・金融' },
    ]},
    { group: '💻 IT・デジタル', items: [
      { value: 'saas', label: 'SaaS・アプリ・ソフトウェア' }, { value: 'it_service', label: 'IT開発・外注' },
      { value: 'design', label: 'デザイン・マーケティング代行' },
    ]},
    { group: '📋 公共機関・官公庁', items: [
      { value: 'press_release', label: 'プレスリリース' }, { value: 'policy_pr', label: '政策広報文' },
      { value: 'public_notice', label: '公告・お知らせ' }, { value: 'project_intro', label: '事業案内' },
    ]},
    { group: '🏛️ 政府プロジェクト・R&D', items: [
      { value: 'gov_proposal', label: '事業計画書' }, { value: 'research_proposal', label: '研究提案書' },
      { value: 'performance_report', label: '成果報告書' }, { value: 'tech_intro', label: '技術移転紹介書' },
    ]},
    { group: '📄 論文・学術', items: [
      { value: 'paper_summary', label: '論文要約・紹介' }, { value: 'research_intro', label: '研究発表資料' },
      { value: 'patent_intro', label: '特許紹介文' }, { value: 'academic_report', label: '学術報告書' },
    ]},
    { group: '📝 企画・IR・PR', items: [
      { value: 'business_proposal', label: '事業提案書' }, { value: 'company_intro', label: '会社紹介書' },
      { value: 'ir_pitch', label: 'IRピッチ資料' }, { value: 'pr_article', label: 'プレスリリース・PR' },
    ]},
    { group: 'その他', items: [{ value: 'other', label: 'その他（自由入力）' }] },
  ],
  zh: [
    { group: '📦 商品·电商', items: [
      { value: 'food', label: '食品/饮料' }, { value: 'beauty', label: '美妆/护肤' },
      { value: 'living', label: '家居生活' }, { value: 'fashion', label: '时尚/服装' },
      { value: 'electronics', label: '电子产品' }, { value: 'health', label: '健康食品/保健品' },
      { value: 'pet', label: '宠物用品' }, { value: 'sports', label: '运动/户外' },
      { value: 'baby', label: '母婴/儿童' },
    ]},
    { group: '🚗 汽车·出行', items: [
      { value: 'used_car', label: '二手车销售' }, { value: 'new_car', label: '新车/租赁' },
      { value: 'car_service', label: '汽车改装/贴膜' }, { value: 'car_repair', label: '汽车维修/保养' },
    ]},
    { group: '🏠 室内装修·施工', items: [
      { value: 'interior', label: '室内装修' }, { value: 'window', label: '门窗' },
      { value: 'cleaning', label: '清洁/消毒' }, { value: 'moving', label: '搬家/物流' },
      { value: 'construction', label: '建筑/翻新' },
    ]},
    { group: '🍽️ 餐饮·F&B', items: [
      { value: 'restaurant', label: '餐厅/饭馆' }, { value: 'cafe', label: '咖啡/甜品' },
      { value: 'delivery', label: '外卖专营' }, { value: 'franchise', label: '连锁加盟' },
    ]},
    { group: '📚 教育·服务', items: [
      { value: 'academy', label: '培训机构/补习班' }, { value: 'coaching', label: '辅导/咨询' },
      { value: 'medical', label: '医院/诊所' }, { value: 'beauty_shop', label: '美发/美甲/美容院' },
      { value: 'fitness', label: '健身房/瑜伽/普拉提' },
    ]},
    { group: '🏢 房产·金融', items: [
      { value: 'realestate', label: '房产信息' }, { value: 'pension', label: '民宿/住宿' },
      { value: 'travel', label: '旅游产品' }, { value: 'insurance', label: '保险/金融' },
    ]},
    { group: '💻 IT·数字', items: [
      { value: 'saas', label: 'SaaS/应用/软件' }, { value: 'it_service', label: 'IT开发/外包' },
      { value: 'design', label: '设计/营销代理' },
    ]},
    { group: '📋 政府·公共机构', items: [
      { value: 'press_release', label: '新闻稿' }, { value: 'policy_pr', label: '政策宣传文' },
      { value: 'public_notice', label: '公告/通知' }, { value: 'project_intro', label: '项目介绍' },
    ]},
    { group: '🏛️ 政府项目·R&D', items: [
      { value: 'gov_proposal', label: '商业计划书' }, { value: 'research_proposal', label: '研究提案书' },
      { value: 'performance_report', label: '成果报告书' }, { value: 'tech_intro', label: '技术转让说明书' },
    ]},
    { group: '📄 论文·学术', items: [
      { value: 'paper_summary', label: '论文摘要/介绍' }, { value: 'research_intro', label: '研究发表资料' },
      { value: 'patent_intro', label: '专利介绍文' }, { value: 'academic_report', label: '学术报告' },
    ]},
    { group: '📝 商业·IR·PR', items: [
      { value: 'business_proposal', label: '商业提案书' }, { value: 'company_intro', label: '公司介绍书' },
      { value: 'ir_pitch', label: 'IR路演资料' }, { value: 'pr_article', label: '新闻稿/PR' },
    ]},
    { group: '其他', items: [{ value: 'other', label: '其他（自由填写）' }] },
  ],
}

const DOC_CATS = [
  'press_release','policy_pr','public_notice','project_intro',
  'gov_proposal','research_proposal','performance_report','tech_intro',
  'paper_summary','research_intro','patent_intro','academic_report',
  'business_proposal','company_intro','ir_pitch','pr_article',
]

const LANGUAGES = [
  { value: 'ko', label: '🇰🇷 한국어' },
  { value: 'en', label: '🇺🇸 English' },
  { value: 'ja', label: '🇯🇵 日本語' },
  { value: 'zh', label: '🇨🇳 中文' },
]

// ── UI 텍스트 (언어별) ─────────────────────────────────────────
const UI: Record<UiLang, {
  newDoc: string; backDash: string;
  productTitle: string; productSub: string;
  docTitle: string; docSub: string;
  usageLabel: string; usageUnit: string; remaining: string; exceeded: string;
  nameLabel: string; namePlaceholder: string;
  docNameLabel: string; docNamePlaceholder: string;
  catLabel: string; catPlaceholder: string;
  screenLangLabel: string; screenLangSub: string;
  langLabel: string; langSub: string;
  descLabel: string; descPlaceholder: string;
  docDescLabel: string; docDescPlaceholder: string;
  attachLabel: string; attachSub: string;
  fileBtn: string; fileReset: string; fileAdded: string;
  docPastePlaceholder: string;
  photoLabel: string; photoSub: string; imgRef: string;
  photoClick: string; photoHint: string; addMore: string;
  generateBtn: string; docBtn: string; generating: string;
  upgradeTitle: string; upgradeSub: string; upgradeUnit: string;
  upgradeFeatures: string[]; upgradeBtn: string; upgradeLater: string;
  upgradePrice: string;
  errRequired: string; errImage: string;
  toastGenerating: string; toastDone: string; toastFile: string; toastFilePaste: string;
  upgradeOver: string;
  // 양식 모드
  templateToggleLabel: string; templateToggleSub: string;
  templateFormLabel: string; templateFormSub: string;
  templateFormPlaceholder: string;
  templateInfoLabel: string; templateInfoPlaceholder: string;
  templateBtn: string; templateFileAdded: string;
  errTemplateRequired: string;
}> = {
  ko: {
    newDoc: '새 문서 생성', backDash: '← 대시보드',
    productTitle: '제품 정보 입력', productSub: '정보를 입력하면 AI가 전환율 높은 상세페이지를 만들어드려요',
    docTitle: '문서 정보 입력', docSub: '내용을 입력하면 AI가 전문적인 문서 초안을 만들어드려요',
    usageLabel: '이번 달 사용량', usageUnit: '회 사용', remaining: '회 남음', exceeded: '한도 초과',
    nameLabel: '제품/서비스명', namePlaceholder: '예: 제주 유기농 녹차 추출 세럼',
    docNameLabel: '문서/프로젝트 제목', docNamePlaceholder: '예: 2025년 스마트시티 R&D 사업 제안서',
    catLabel: '카테고리', catPlaceholder: '카테고리를 선택해주세요',
    screenLangLabel: '화면 언어', screenLangSub: '폼·안내 문구 (일본어로 들어와도 여기서 바꿀 수 있어요)',
    langLabel: '출력 언어', langSub: 'AI가 이 언어로 작성합니다',
    descLabel: '제품/서비스 설명', descPlaceholder: '주요 특징, 효능, 성분, 타겟 고객을 자세히 입력해주세요.',
    docDescLabel: '핵심 내용 요약', docDescPlaceholder: '문서의 핵심 내용, 목적, 대상, 주요 성과를 입력하세요.',
    attachLabel: '문서 첨부', attachSub: '선택 · TXT/MD 자동 추출, PDF/HWP는 내용 붙여넣기',
    fileBtn: '📎 파일 선택', fileReset: '× 초기화', fileAdded: '자 문서 내용 추가됨 — AI가 참고하여 작성합니다',
    docPastePlaceholder: '또는 PDF/HWP/DOCX 내용을 여기에 직접 붙여넣기 하세요...',
    photoLabel: '제품 사진', photoSub: '최대 3장, 선택', imgRef: '참고 이미지',
    photoClick: '클릭해서 사진 업로드', photoHint: 'PNG, JPG, WEBP · 최대 3장', addMore: '추가',
    generateBtn: '상세페이지 생성 시작 →', docBtn: '문서 초안 생성 →', generating: 'AI가 생성 중입니다...',
    upgradeTitle: '무료 한도에 도달했어요', upgradeSub: '이번 달 무료 생성', upgradeUnit: '회를 모두 사용했습니다.\n프로 플랜으로 업그레이드하면 무제한으로 생성할 수 있어요.',
    upgradePrice: '₩29,000',
    upgradeFeatures: ['무제한 상세페이지 생성', '우선순위 AI 처리', 'A/B 버전 자동 생성'],
    upgradeBtn: '프로 플랜 시작하기 →', upgradeLater: '다음 달까지 기다리기',
    errRequired: '모든 항목을 입력해주세요', errImage: '이미지는 최대 3장까지',
    toastGenerating: 'AI가 문서를 생성 중입니다...', toastDone: '완성됐습니다!',
    toastFile: '파일 내용을 불러왔습니다', toastFilePaste: 'PDF/HWP/DOCX는 파일을 열어 내용을 복사 후 아래에 붙여넣기 해주세요',
    upgradeOver: '무료 한도 초과 · ',
    templateToggleLabel: '📋 양식 자동 작성 모드',
    templateToggleSub: '채워야 할 양식·과제를 첨부하면 AI가 빈칸을 채워드립니다',
    templateFormLabel: '양식 내용 (필수)',
    templateFormSub: '파일 선택(TXT/MD) 또는 직접 붙여넣기',
    templateFormPlaceholder: '채워야 할 양식·과제의 내용을 여기에 붙여넣기 하세요.\n(예: 사업계획서 양식, 과제 요구사항, 신청서 양식 등)',
    templateInfoLabel: '작성에 참고할 내용 (선택)',
    templateInfoPlaceholder: '어떤 내용으로 채울지 알려주세요.\n(예: 회사 소개, 제품 특징, 연구 내용 등)',
    templateBtn: '양식 자동 완성 →',
    templateFileAdded: '자 양식 내용 추가됨',
    errTemplateRequired: '채워야 할 양식 내용을 입력해주세요',
  },
  en: {
    newDoc: 'New Document', backDash: '← Dashboard',
    productTitle: 'Enter Product Info', productSub: 'Fill in the details and AI will generate a high-converting product page.',
    docTitle: 'Enter Document Info', docSub: 'Fill in the details and AI will generate a professional document draft.',
    usageLabel: 'Monthly Usage', usageUnit: ' used', remaining: ' remaining', exceeded: 'Limit reached',
    nameLabel: 'Product / Service Name', namePlaceholder: 'e.g. Organic Hyaluronic Acid Serum 50ml',
    docNameLabel: 'Document / Project Title', docNamePlaceholder: 'e.g. 2025 Smart City R&D Proposal',
    catLabel: 'Category', catPlaceholder: 'Select a category',
    screenLangLabel: 'Screen language', screenLangSub: 'Form labels (change anytime, independent of AI output)',
    langLabel: 'Output Language', langSub: 'AI will write in this language',
    descLabel: 'Product / Service Description', descPlaceholder: 'Describe key features, benefits, ingredients, and target customers. The more detail, the better the result.',
    docDescLabel: 'Key Content Summary', docDescPlaceholder: 'Describe the purpose, audience, key outcomes, or paste the document content here.',
    attachLabel: 'Attach Document', attachSub: 'Optional · TXT/MD auto-extracted, PDF/DOCX paste content below',
    fileBtn: '📎 Choose File', fileReset: '× Clear', fileAdded: ' chars added — AI will use this as reference',
    docPastePlaceholder: 'Or paste your PDF/DOCX content here...',
    photoLabel: 'Product Photos', photoSub: 'Up to 3, optional', imgRef: 'Reference Images',
    photoClick: 'Click to upload photos', photoHint: 'PNG, JPG, WEBP · Up to 3', addMore: 'Add',
    generateBtn: 'Generate Product Page →', docBtn: 'Generate Document Draft →', generating: 'AI is generating...',
    upgradeTitle: "You've reached the free limit", upgradeSub: 'You have used all', upgradeUnit: ' free generations this month.\nUpgrade to Pro for unlimited access.',
    upgradePrice: '$21',
    upgradeFeatures: ['Unlimited generations', 'Priority AI processing', 'A/B version auto-generate'],
    upgradeBtn: 'Start Pro Plan →', upgradeLater: 'Wait until next month',
    errRequired: 'Please fill in all fields', errImage: 'Maximum 3 images allowed',
    toastGenerating: 'AI is generating your document...', toastDone: 'Done!',
    toastFile: 'File content loaded', toastFilePaste: 'Please open your PDF/DOCX, copy the content, and paste it below.',
    upgradeOver: 'Free limit reached · ',
    templateToggleLabel: '📋 Template Auto-Fill Mode',
    templateToggleSub: 'Attach a form or assignment and AI will fill in all the blanks',
    templateFormLabel: 'Template Content (required)',
    templateFormSub: 'Choose file (TXT/MD) or paste directly',
    templateFormPlaceholder: 'Paste the template or assignment content here.\n(e.g. business plan template, assignment rubric, application form)',
    templateInfoLabel: 'Reference Information (optional)',
    templateInfoPlaceholder: 'Tell AI what content to use for filling in.\n(e.g. company info, product details, research content)',
    templateBtn: 'Auto-Fill Template →',
    templateFileAdded: ' chars of template content added',
    errTemplateRequired: 'Please provide the template content to fill in',
  },
  ja: {
    newDoc: '新規ドキュメント作成', backDash: '← ダッシュボード',
    productTitle: '商品情報を入力', productSub: '情報を入力するとAIが転換率の高い商品ページを作成します。',
    docTitle: '文書情報を入力', docSub: '内容を入力するとAIが専門的な文書ドラフトを作成します。',
    usageLabel: '今月の使用量', usageUnit: '回使用', remaining: '回残り', exceeded: '上限超過',
    nameLabel: '商品・サービス名', namePlaceholder: '例：有機ヒアルロン酸セラム 50ml',
    docNameLabel: '文書・プロジェクトタイトル', docNamePlaceholder: '例：2025年スマートシティR&D事業提案書',
    catLabel: 'カテゴリ', catPlaceholder: 'カテゴリを選択してください',
    screenLangLabel: '画面の言語', screenLangSub: 'フォームの表示（出力言語とは別に変更できます）',
    langLabel: '出力言語', langSub: 'AIがこの言語で作成します',
    descLabel: '商品・サービスの説明', descPlaceholder: '主な特徴、効能、成分、ターゲット顧客を詳しく入力してください。',
    docDescLabel: 'コア内容の要約', docDescPlaceholder: '文書の目的、対象、主な成果などを入力してください。',
    attachLabel: '文書添付', attachSub: '任意 · TXT/MD自動抽出、PDF/Wordは内容を貼り付け',
    fileBtn: '📎 ファイル選択', fileReset: '× クリア', fileAdded: '文字の文書内容を追加 — AIが参照して作成します',
    docPastePlaceholder: 'またはPDF/Wordの内容をここに貼り付けてください...',
    photoLabel: '商品写真', photoSub: '最大3枚、任意', imgRef: '参考画像',
    photoClick: 'クリックして写真をアップロード', photoHint: 'PNG, JPG, WEBP · 最大3枚', addMore: '追加',
    generateBtn: '商品ページを生成 →', docBtn: '文書ドラフトを生成 →', generating: 'AIが生成中...',
    upgradeTitle: '無料制限に達しました', upgradeSub: '今月の無料生成', upgradeUnit: '回をすべて使い切りました。\nプロプランにアップグレードすると無制限でご利用いただけます。',
    upgradePrice: '¥2,980',
    upgradeFeatures: ['無制限生成', 'AI優先処理', 'A/Bバージョン自動生成'],
    upgradeBtn: 'プロプランを開始 →', upgradeLater: '来月まで待つ',
    errRequired: 'すべての項目を入力してください', errImage: '画像は最大3枚までです',
    toastGenerating: 'AIがドキュメントを生成中...', toastDone: '完成しました！',
    toastFile: 'ファイルの内容を読み込みました', toastFilePaste: 'PDF/Wordを開いて内容をコピーし、下に貼り付けてください。',
    upgradeOver: '無料制限超過 · ',
    templateToggleLabel: '📋 書式自動入力モード',
    templateToggleSub: '記入すべき書式・課題を添付すると、AIが空欄を埋めます',
    templateFormLabel: '書式内容（必須）',
    templateFormSub: 'ファイル選択（TXT/MD）または直接貼り付け',
    templateFormPlaceholder: '記入すべき書式・課題の内容をここに貼り付けてください。\n（例：事業計画書の書式、課題の要件、申請書の書式など）',
    templateInfoLabel: '参考情報（任意）',
    templateInfoPlaceholder: 'どんな内容で記入するかお知らせください。\n（例：会社概要、商品の特徴、研究内容など）',
    templateBtn: '書式を自動完成 →',
    templateFileAdded: '文字の書式内容を追加',
    errTemplateRequired: '記入すべき書式の内容を入力してください',
  },
  zh: {
    newDoc: '新建文档', backDash: '← 仪表盘',
    productTitle: '输入商品信息', productSub: '填写信息后，AI将为您生成高转化率的商品详情页。',
    docTitle: '输入文档信息', docSub: '填写内容后，AI将为您生成专业的文档草稿。',
    usageLabel: '本月使用量', usageUnit: '次已用', remaining: '次剩余', exceeded: '已超限',
    nameLabel: '商品/服务名称', namePlaceholder: '例：有机玻尿酸精华液 50ml',
    docNameLabel: '文档/项目标题', docNamePlaceholder: '例：2025年智慧城市R&D项目提案书',
    catLabel: '分类', catPlaceholder: '请选择分类',
    screenLangLabel: '界面语言', screenLangSub: '表单与提示文案（可与输出语言不同）',
    langLabel: '输出语言', langSub: 'AI将用此语言撰写',
    descLabel: '商品/服务描述', descPlaceholder: '请详细描述主要特点、功效、成分和目标客户。描述越详细，生成结果越好。',
    docDescLabel: '核心内容摘要', docDescPlaceholder: '请输入文档的目的、受众、主要成果，或直接粘贴文档内容。',
    attachLabel: '附件', attachSub: '可选 · TXT/MD自动提取，PDF/Word请粘贴内容',
    fileBtn: '📎 选择文件', fileReset: '× 清除', fileAdded: '字文档内容已添加 — AI将参考此内容撰写',
    docPastePlaceholder: '或将PDF/Word内容粘贴到此处...',
    photoLabel: '商品图片', photoSub: '最多3张，可选', imgRef: '参考图片',
    photoClick: '点击上传图片', photoHint: 'PNG, JPG, WEBP · 最多3张', addMore: '添加',
    generateBtn: '开始生成详情页 →', docBtn: '生成文档草稿 →', generating: 'AI生成中...',
    upgradeTitle: '已达到免费限额', upgradeSub: '您已使用本月全部', upgradeUnit: '次免费生成。\n升级到专业版即可无限次生成。',
    upgradePrice: '¥148',
    upgradeFeatures: ['无限次生成', 'AI优先处理', 'A/B版本自动生成'],
    upgradeBtn: '开始专业版 →', upgradeLater: '等到下个月',
    errRequired: '请填写所有字段', errImage: '最多可上传3张图片',
    toastGenerating: 'AI正在生成文档...', toastDone: '生成完成！',
    toastFile: '文件内容已加载', toastFilePaste: '请打开PDF/Word，复制内容后粘贴到下方。',
    upgradeOver: '已超免费限额 · ',
    templateToggleLabel: '📋 表格自动填写模式',
    templateToggleSub: '上传需要填写的表格或作业，AI将自动填写所有空白',
    templateFormLabel: '表格内容（必填）',
    templateFormSub: '选择文件（TXT/MD）或直接粘贴',
    templateFormPlaceholder: '请将需要填写的表格或作业内容粘贴到此处。\n（例：商业计划书模板、作业要求、申请表格等）',
    templateInfoLabel: '参考信息（可选）',
    templateInfoPlaceholder: '请告知AI用什么内容来填写。\n（例：公司简介、产品特点、研究内容等）',
    templateBtn: '自动完成表格 →',
    templateFileAdded: '字表格内容已添加',
    errTemplateRequired: '请提供需要填写的表格内容',
  },
}

const FREE_LIMIT = 5

export default function NewOrderPage() {
  const router   = useRouter()
  const supabase = createClient()
  const [loading, setLoading]               = useState(false)
  const [images, setImages]                 = useState<File[]>([])
  const [docText, setDocText]               = useState('')
  const [uiLang, setUiLang]                 = useState<UiLang>('ko')
  const [outputLang, setOutputLang]         = useState<string>('ko')
  const [form, setForm]                     = useState({ product_name: '', category: '', description: '' })
  const [monthlyUsed, setMonthlyUsed]       = useState(0)
  const [showUpgrade, setShowUpgrade]       = useState(false)
  const [templateMode, setTemplateMode]     = useState(false)
  const [templateContent, setTemplateContent] = useState('')
  const docInputRef     = useRef<HTMLInputElement>(null)
  const templateFileRef = useRef<HTMLInputElement>(null)

  // 저장된 UI 언어(랜딩에서 선택) 우선, 없으면 브라우저 언어
  useEffect(() => {
    const stored = readStoredUiLang()
    if (stored) {
      setUiLang(stored)
      setOutputLang(stored)
      return
    }
    const lang = navigator.language?.slice(0, 2) ?? 'ko'
    const supported: UiLang[] = ['ko', 'en', 'ja', 'zh']
    const detected = supported.includes(lang as UiLang) ? (lang as UiLang) : 'en'
    setUiLang(detected)
    setOutputLang(detected)
  }, [])

  // 이번 달 사용량 로드
  useEffect(() => {
    async function loadUsage() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
      const { count } = await supabase
        .from('orders')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('created_at', startOfMonth)
        .neq('status', 'error')
      setMonthlyUsed(count ?? 0)
    }
    loadUsage()
  }, [])

  const L = UI[uiLang]
  const CATEGORIES = CAT_GROUPS[uiLang]
  const isDocCat = DOC_CATS.includes(form.category)
  const remaining = Math.max(FREE_LIMIT - monthlyUsed, 0)
  const usagePct  = Math.min((monthlyUsed / FREE_LIMIT) * 100, 100)

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || [])
    if (files.length > 3) { toast.error(L.errImage); return }
    setImages(files)
  }

  function handleDocFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.type === 'text/plain' || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
      const reader = new FileReader()
      reader.onload = ev => setDocText(ev.target?.result as string)
      reader.readAsText(file)
      toast.success(L.toastFile)
    } else {
      toast.info(L.toastFilePaste)
    }
    if (docInputRef.current) docInputRef.current.value = ''
  }

  function handleTemplateFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.type === 'text/plain' || file.name.endsWith('.txt') || file.name.endsWith('.md') || file.name.endsWith('.csv')) {
      const reader = new FileReader()
      reader.onload = ev => setTemplateContent(ev.target?.result as string)
      reader.readAsText(file)
      toast.success(L.toastFile)
    } else {
      toast.info(L.toastFilePaste)
    }
    if (templateFileRef.current) templateFileRef.current.value = ''
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (templateMode) {
      if (!form.product_name || !form.category) { toast.error(L.errRequired); return }
      if (!templateContent.trim()) { toast.error(L.errTemplateRequired); return }
    } else {
      if (!form.product_name || !form.category || !form.description) {
        toast.error(L.errRequired); return
      }
    }
    if (monthlyUsed >= FREE_LIMIT) { setShowUpgrade(true); return }

    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        const lang = readStoredUiLang() ?? uiLang
        router.push(loginPathForLang(lang))
        return
      }

      const imageUrls: string[] = []
      for (const image of images) {
        const ext = image.name.split('.').pop()
        const path = `${user.id}/${Date.now()}.${ext}`
        const { error } = await supabase.storage.from('product-images').upload(path, image)
        if (error) throw error
        const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(path)
        imageUrls.push(publicUrl)
      }

      let combinedDesc: string
      if (templateMode) {
        combinedDesc = `${form.description ? form.description + '\n\n' : ''}[TEMPLATE_FORM]\n${templateContent.trim()}\n[/TEMPLATE_FORM]`
      } else if (docText.trim()) {
        combinedDesc = `${form.description}\n\n[첨부 문서 내용]\n${docText.trim()}`
      } else {
        combinedDesc = form.description
      }

      const { data: order, error } = await supabase
        .from('orders')
        .insert({ user_id: user.id, ...form, description: combinedDesc, image_urls: imageUrls, status: 'pending' })
        .select().single()
      if (error) throw error

      toast.success(L.toastGenerating)
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: order.id, outputLang }),
      })
      const data = await res.json()
      if (!res.ok) {
        if (data.error === 'LIMIT_EXCEEDED') { setShowUpgrade(true); return }
        throw new Error(data.message || 'Generation failed')
      }
      toast.success(L.toastDone)
      persistUiLang(outputLang as UiLang)
      router.push(`/order/${order.id}`)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-white">
      {/* 업그레이드 모달 */}
      {showUpgrade && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl">
            <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-5">🔒</div>
            <h2 className="text-2xl font-black text-black text-center tracking-tight mb-2">{L.upgradeTitle}</h2>
            <p className="text-gray-400 text-sm text-center leading-relaxed mb-6">
              {L.upgradeSub} <strong className="text-black">{FREE_LIMIT}</strong>{L.upgradeUnit.split('\n')[0]}<br />
              {L.upgradeUnit.split('\n')[1]}
            </p>
            <div className="bg-black rounded-2xl p-5 mb-4">
              <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Pro</p>
              <p className="text-3xl font-black text-white mb-1">{L.upgradePrice}<span className="text-gray-500 text-sm font-normal">/mo</span></p>
              <ul className="space-y-1.5 mt-3">
                {L.upgradeFeatures.map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-300">
                    <span className="w-4 h-4 bg-white/10 rounded-full flex items-center justify-center text-[9px] text-white font-black">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
            <Link href="/#pricing" className="w-full bg-black text-white py-4 rounded-2xl font-black text-sm text-center block hover:bg-gray-800 transition-all mb-3">
              {L.upgradeBtn}
            </Link>
            <button onClick={() => setShowUpgrade(false)} className="w-full text-gray-400 text-sm py-2 hover:text-black transition-colors">
              {L.upgradeLater}
            </button>
          </div>
        </div>
      )}

      <nav className="flex items-center justify-between px-8 py-5 border-b border-gray-100">
        <Link href="/" className="flex items-center gap-2"><Logo size={28} /></Link>
        <Link href="/dashboard" className="text-gray-400 text-sm hover:text-black transition-colors">{L.backDash}</Link>
      </nav>

      <div className="max-w-xl mx-auto px-8 py-16">
        <div className="mb-10">
          <p className="text-xs font-bold text-gray-300 uppercase tracking-widest mb-3">{L.newDoc}</p>
          <h1 className="text-4xl font-black text-black tracking-tight mb-3">
            {isDocCat ? L.docTitle : L.productTitle}
          </h1>
          <p className="text-gray-400 text-sm leading-relaxed">
            {isDocCat ? L.docSub : L.productSub}
          </p>
        </div>

        {/* 사용량 바 */}
        <div className={`rounded-2xl p-4 mb-8 border ${remaining === 0 ? 'bg-orange-50 border-orange-200' : 'bg-gray-50 border-gray-100'}`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-500">{L.usageLabel}</span>
            <span className={`text-xs font-black ${remaining === 0 ? 'text-orange-600' : 'text-gray-600'}`}>
              {monthlyUsed}/{FREE_LIMIT}{L.usageUnit}
              {remaining > 0 ? ` · ${remaining}${L.remaining}` : ` · ${L.exceeded}`}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div className={`h-1.5 rounded-full transition-all ${remaining === 0 ? 'bg-orange-500' : 'bg-black'}`} style={{ width: `${usagePct}%` }} />
          </div>
          {remaining === 0 && (
            <p className="text-xs text-orange-600 font-medium mt-2">
              {L.upgradeOver}<Link href="/#pricing" className="underline font-bold">Pro</Link>
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 제품/문서명 */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
              {isDocCat ? L.docNameLabel : L.nameLabel}
            </label>
            <input
              placeholder={isDocCat ? L.docNamePlaceholder : L.namePlaceholder}
              value={form.product_name}
              onChange={e => setForm({ ...form, product_name: e.target.value })}
              required
              className="w-full border border-gray-200 rounded-2xl px-5 py-4 text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all text-sm"
            />
          </div>

          {/* 카테고리 */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{L.catLabel}</label>
            <select
              value={form.category}
              onChange={e => setForm({ ...form, category: e.target.value })}
              required
              className="w-full border border-gray-200 rounded-2xl px-5 py-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all text-sm bg-white"
            >
              <option value="">{L.catPlaceholder}</option>
              {CATEGORIES.map(group => (
                <optgroup key={group.group} label={group.group}>
                  {group.items.map(c => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          {/* 화면 언어 (폼 UI만, 랜딩·브라우저와 독립) */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
              {L.screenLangLabel}{' '}
              <span className="text-gray-300 normal-case font-normal">({L.screenLangSub})</span>
            </label>
            <div className="grid grid-cols-4 gap-2">
              {LANGUAGES.map(lang => (
                <button
                  key={`ui-${lang.value}`}
                  type="button"
                  onClick={() => {
                    const v = lang.value as UiLang
                    setUiLang(v)
                    persistUiLang(v)
                  }}
                  className={`py-3 rounded-2xl text-sm font-bold border transition-all ${
                    uiLang === lang.value
                      ? 'bg-gray-900 text-white border-gray-900'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>

          {/* 출력 언어 */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
              {L.langLabel} <span className="text-gray-300 normal-case font-normal">({L.langSub})</span>
            </label>
            <div className="grid grid-cols-4 gap-2">
              {LANGUAGES.map(lang => (
                <button
                  key={lang.value}
                  type="button"
                  onClick={() => setOutputLang(lang.value)}
                  className={`py-3 rounded-2xl text-sm font-bold border transition-all ${
                    outputLang === lang.value
                      ? 'bg-black text-white border-black'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>

          {/* 양식 자동 작성 모드 토글 */}
          <div
            onClick={() => setTemplateMode(v => !v)}
            className={`flex items-start gap-3 rounded-2xl p-4 border cursor-pointer transition-all ${
              templateMode
                ? 'bg-indigo-50 border-indigo-300'
                : 'bg-gray-50 border-gray-200 hover:border-gray-400'
            }`}
          >
            <div className={`mt-0.5 w-5 h-5 rounded-md border-2 flex-shrink-0 flex items-center justify-center transition-all ${
              templateMode ? 'bg-indigo-600 border-indigo-600' : 'border-gray-300 bg-white'
            }`}>
              {templateMode && <span className="text-white text-[10px] font-black">✓</span>}
            </div>
            <div>
              <p className="text-sm font-bold text-gray-800">{L.templateToggleLabel}</p>
              <p className="text-xs text-gray-400 mt-0.5">{L.templateToggleSub}</p>
            </div>
          </div>

          {/* 양식 모드: 양식 내용 + 참고 정보 */}
          {templateMode ? (
            <>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  {L.templateFormLabel}{' '}
                  <span className="text-gray-300 normal-case font-normal">({L.templateFormSub})</span>
                </label>
                <div className="flex gap-2 mb-3">
                  <label className="flex items-center gap-2 bg-indigo-50 border border-indigo-200 rounded-xl px-4 py-3 cursor-pointer hover:bg-indigo-100 transition-all text-sm text-indigo-700 font-medium">
                    {L.fileBtn}
                    <input ref={templateFileRef} type="file" accept=".txt,.md,.csv" className="hidden" onChange={handleTemplateFile} />
                  </label>
                  {templateContent && (
                    <button type="button" onClick={() => setTemplateContent('')} className="text-xs text-gray-400 hover:text-red-500 transition-colors px-3">
                      {L.fileReset}
                    </button>
                  )}
                </div>
                <textarea
                  placeholder={L.templateFormPlaceholder}
                  rows={8}
                  value={templateContent}
                  onChange={e => setTemplateContent(e.target.value)}
                  required={templateMode}
                  className="w-full border border-indigo-200 rounded-2xl px-5 py-4 text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all text-sm resize-none bg-indigo-50/30"
                />
                {templateContent && (
                  <p className="text-xs text-indigo-600 font-medium mt-1.5">
                    ✓ {templateContent.length.toLocaleString()}{L.templateFileAdded}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  {L.templateInfoLabel}
                </label>
                <textarea
                  placeholder={L.templateInfoPlaceholder}
                  rows={4}
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  className="w-full border border-gray-200 rounded-2xl px-5 py-4 text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all text-sm resize-none"
                />
              </div>
            </>
          ) : (
            /* 일반 모드: 설명 */
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                {isDocCat ? L.docDescLabel : L.descLabel}
              </label>
              <textarea
                placeholder={isDocCat ? L.docDescPlaceholder : L.descPlaceholder}
                rows={6}
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                required={!templateMode}
                className="w-full border border-gray-200 rounded-2xl px-5 py-4 text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all text-sm resize-none"
              />
            </div>
          )}

          {/* 문서 첨부 (문서 카테고리만) */}
          {isDocCat && (
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                {L.attachLabel} <span className="text-gray-300 normal-case font-normal">({L.attachSub})</span>
              </label>
              <div className="flex gap-2 mb-3">
                <label className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 cursor-pointer hover:bg-gray-100 transition-all text-sm text-gray-600 font-medium">
                  {L.fileBtn}
                  <input ref={docInputRef} type="file" accept=".txt,.md,.csv" className="hidden" onChange={handleDocFile} />
                </label>
                {docText && (
                  <button type="button" onClick={() => setDocText('')} className="text-xs text-gray-400 hover:text-red-500 transition-colors px-3">
                    {L.fileReset}
                  </button>
                )}
              </div>
              <textarea
                placeholder={L.docPastePlaceholder}
                rows={4}
                value={docText}
                onChange={e => setDocText(e.target.value)}
                className="w-full border border-gray-200 rounded-2xl px-5 py-4 text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all text-sm resize-none bg-gray-50"
              />
              {docText && (
                <p className="text-xs text-green-600 font-medium mt-1.5">
                  ✓ {docText.length.toLocaleString()}{L.fileAdded}
                </p>
              )}
            </div>
          )}

          {/* 이미지 업로드 */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
              {isDocCat ? L.imgRef : L.photoLabel} <span className="text-gray-300 normal-case font-normal">({L.photoSub})</span>
            </label>
            {images.length > 0 && (
              <div className="grid grid-cols-3 gap-3 mb-3">
                {images.map((file, i) => (
                  <div key={i} className="relative group aspect-square rounded-2xl overflow-hidden border border-gray-200 bg-gray-50">
                    <img src={URL.createObjectURL(file)} alt={`preview ${i + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setImages(prev => prev.filter((_, idx) => idx !== i))}
                      className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/70 hover:bg-black text-white rounded-full text-xs font-black flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >×</button>
                    <div className="absolute bottom-1.5 left-1.5 bg-black/50 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{i + 1}</div>
                  </div>
                ))}
                {images.length < 3 && (
                  <label htmlFor="file-upload" className="aspect-square rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition-all">
                    <span className="text-2xl text-gray-300">+</span>
                    <span className="text-xs text-gray-300 mt-1">{L.addMore}</span>
                  </label>
                )}
              </div>
            )}
            {images.length === 0 && (
              <label htmlFor="file-upload" className="flex flex-col items-center justify-center w-full border-2 border-dashed border-gray-200 rounded-2xl p-10 cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition-all">
                <div className="text-3xl mb-2">📸</div>
                <p className="text-sm font-semibold text-gray-500 mb-1">{L.photoClick}</p>
                <p className="text-xs text-gray-300">{L.photoHint}</p>
              </label>
            )}
            <input id="file-upload" type="file" accept="image/*" multiple onChange={handleImageChange} className="hidden" />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-5 rounded-2xl font-bold text-base hover:bg-gray-800 disabled:opacity-40 transition-all flex items-center justify-center gap-3"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {L.generating}
              </>
            ) : templateMode ? L.templateBtn : isDocCat ? L.docBtn : L.generateBtn}
          </button>
        </form>
      </div>
    </main>
  )
}
