'use client'
import { useState } from 'react'

export default function EmbedCopyClient({ label, code }: { label: string; code: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="relative">
      <pre className="bg-[#0D1929] border border-white/8 rounded-xl p-4 text-xs text-green-400 overflow-x-auto whitespace-pre-wrap font-mono leading-relaxed">
        {code}
      </pre>
      <button
        onClick={handleCopy}
        className="mt-2 w-full bg-white/5 hover:bg-white/10 border border-white/8 text-white text-xs font-bold py-2.5 rounded-lg transition-colors"
      >
        {copied ? '✅ 복사됨!' : label}
      </button>
    </div>
  )
}
