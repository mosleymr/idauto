export interface IdentityRecord {
  name: string
  score: number
}

export interface RiskByType {
  type: string
  count: number
}

export interface MFARecord {
  week: string
  rate: number
}

export interface PrivilegedSummary {
  globalAdmins: number
  delegatedAdmins: number
}

export interface IdentityData {
  topHumans: IdentityRecord[]
  topNonHumans: IdentityRecord[]
  riskByType: RiskByType[]
  mfaTrend: MFARecord[]
  privileged: PrivilegedSummary
}
