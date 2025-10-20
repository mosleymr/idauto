import type { Metadata } from 'next'
import IdentityDashboard from './IdentityDashboard'

export const metadata: Metadata = {
  title: 'Identity Dashboard',
  description: 'Identity-centric security dashboard with anomalous identities, risk counts, MFA trends and privileged account summaries',
}

export default function Page() {
  return <IdentityDashboard />
}
