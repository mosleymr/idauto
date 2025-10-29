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

export async function GET() {
  // Attempt to proxy the external REST endpoint using server-side fetch and HTTP Basic Auth.
  // Credentials should be provided via environment variables for security.
  const RAPID_USER = process.env.RAPID_USER
  const RAPID_PASS = process.env.RAPID_PASS
  const externalUrl = 'https://portal.rapidisd.org/api/rest/restpoints/dashboards/'

  if (RAPID_USER && RAPID_PASS) {
    try {
      const auth = Buffer.from(`${RAPID_USER}:${RAPID_PASS}`).toString('base64')
      // Server-side fetch
      const r = await fetch(externalUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Accept': 'application/json',
        },
        // ensure we don't expose credentials to the client
        cache: 'no-store',
      })

      if (!r.ok) {
        console.error('External identity API returned', r.status, r.statusText)
        const res = NextResponse.json(sampleData as IdentityData)
        res.headers.set('Cache-Control', 's-maxage=60, stale-while-revalidate=120')
        return res
      }

      const json = await r.json()
      const res = NextResponse.json(json as IdentityData)
      // Cache on CDN for 60s, allow stale while revalidating for 120s
      res.headers.set('Cache-Control', 's-maxage=60, stale-while-revalidate=120')
      return res
    } catch (err) {
      console.error('Error fetching external identity API', err)
      const res = NextResponse.json(sampleData as IdentityData)
      res.headers.set('Cache-Control', 's-maxage=60, stale-while-revalidate=120')
      return res
    }
  }

  // Fallback: return the bundled sample data when credentials are not configured
  const res = NextResponse.json(sampleData as IdentityData)
  res.headers.set('Cache-Control', 's-maxage=60, stale-while-revalidate=120')
  return res
}
