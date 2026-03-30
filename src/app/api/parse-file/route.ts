import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })

    const fileName = file.name.toLowerCase()
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // ── PDF — Claude 네이티브 PDF 읽기 (serverless 완벽 호환) ──
    if (fileName.endsWith('.pdf')) {
      const base64Data = buffer.toString('base64')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const message = await (anthropic.messages.create as any)({
        model: 'claude-3-5-haiku-20241022',
        max_tokens: 4000,
        messages: [{
          role: 'user',
          content: [
            { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: base64Data } },
            { type: 'text', text: 'Extract all text from this PDF. Output only the plain text, preserving structure and sections. No commentary.' },
          ],
        }],
      })
      const text = message.content
        .filter(b => b.type === 'text')
        .map(b => (b as { type: 'text'; text: string }).text)
        .join('\n')
      return NextResponse.json({ text: text.trim(), pages: 1 })
    }

    // ── DOCX (Word) ────────────────────────────────────────────
    if (fileName.endsWith('.docx')) {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const mammoth = require('mammoth') as {
        extractRawText: (opts: { buffer: Buffer }) => Promise<{ value: string }>
      }
      const result = await mammoth.extractRawText({ buffer })
      return NextResponse.json({ text: result.value.trim(), format: 'docx' })
    }

    // ── XLSX / XLS (Excel) ─────────────────────────────────────
    if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const XLSX = require('xlsx') as typeof import('xlsx')
      const workbook = XLSX.read(buffer, { type: 'buffer' })
      const lines: string[] = []
      workbook.SheetNames.forEach((sheetName) => {
        const ws = workbook.Sheets[sheetName]
        const csv = XLSX.utils.sheet_to_csv(ws)
        if (csv.trim()) lines.push(`[${sheetName}]\n${csv}`)
      })
      return NextResponse.json({ text: lines.join('\n\n').trim(), format: 'xlsx', sheets: workbook.SheetNames.length })
    }

    // ── PPTX (PowerPoint) — XML 직접 파싱 (별도 라이브러리 불필요) ──
    if (fileName.endsWith('.pptx')) {
      const JSZip = (await import('jszip')).default
      const zip = await JSZip.loadAsync(buffer)
      const slideFiles = Object.keys(zip.files)
        .filter(f => /ppt\/slides\/slide\d+\.xml$/.test(f))
        .sort((a, b) => {
          const na = parseInt(a.match(/\d+/)?.[0] ?? '0')
          const nb = parseInt(b.match(/\d+/)?.[0] ?? '0')
          return na - nb
        })
      const lines: string[] = []
      for (const sf of slideFiles) {
        const xml = await zip.files[sf].async('string')
        const texts = [...xml.matchAll(/<a:t[^>]*>([\s\S]*?)<\/a:t>/g)]
          .map(m => m[1].replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').trim())
          .filter(Boolean)
        if (texts.length) lines.push(texts.join(' '))
      }
      return NextResponse.json({ text: lines.join('\n').trim(), format: 'pptx', slides: slideFiles.length })
    }

    // ── TXT / MD / CSV — 일반 텍스트 ──────────────────────────
    if (
      fileName.endsWith('.txt') ||
      fileName.endsWith('.md') ||
      fileName.endsWith('.csv') ||
      file.type.startsWith('text/')
    ) {
      const text = buffer.toString('utf-8')
      return NextResponse.json({ text: text.trim() })
    }

    return NextResponse.json({ error: '지원하지 않는 파일 형식입니다. (PDF/DOCX/XLSX/PPTX/TXT/MD/CSV 지원)' }, { status: 400 })
  } catch (err) {
    console.error('parse-file error:', err)
    return NextResponse.json({ error: '파일 파싱 중 오류가 발생했습니다' }, { status: 500 })
  }
}
