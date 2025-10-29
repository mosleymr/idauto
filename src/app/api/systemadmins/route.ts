import { NextResponse } from 'next/server'

// Minimal sample fallback when the external endpoint is unavailable
const sampleAdmins = {
  groups: [
    { name: 'Global Admins', members: ['alice@example.com', 'bob@example.com'] },
    { name: 'Helpdesk Admins', members: ['svc-helpdesk'] },
    { name: 'App Owners', members: ['app-owner-1', 'app-owner-2', 'app-owner-3'] },
  ],
}

export async function GET() {
  const RAPID_USER = process.env.RAPID_USER
  const RAPID_PASS = process.env.RAPID_PASS
  const externalUrl = 'https://portal.rapidisd.org/api/rest/restpoints/dashboards/v1/systemadmins'

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
        console.error('systemadmins proxy returned', r.status, r.statusText)
        const res = NextResponse.json(sampleAdmins)
        res.headers.set('Cache-Control', 's-maxage=60, stale-while-revalidate=120')
        return res
      }

      const json = await r.json()
      const res = NextResponse.json(json)
      res.headers.set('Cache-Control', 's-maxage=60, stale-while-revalidate=120')
      return res
    } catch (err) {
      console.error('Error fetching systemadmins', err)
      const res = NextResponse.json(sampleAdmins)
      res.headers.set('Cache-Control', 's-maxage=60, stale-while-revalidate=120')
      return res
    }
  }

  // Fallback when env vars are missing
  const res = NextResponse.json(sampleAdmins)
  res.headers.set('Cache-Control', 's-maxage=60, stale-while-revalidate=120')
  return res
}
