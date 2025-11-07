import { NextResponse } from 'next/server'

// Simple proxy to fetch user details by username from the RAPID endpoint.
export async function GET(req: Request) {
  const RAPID_USER = process.env.RAPID_USER
  const RAPID_PASS = process.env.RAPID_PASS
  const url = new URL(req.url)
  const username = url.searchParams.get('username') || ''

  // Build the external filter param: (idautoPersonUsernameMV=<username>)
  const filter = `(idautoPersonUsernameMV=${username})`
  const externalUrl = `https://portal.rapidisd.org/api/rest/restpoints/dashboards/v1/users?filter=${encodeURIComponent(filter)}`

  const sample = { users: [] }

  if (RAPID_USER && RAPID_PASS && username) {
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
        console.error('users proxy returned', r.status, r.statusText)
        const res = NextResponse.json(sample)
        res.headers.set('Cache-Control', 's-maxage=30, stale-while-revalidate=60')
        return res
      }

      const json = await r.json()
      const res = NextResponse.json(json)
      res.headers.set('Cache-Control', 's-maxage=30, stale-while-revalidate=60')
      return res
    } catch (err) {
      console.error('Error fetching users', err)
      const res = NextResponse.json(sample)
      res.headers.set('Cache-Control', 's-maxage=30, stale-while-revalidate=60')
      return res
    }
  }

  const res = NextResponse.json(sample)
  res.headers.set('Cache-Control', 's-maxage=30, stale-while-revalidate=60')
  return res
}
