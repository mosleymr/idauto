
'use client'

import { useEffect, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Legend, Cell, Sector, CartesianGrid } from "recharts"
import { Users, Cpu, Shield } from "lucide-react"
import type { IdentityData } from '@/lib/types/identity'
import Image from 'next/image'

  // Local types for admin/system groups to avoid `any` and satisfy ESLint
  type AdminMember = { username?: string; mail?: string }
  type AdminGroup = { name: string; members?: AdminMember[] }
  type AdminsResponse = { groups?: AdminGroup[] }

export default function IdentityDashboard() {
  const [data, setData] = useState<IdentityData | null>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'humans' | 'nonhumans'>('humans')
  const [admins, setAdmins] = useState<AdminsResponse | null>(null)
  const [adminsLoading, setAdminsLoading] = useState(true)
  const [selectedAdminGroup, setSelectedAdminGroup] = useState<string | null>(null)
  const [selectedAdminMembers, setSelectedAdminMembers] = useState<string[]>([])
  const [selectedAdminMemberObjects, setSelectedAdminMemberObjects] = useState<AdminMember[]>([])

  useEffect(() => {
    let mounted = true
    fetch('/api/identity')
      .then(r => r.json())
      .then(json => {
        if (mounted) setData(json)
      })
      .catch(() => setData(null))
      .finally(() => {
        if (mounted) setLoading(false)
      })
    return () => { mounted = false }
  }, [])

  useEffect(() => {
    let mounted = true
    fetch('/api/systemadmins')
      .then(r => r.json())
      .then((json: AdminsResponse) => {
        if (mounted) setAdmins(json)
      })
      .catch(() => setAdmins(null))
      .finally(() => { if (mounted) setAdminsLoading(false) })
    return () => { mounted = false }
  }, [])

  // When admin data first arrives, default-select the largest group if none selected
  useEffect(() => {
    if ((!selectedAdminGroup || selectedAdminGroup === null) && admins && admins.groups && admins.groups.length > 0) {
      const groups = (admins.groups || [])
        .map((g: AdminGroup) => ({ name: g.name, members: (g.members || []).filter((m: AdminMember) => m && (m.username || m.mail)) }))
        .filter((g) => (g.members || []).length > 0)
        .sort((a, b) => (b.members || []).length - (a.members || []).length)
      if (groups.length > 0) {
  const first = groups[0]
  setSelectedAdminGroup(first.name)
  setSelectedAdminMemberObjects(first.members || [])
  const members = (first.members || []).flatMap((m: AdminMember) => [m.mail, m.username]).filter((s): s is string => Boolean(s)).map((s) => s.toLowerCase())
  setSelectedAdminMembers(members)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [admins])

  if (loading) return <div className="p-6">Loading identity data…</div>

  if (!data) return <div className="p-6">Error loading data</div>

  // If an admin group is selected, compute filtered anomalous lists
  const filteredTopHumans = (selectedAdminMembers && selectedAdminMembers.length) ?
    data.topHumans.filter(u => {
      const uname = (u.name || '').toLowerCase()
      return selectedAdminMembers.some(m => {
        if (!m) return false
        return m === uname || uname.includes(m)
      })
    }) : data.topHumans

  const filteredTopNonHumans = (selectedAdminMembers && selectedAdminMembers.length) ?
    data.topNonHumans.filter(u => {
      const uname = (u.name || '').toLowerCase()
      return selectedAdminMembers.some(m => {
        if (!m) return false
        return m === uname || uname.includes(m)
      })
    }) : data.topNonHumans

  // Prepare admin groups pie data (drop zeros, sort largest-first)
  const adminGroupsProcessed = (admins && admins.groups) ? (admins.groups || [])
    .map((g: AdminGroup) => {
      const members = (g.members || []).filter((m: AdminMember) => m && (m.username || m.mail))
      return { name: g.name, value: members.length, members }
    })
    .filter((g) => g.value > 0)
    .sort((a, b) => b.value - a.value) : []

  const adminPieData = adminGroupsProcessed
  const adminColors = ['#60a5fa', '#a78bfa', '#f97316', '#34d399', '#fca5a5', '#f59e0b', '#38bdf8', '#7c3aed']

  // MFA sample data: generally increasing with small ups/downs
  const mfaSample = [
    { week: '2025-01', rate: 0.40 },
    { week: '2025-02', rate: 0.42 },
    { week: '2025-03', rate: 0.46 },
    { week: '2025-04', rate: 0.44 },
    { week: '2025-05', rate: 0.50 },
    { week: '2025-06', rate: 0.53 },
    { week: '2025-07', rate: 0.56 },
    { week: '2025-08', rate: 0.60 },
    { week: '2025-09', rate: 0.62 },
    { week: '2025-10', rate: 0.67 }
  ]
  const mfaData = (data && data.mfaTrend && data.mfaTrend.length) ? data.mfaTrend : mfaSample

  // Determine how MFA values are represented so we can format ticks/tooltips robustly.
  const mfaMaxRaw = Math.max(...mfaData.map((d: any) => Number(d.rate) || 0))
  // If values look like fractions (<= ~1.5) we treat them as 0..1. If they look like percentages (<=100) treat as 0..100.
  const mfaIsFraction = mfaMaxRaw <= 1.5
  const mfaYAxisDomain = mfaIsFraction ? [0, 1] : [0, Math.max(100, Math.ceil(mfaMaxRaw))]

  const formatPercent = (val: any) => {
    const n = Number(val)
    if (Number.isNaN(n)) return String(val)
    // If fraction (0.x) -> multiply by 100. If value looks like percent (1..100) -> use as-is.
    if (n <= 1.5) return `${Math.round(n * 100)}%`
    if (n <= 100) return `${Math.round(n)}%`
    // If it's unexpectedly large (e.g. 8800), assume it was scaled by 100 and divide.
    return `${Math.round(n / 100)}%`
  }

  

  // Prepare admin card content to keep JSX simpler
  let adminContent: any = null
  if (adminsLoading) {
    adminContent = <div className="p-4">Loading admins…</div>
  } else if (!admins || !admins.groups) {
    adminContent = <div className="p-4">No admin groups available</div>
  } else {
    // Default select the largest group when admins load
    adminContent = (
      <>
        <div className="grid grid-cols-2 gap-4 items-stretch">
          <div className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart margin={{ top: 8, right: 0, bottom: 0, left: 0 }}>
                {adminPieData && adminPieData.length > 0 ? (
                  <>
                    <Pie
                      data={adminPieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={4}
                      isAnimationActive={true}
                      animationDuration={800}
                      animationEasing="ease-in-out"
                      label={false}
                      labelLine={false}
                      onClick={(entry: unknown) => {
                        const payload = (entry && typeof entry === 'object' && 'payload' in entry) ? (entry as Record<string, unknown>)['payload'] : entry
                        const group = payload as AdminGroup
                        if (group && group.name) {
                          setSelectedAdminGroup(group.name)
                          const memberObjs = (group.members || [])
                          setSelectedAdminMemberObjects(memberObjs)
                          const members = memberObjs.flatMap((m: AdminMember) => [m.mail, m.username]).filter((s): s is string => Boolean(s)).map((s) => s.toLowerCase())
                          setSelectedAdminMembers(members)
                        }
                      }}
                    >
                      {adminPieData.map((slice: { name: string; value: number; members: AdminMember[] }, i: number) => (
                        <Cell
                          key={`admin-cell-${i}`}
                          fill={adminColors[i % adminColors.length]}
                          stroke={selectedAdminGroup === slice.name ? '#ffffff' : undefined}
                          strokeWidth={selectedAdminGroup === slice.name ? 2 : 0}
                          opacity={selectedAdminGroup ? (selectedAdminGroup === slice.name ? 1 : 0.5) : 1}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </>
                ) : null}
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex flex-col overflow-y-auto admin-scroll max-h-[200px]">
            <table className="table-auto w-full text-xs leading-tight">
              <thead>
                <tr className="text-left text-white/80">
                  <th className="pb-1">Username</th>
                </tr>
              </thead>
              <tbody>
                  {(() => {
                    // Determine members to show: selected objects or largest group by default
                    const membersToShow = selectedAdminMemberObjects && selectedAdminMemberObjects.length ? selectedAdminMemberObjects : (adminPieData && adminPieData.length ? adminPieData[0].members : [])
                    return membersToShow.map((m: any, idx: number) => {
                      const username = m && m.username ? String(m.username).replace(/\s+/g, '') : null
                      const key = username || `m-${idx}`
                      return (
                        <tr key={key} className="odd:bg-slate-900 even:bg-slate-950">
                          <td className="py-1 text-xs">{username || '—'}</td>
                        </tr>
                      )
                    })
                  })()}
              </tbody>
            </table>
          </div>
        </div>
      </>
    )
  }

  return (
    <div className="p-6 grid grid-cols-3 gap-6 bg-slate-950 text-white min-h-screen">
      <div className="col-span-3 mb-2 flex items-center">
        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-1">Identity Dashboard</h1>
          <p className="text-slate-400">Identity-centric security telemetry and trends</p>
        </div>
        <div className="ml-4">
          <Image src="/idauto_light.png" alt="idauto logo" width={60} height={60} className="h-[60px] w-auto" />
        </div>
      </div>

      {/* Administrators by group (new) */}
  <Card className="bg-slate-900 border-slate-800 text-white col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">Administrators</CardTitle>
          </CardHeader>
        <CardContent>
          {adminContent}
        </CardContent>
      </Card>

      {/* Identities by type (human / non-human) - combined card */}
      <Card className="bg-slate-900 border-slate-800 text-white">
        <CardHeader>
          <div className="w-full flex items-start justify-between">
            <CardTitle className="flex items-center gap-2">Identities by type</CardTitle>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setFilter('humans')}
                className={`px-2 py-1 text-sm rounded ${filter === 'humans' ? 'bg-slate-700' : 'bg-transparent'}`}
              >
                Human
              </button>
              <button
                type="button"
                onClick={() => setFilter('nonhumans')}
                className={`px-2 py-1 text-sm rounded ${filter === 'nonhumans' ? 'bg-slate-700' : 'bg-transparent'}`}
              >
                Non-human
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart margin={{ top: 8, right: 0, bottom: 0, left: 0 }}>
              {filter === 'humans' ? (
                <>
                  <Pie
                    data={[{ name: 'Students', value: 500 }, { name: 'Staff', value: 50 }, { name: 'Other', value: 10 }]}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={60}
                    paddingAngle={4}
                    isAnimationActive={true}
                    animationDuration={800}
                    animationEasing="ease-in-out"
                    label={false}
                    labelLine={false}
                  >
                    {['#60a5fa', '#34d399', '#f97316'].map((c, i) => (
                      <Cell key={`cell-${i}`} fill={c} />
                    ))}
                  </Pie>
                </>
              ) : (
                <>
                  <Pie
                    data={[{ name: 'Applications', value: 100 }, { name: 'Services', value: 25 }, { name: 'Devices', value: 500 }]}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={60}
                    paddingAngle={4}
                    isAnimationActive={true}
                    animationDuration={800}
                    animationEasing="ease-in-out"
                    label={false}
                    labelLine={false}
                  >
                    {['#a78bfa', '#60a5fa', '#34d399'].map((c, i) => (
                      <Cell key={`cell-nh-${i}`} fill={c} />
                    ))}
                  </Pie>
                </>
              )}
              <Tooltip />
              <Legend verticalAlign="bottom" align="center" layout="horizontal" />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

  <Card className="bg-slate-900 border-slate-800 text-white col-span-1">
        <CardHeader>
          <div className="w-full flex items-start justify-between">
            <CardTitle className="flex items-center gap-2"><Shield className="text-blue-400"/> High Risk Score</CardTitle>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setFilter('humans')}
                className={`px-2 py-1 text-sm rounded ${filter === 'humans' ? 'bg-slate-700' : 'bg-transparent'}`}
              >
                Human
              </button>
              <button
                type="button"
                onClick={() => setFilter('nonhumans')}
                className={`px-2 py-1 text-sm rounded ${filter === 'nonhumans' ? 'bg-slate-700' : 'bg-transparent'}`}
              >
                Non-human
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filter === 'humans' ? (
            <div>
              <h4 className="text-sm text-white/80 mb-2">Top human identities</h4>
              <ol className="list-decimal pl-5 text-sm text-white/80">
                {data.topHumans.slice(0,5).map(u => (
                  <li key={u.name} className="py-1 flex justify-between"><span>{u.name}</span><span className="text-xs text-white/70">score {u.score}</span></li>
                ))}
              </ol>
            </div>
          ) : (
            <div>
              <h4 className="text-sm text-white/80 mb-2">Top non-human identities</h4>
              <ol className="list-decimal pl-5 text-sm text-white/80">
                {data.topNonHumans.slice(0,5).map(u => (
                  <li key={u.name} className="py-1 flex justify-between"><span>{u.name}</span><span className="text-xs text-white/70">score {u.score}</span></li>
                ))}
              </ol>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="col-span-2 bg-slate-900 border-slate-800 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Shield className="text-emerald-400"/> MFA adoption rate</CardTitle>
        </CardHeader>
        <CardContent>
            <ResponsiveContainer width="100%" height={120}>
              <LineChart data={mfaData}>
                <CartesianGrid stroke="rgba(255,255,255,0.03)" />
                <XAxis dataKey="week" />
                <YAxis tickFormatter={(v: any) => formatPercent(v)} domain={mfaYAxisDomain} />
                <Tooltip formatter={(value: any) => formatPercent(value)} labelFormatter={(label: any) => `Week: ${label}`} />
                <Line type="monotone" dataKey="rate" stroke="#06b6d4" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
        </CardContent>
      </Card>
    

      
    </div>
  )
}
