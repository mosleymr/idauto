"use client"

import { useState } from 'react'
import Modal from '@/components/ui/modal'

export default function ChatBox() {
  const [question, setQuestion] = useState('')
  const [loading, setLoading] = useState(false)
  const [answer, setAnswer] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [open, setOpen] = useState(false)

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!question.trim()) return
    setLoading(true)
    setError(null)
    setAnswer(null)
    try {
      const r = await fetch('/api/identity-chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ question }) })
      if (!r.ok) throw new Error(`Chat API error ${r.status}`)
      const json = await r.json()
      // Expecting { answer: string } or raw text
      const a = json?.answer ?? json?.text ?? (await r.text())
      setAnswer(String(a))
      setOpen(true)
    } catch (err: any) {
      console.error('Chat error', err)
      setError(err?.message || 'Unknown error')
      setOpen(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="col-span-3">
        <div className="bg-slate-900 border border-slate-800 rounded p-4 text-white">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Chat</h2>
          </div>
          <form onSubmit={submit} className="grid grid-cols-12 gap-2">
            <textarea
              className="col-span-10 bg-slate-800 p-2 rounded resize-none h-16 text-white"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask a question about identities, risks, or investigations..."
            />
            <div className="col-span-2 flex items-center">
              <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded">
                {loading ? 'Sending…' : 'Send'}
              </button>
            </div>
          </form>
        </div>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title={error ? 'Chat Error' : 'Chat response'}>
        {error ? (
          <div className="text-sm text-red-400">Error: {error}</div>
        ) : (
          <div className="bg-slate-850 p-3 rounded text-sm whitespace-pre-wrap">{answer}</div>
        )}
      </Modal>
    </>
  )
}
