"use client"

type Props = {
  loading?: boolean
  data?: any | null
}

export default function UserDetails({ loading, data }: Props) {
  if (loading) return <div className="text-sm text-white/70">Loading details…</div>
  if (!data) return <div className="text-sm text-white/70">No details available</div>

  const name = data.name || data.displayName || data.username || '—'
  const email = data.email || data.mail || '—'
  const riskScore = data.riskScore ?? data.riskScoreNum ?? data.risk ?? '—'
  const riskField = data.risk ?? data.risks ?? data.riskDetail ?? '—'

  return (
    <div className="text-sm text-white/80">
      <div className="mb-1"><span className="text-white/70">Name: </span><span className="font-medium">{name}</span></div>
      <div className="mb-1"><span className="text-white/70">Email: </span><span className="font-medium">{email}</span></div>
      <div className="mb-1"><span className="text-white/70">Risk score: </span><span className="font-medium">{String(riskScore)}</span></div>
      <div className="mb-1"><span className="text-white/70">Risk: </span><span className="font-medium">{typeof riskField === 'string' ? riskField : JSON.stringify(riskField)}</span></div>
    </div>
  )
}
