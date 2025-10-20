import { NextResponse } from 'next/server'
import type { IdentityData } from '@/lib/types/identity'

const sampleData = {
  topHumans: [
    { name: 'alice@example.com', score: 92 },
    { name: 'bob@example.com', score: 88 },
    { name: 'carol@example.com', score: 84 },
    { name: 'dave@example.com', score: 81 },
    { name: 'eve@example.com', score: 79 },
  ],
  topNonHumans: [
    { name: 'svc-finance-sync', score: 95 },
    { name: 'backup-agent', score: 90 },
    { name: 'devops-bot', score: 86 },
    { name: 'graph-sync', score: 82 },
    { name: 'ci-runner', score: 80 },
  ],
  riskByType: [
    { type: 'Leaked Credentials', count: 8 },
    { type: 'Excessive Permissions', count: 12 },
    { type: 'Inactive Accounts', count: 102 },
  ],
  mfaTrend: [
    { week: 'W1', rate: 78 },
    { week: 'W2', rate: 82 },
    { week: 'W3', rate: 85 },
    { week: 'W4', rate: 88 },
  ],
  privileged: { globalAdmins: 4, delegatedAdmins: 12 },
}

export function GET() {
  const res = NextResponse.json(sampleData as IdentityData)
  // Cache on CDN for 60s, allow stale while revalidating for 120s
  res.headers.set('Cache-Control', 's-maxage=60, stale-while-revalidate=120')
  return res
}
