
'use client'

import { useEffect, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { LineChart, Line, BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from "recharts"
import { Users, Cpu, Shield } from "lucide-react"
import type { IdentityData } from '@/lib/types/identity'

export default function IdentityDashboard() {
  const [data, setData] = useState<IdentityData | null>(null)
  const [loading, setLoading] = useState(true)

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

  if (loading) return <div className="p-6">Loading identity data…</div>

  if (!data) return <div className="p-6">Error loading data</div>

  return (
    <div className="p-6 grid grid-cols-3 gap-6 bg-slate-950 text-white min-h-screen">
      <div className="col-span-3 mb-2">
        <h1 className="text-3xl font-bold mb-1">Identity Dashboard</h1>
        <p className="text-slate-400">Identity-centric security telemetry and trends</p>
      </div>

      <Card className="bg-slate-900 border-slate-800 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Shield className="text-blue-400"/> Top anomalous human identities</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal pl-5 text-sm text-white/80">
            {data.topHumans.map(u => (
              <li key={u.name} className="py-1 flex justify-between"><span>{u.name}</span><span className="text-xs text-white/70">score {u.score}</span></li>
            ))}
          </ol>
        </CardContent>
      </Card>

      <Card className="bg-slate-900 border-slate-800 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Cpu className="text-cyan-400"/> Top anomalous non-human identities</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal pl-5 text-sm text-white/80">
            {data.topNonHumans.map(u => (
              <li key={u.name} className="py-1 flex justify-between"><span>{u.name}</span><span className="text-xs text-white/70">score {u.score}</span></li>
            ))}
          </ol>
        </CardContent>
      </Card>

      <Card className="bg-slate-900 border-slate-800 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Users className="text-pink-400"/> High-risk users by type</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={120}>
            <BarChart data={data.riskByType}>
              <Bar dataKey="count" fill="#f97316" radius={[4,4,0,0]} />
              <XAxis dataKey="type" />
              <Tooltip />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="col-span-2 bg-slate-900 border-slate-800 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Shield className="text-emerald-400"/> MFA adoption rate</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={120}>
            <LineChart data={data.mfaTrend}>
              <Line type="monotone" dataKey="rate" stroke="#06b6d4" strokeWidth={2} />
              <XAxis dataKey="week" />
              <Tooltip />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="bg-slate-900 border-slate-800 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Users className="text-amber-400"/> Privileged accounts</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="text-white/80 text-sm">
            <li>Global Admins: <span className="font-bold text-red-400">{data.privileged.globalAdmins}</span></li>
            <li>Delegated Admins: <span className="font-bold text-yellow-400">{data.privileged.delegatedAdmins}</span></li>
          </ul>
        </CardContent>
      </Card>

      <Card className="col-span-3 bg-slate-900 border-slate-800 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">Trends & Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-white/80 text-sm">Summary trends for identity security (MFA, anomalous behavior, risk counts). Replace with real data sources when available.</p>
        </CardContent>
      </Card>
    </div>
  )
}
