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

    // ── PDF — Claude 네이티브 PDF 읽기 (claude-sonnet-4-5 이상만 지원) ──
    if (fileName.endsWith('.pdf')) {
      const base64Data = buffer.toString('base64')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const message = await (anthropic.messages.create as any)({
        model: 'claude-sonnet-4-5',
        max_tokens: 4000,
        messages: [{
          role: 'user',
          content: [
            {
              type: 'document',
              source: { type: 'base64', media_type: 'application/pdf', data: base64Data },
            },
            {
              type: 'text',
              text: 'Extract all text from this PDF document. Output only the plain text, preserving the original structure and section headings. No commentary or explanation.',
            },
          ],
        }],
      })
      const text = (message.content as { type: string; text?: string }[])
        .filter(b => b.type === 'text')
        .map(b => b.text ?? '')
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
      const raw = result.value.trim()
      const MAX_DOCX_CHARS = 25000
      const wasLarge = raw.length > MAX_DOCX_CHARS
      const text = wasLarge
        ? raw.slice(0, MAX_DOCX_CHARS) + `\n\n[⚠️ 문서가 길어 앞 ${MAX_DOCX_CHARS.toLocaleString()}자만 추출됨. 전체 길이: ${raw.length.toLocaleString()}자]`
        : raw
      return NextResponse.json({ text, format: 'docx', wasLarge })
    }

    // ── XLSX / XLS (Excel) — Smart extraction (token-safe) ───────
    if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const XLSX = require('xlsx') as typeof import('xlsx')
      const workbook = XLSX.read(buffer, { type: 'buffer' })
      const MAX_ROWS_PER_SHEET = 60  // max sample rows per sheet
      const MAX_TOTAL_CHARS    = 22000 // hard cap on total extracted text

      const sheetSections: string[] = []
      let totalChars = 0

      for (const sheetName of workbook.SheetNames) {
        if (totalChars >= MAX_TOTAL_CHARS) break
        const ws = workbook.Sheets[sheetName]
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const jsonRows: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' })
        if (!jsonRows.length) continue

        const headerRow = jsonRows[0] as string[]
        const dataRows  = jsonRows.slice(1).filter((r: unknown[]) => r.some(v => v !== '' && v !== null && v !== undefined))
        const totalDataRows = dataRows.length

        // Build column summary (for numeric cols)
        const colStats: string[] = []
        headerRow.forEach((h, ci) => {
          if (!h) return
          const nums = dataRows.map((r: unknown[]) => Number(r[ci])).filter(n => !isNaN(n) && n !== 0)
          if (nums.length > 3) {
            const mn  = Math.min(...nums).toLocaleString()
            const mx  = Math.max(...nums).toLocaleString()
            const avg = (nums.reduce((a, b) => a + b, 0) / nums.length).toFixed(1)
            colStats.push(`  - ${h}: ${nums.length} values, range ${mn}~${mx}, avg ${avg}`)
          }
        })

        // Build sample rows (first N + last 5 if large)
        const sampleFirst = dataRows.slice(0, MAX_ROWS_PER_SHEET - 5)
        const sampleLast  = totalDataRows > MAX_ROWS_PER_SHEET ? dataRows.slice(-5) : []

        const rowToLine = (r: unknown[]) =>
          headerRow.map((h, ci) => h ? `${h}: ${r[ci] ?? ''}` : '').filter(Boolean).join(' | ')

        const lines: string[] = [
          `[시트: ${sheetName}]`,
          `총 데이터 행: ${totalDataRows}행 × ${headerRow.filter(Boolean).length}열`,
          `컬럼: ${headerRow.filter(Boolean).join(', ')}`,
        ]
        if (colStats.length) lines.push(`수치 통계:\n${colStats.join('\n')}`)
        lines.push(`\n--- 데이터 샘플 (상위 ${sampleFirst.length}행) ---`)
        sampleFirst.forEach((r, i) => lines.push(`[${i + 1}] ${rowToLine(r)}`))
        if (sampleLast.length) {
          lines.push(`\n... (중간 ${totalDataRows - sampleFirst.length - sampleLast.length}행 생략) ...`)
          lines.push(`\n--- 마지막 ${sampleLast.length}행 ---`)
          sampleLast.forEach((r, i) => lines.push(`[${totalDataRows - sampleLast.length + i + 1}] ${rowToLine(r)}`))
        }

        const section = lines.join('\n')
        sheetSections.push(section)
        totalChars += section.length
      }

      const fullText = sheetSections.join('\n\n')
      const wasLarge = workbook.SheetNames.some(name => {
        const ws = workbook.Sheets[name]
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const rows: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' })
        return rows.length > MAX_ROWS_PER_SHEET + 1
      })

      return NextResponse.json({
        text: fullText.trim(),
        format: 'xlsx',
        sheets: workbook.SheetNames.length,
        wasLarge,
        note: wasLarge ? '대용량 파일 — 핵심 구조 및 샘플 데이터 추출 완료 (전체 행 중 일부 샘플)' : undefined,
      })
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
      const raw = buffer.toString('utf-8').trim()
      const MAX_TEXT_CHARS = 25000
      const wasLarge = raw.length > MAX_TEXT_CHARS

      let text = raw
      if (wasLarge) {
        // For CSV: keep header + first 200 rows + last 20 rows
        if (fileName.endsWith('.csv')) {
          const csvLines = raw.split('\n')
          const header   = csvLines[0] ?? ''
          const dataLines = csvLines.slice(1)
          const sample = [
            header,
            ...dataLines.slice(0, 200),
            dataLines.length > 220 ? `\n... (중간 ${dataLines.length - 220}행 생략) ...` : '',
            ...dataLines.slice(-20),
          ].filter(Boolean).join('\n')
          text = sample + `\n\n[⚠️ CSV 대용량 파일 — 총 ${dataLines.length}행 중 샘플 추출]`
        } else {
          text = raw.slice(0, MAX_TEXT_CHARS) + `\n\n[⚠️ 파일이 길어 앞 ${MAX_TEXT_CHARS.toLocaleString()}자만 사용. 전체: ${raw.length.toLocaleString()}자]`
        }
      }
      return NextResponse.json({ text, wasLarge })
    }

    return NextResponse.json({ error: '지원하지 않는 파일 형식입니다. (PDF/DOCX/XLSX/PPTX/TXT/MD/CSV 지원)' }, { status: 400 })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('parse-file error:', msg)
    return NextResponse.json({ error: `파일 파싱 오류: ${msg}` }, { status: 500 })
  }
}
