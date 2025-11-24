import { NextResponse } from 'next/server'

const SAMPLE = {
  highRiskAccounts: 15,
  suspiciousLogins: 42,
  mfaEnrollmentPercent: 88,
  failedMfaAttempts: 27,
  superAdmins: 5,
  delegatedAdmins: 12,
  thirdPartyAdminApps: 3,
  phishingEmailsDetected: 128,
  unsafeLinksBlocked: 312,
  trends: [{day:'Mon',val:10},{day:'Tue',val:15},{day:'Wed',val:18},{day:'Thu',val:25}],
}

export async function GET() {
  const url = process.env.GOOGLE_API_URL
  const key = process.env.GOOGLE_API_KEY

  if (!url || !key) {
    return NextResponse.json(SAMPLE)
  }

  try {
    const res = await fetch(url, { headers: { Authorization: `Bearer ${key}` } })
    if (!res.ok) return NextResponse.json(SAMPLE)
    const json = await res.json()
    // Attempt to map expected fields from upstream; otherwise return upstream as-is
    const mapped = {
      highRiskAccounts: json.highRiskAccounts ?? json.highRisk ?? SAMPLE.highRiskAccounts,
      suspiciousLogins: json.suspiciousLogins ?? json.suspicious ?? SAMPLE.suspiciousLogins,
      mfaEnrollmentPercent: json.mfaEnrollmentPercent ?? json.mfaEnrollment ?? SAMPLE.mfaEnrollmentPercent,
      failedMfaAttempts: json.failedMfaAttempts ?? json.mfaFailures ?? SAMPLE.failedMfaAttempts,
      superAdmins: json.superAdmins ?? SAMPLE.superAdmins,
      delegatedAdmins: json.delegatedAdmins ?? SAMPLE.delegatedAdmins,
      thirdPartyAdminApps: json.thirdPartyAdminApps ?? SAMPLE.thirdPartyAdminApps,
      phishingEmailsDetected: json.phishingEmailsDetected ?? SAMPLE.phishingEmailsDetected,
      unsafeLinksBlocked: json.unsafeLinksBlocked ?? SAMPLE.unsafeLinksBlocked,
      trends: json.trends ?? SAMPLE.trends,
    }
    return NextResponse.json(mapped)
  } catch (err) {
    console.error('google-data proxy error', err)
    return NextResponse.json(SAMPLE)
  }
}
