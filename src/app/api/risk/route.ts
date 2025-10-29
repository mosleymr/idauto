import { NextResponse } from 'next/server'

// Minimal sample fallback when the external endpoint is unavailable
const sampleRisk = {
  users: [
    { idautoid: '1', username: 'alice@example.com', riskScore: '92', riskDetail: 'Sample risk detail for Alice' },
    { idautoid: '2', username: 'bob@example.com', riskScore: '88', riskDetail: 'Sample risk detail for Bob' },
    { idautoid: '3', username: 'carol@example.com', riskScore: '84', riskDetail: 'Sample risk detail for Carol' },
  ],
}

export async function GET() {
  const RAPID_USER = process.env.RAPID_USER
  const RAPID_PASS = process.env.RAPID_PASS
  const externalUrl = 'https://portal.rapidisd.org/api/rest/restpoints/dashboards/v1/users/risk'

  if (RAPID_USER && RAPID_PASS) {
    try {
      const auth = Buffer.from(`${RAPID_USER}:${RAPID_PASS}`).toString('base64')
      const r = await fetch(externalUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Accept': 'application/json',
        },
        cache: 'no-store',
      })

      if (!r.ok) {
        console.error('risk proxy returned', r.status, r.statusText)
        const res = NextResponse.json(sampleRisk)
        res.headers.set('Cache-Control', 's-maxage=60, stale-while-revalidate=120')
        return res
      }

      const json = await r.json()
      const res = NextResponse.json(json)
      res.headers.set('Cache-Control', 's-maxage=60, stale-while-revalidate=120')
      return res
    } catch (err) {
      console.error('Error fetching risk data', err)
      const res = NextResponse.json(sampleRisk)
      res.headers.set('Cache-Control', 's-maxage=60, stale-while-revalidate=120')
      return res
    }
  }

  const res = NextResponse.json(sampleRisk)
  res.headers.set('Cache-Control', 's-maxage=60, stale-while-revalidate=120')
  return res
}
