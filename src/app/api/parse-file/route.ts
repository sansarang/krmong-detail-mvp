import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })

    const fileName = file.name.toLowerCase()
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // PDF 파싱
    if (fileName.endsWith('.pdf')) {
      // pdf-parse의 루트 index는 serverless에서 테스트파일 로드를 시도해 실패함
      // lib 경로를 직접 사용해 우회
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const pdfParse = require('pdf-parse/lib/pdf-parse.js') as (buf: Buffer) => Promise<{ text: string; numpages: number }>
      const data = await pdfParse(buffer)
      return NextResponse.json({ text: data.text, pages: data.numpages })
    }

    // TXT / MD / CSV — 일반 텍스트
    if (
      fileName.endsWith('.txt') ||
      fileName.endsWith('.md') ||
      fileName.endsWith('.csv') ||
      file.type.startsWith('text/')
    ) {
      const text = buffer.toString('utf-8')
      return NextResponse.json({ text })
    }

    return NextResponse.json({ error: '지원하지 않는 파일 형식입니다' }, { status: 400 })
  } catch (err) {
    console.error('parse-file error:', err)
    return NextResponse.json({ error: '파일 파싱 중 오류가 발생했습니다' }, { status: 500 })
  }
}
