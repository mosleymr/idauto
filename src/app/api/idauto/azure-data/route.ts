import { NextResponse } from 'next/server'

const SAMPLE = {
  highRiskUsers: 12,
  leakedCredentials: 8,
  mfaAdoptionPercent: 92,
  legacyAuthUsagePercent: 5,
  globalAdmins: 4,
  pimActivations7d: 23,
  secureScoreTrend: [{month:'Jul',score:68},{month:'Aug',score:71},{month:'Sep',score:74},{month:'Oct',score:78}],
}

export async function GET() {
  const url = process.env.MICROSOFT_API_URL
  const key = process.env.MICROSOFT_API_KEY

  if (!url || !key) {
    return NextResponse.json(SAMPLE)
  }

  try {
    const res = await fetch(url, { headers: { Authorization: `Bearer ${key}` } })
    if (!res.ok) return NextResponse.json(SAMPLE)
    const json = await res.json()
    const mapped = {
      highRiskUsers: json.highRiskUsers ?? json.highRisk ?? SAMPLE.highRiskUsers,
      leakedCredentials: json.leakedCredentials ?? SAMPLE.leakedCredentials,
      mfaAdoptionPercent: json.mfaAdoptionPercent ?? SAMPLE.mfaAdoptionPercent,
      legacyAuthUsagePercent: json.legacyAuthUsagePercent ?? SAMPLE.legacyAuthUsagePercent,
      globalAdmins: json.globalAdmins ?? SAMPLE.globalAdmins,
      pimActivations7d: json.pimActivations7d ?? SAMPLE.pimActivations7d,
      secureScoreTrend: json.secureScoreTrend ?? SAMPLE.secureScoreTrend,
    }
    return NextResponse.json(mapped)
  } catch (err) {
    console.error('azure-data proxy error', err)
    return NextResponse.json(SAMPLE)
  }
}
