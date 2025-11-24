'use client'

import { useEffect, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { LineChart, Line, PieChart, Pie, BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts"
import { Shield, Lock, Users, AlertTriangle, Activity, Key, Cloud, Mail, Share2 } from "lucide-react"
import { motion } from "framer-motion"
import Image from 'next/image'
 
export default function GoogleWorkspaceIdentityDashboard() {
  const [remote, setRemote] = useState<any | null>(null)

  useEffect(() => {
    let mounted = true
    fetch('/api/idauto/google-data').then(r => r.json()).then(j => { if (mounted) setRemote(j) }).catch(() => {})
    return () => { mounted = false }
  }, [])

  const data = {
    highRiskAccounts: remote?.highRiskAccounts ?? 15,
    suspiciousLogins: remote?.suspiciousLogins ?? 42,
    mfaEnrollmentPercent: remote?.mfaEnrollmentPercent ?? 88,
    failedMfaAttempts: remote?.failedMfaAttempts ?? 27,
    superAdmins: remote?.superAdmins ?? 5,
    delegatedAdmins: remote?.delegatedAdmins ?? 12,
    thirdPartyAdminApps: remote?.thirdPartyAdminApps ?? 3,
    phishingEmailsDetected: remote?.phishingEmailsDetected ?? 128,
    unsafeLinksBlocked: remote?.unsafeLinksBlocked ?? 312,
    trends: remote?.trends ?? [{day:'Mon',val:10},{day:'Tue',val:15},{day:'Wed',val:18},{day:'Thu',val:25}],
  }

  return (
    <div className="p-6 grid grid-cols-3 gap-6 bg-slate-950 text-white min-h-screen">
      <motion.div className="col-span-3 mb-2 flex items-center" initial={{opacity:0, y:-10}} animate={{opacity:1, y:0}}>
        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-1">Google Workspace Identity Security Overview</h1>
          <p className="text-slate-400">Identity and Access Management Dashboard for CISOs</p>
        </div>
        <div className="ml-4">
          <Image src="/idauto_light.png" alt="idauto logo" width={60} height={60} className="h-[60px] w-auto" />
        </div>
      </motion.div>

      <Card className="bg-slate-900 border-slate-800 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Shield className="text-blue-400"/> Identity Threats & Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-lg text-white">High-Risk Accounts</h3>
              <p className="text-4xl font-bold text-red-400">{data.highRiskAccounts}</p>
              <p className="text-white/70">Detected this week</p>
            </div>
            <div>
              <h3 className="text-lg text-white">Suspicious Logins</h3>
              <p className="text-4xl font-bold text-orange-400">{data.suspiciousLogins}</p>
              <p className="text-white/70">From unrecognized devices</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={100}>
            <LineChart data={data.trends}> 
              <Line type="monotone" dataKey="val" stroke="#60a5fa" strokeWidth={2}/>
              <XAxis dataKey="day" hide/>
              <Tooltip />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="bg-slate-900 border-slate-800 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Lock className="text-purple-400"/> Authentication & MFA Coverage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-lg text-white">MFA Enrollment</h3>
              <p className="text-4xl font-bold text-green-400">{data.mfaEnrollmentPercent}%</p>
              <p className="text-white/70">Organization-wide</p>
            </div>
            <div>
              <h3 className="text-lg text-white">Failed MFA Attempts</h3>
              <p className="text-4xl font-bold text-yellow-400">{data.failedMfaAttempts}</p>
              <p className="text-white/70">Past 24 hours</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={120}>
            <BarChart data={[{type:'MFA Success',val:520},{type:'MFA Failures',val:data.failedMfaAttempts}]}> 
              <Bar dataKey="val" fill="#818cf8" radius={[4,4,0,0]}/>
              <XAxis dataKey="type"/>
              <Tooltip />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="bg-slate-900 border-slate-800 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Users className="text-pink-400"/> Privileged Admin Accounts</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="text-white/80 text-sm list-disc pl-4">
            <li>Super Admins: <span className="text-red-400">{data.superAdmins}</span> (2 without MFA)</li>
            <li>Delegated Admins: <span className="text-yellow-400">{data.delegatedAdmins}</span></li>
            <li>Third-Party Admin Apps: <span className="text-orange-400">{data.thirdPartyAdminApps}</span></li>
          </ul>
        </CardContent>
      </Card>

      <Card className="bg-slate-900 border-slate-800 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Activity className="text-amber-400"/> Conditional Access & Context-Aware Rules</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={120}>
            <PieChart>
              <Pie dataKey="value" data={[{name:'Users Covered', value:80},{name:'Uncovered',value:20}]} cx="50%" cy="50%" outerRadius={40} fill="#38bdf8" label />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <p className="text-center text-white/80">80% of users protected by access rules</p>
        </CardContent>
      </Card>

      <Card className="bg-slate-900 border-slate-800 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Cloud className="text-green-400"/> Directory Hygiene</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="text-white/80 text-sm list-disc pl-4">
            <li>Inactive Users (&gt;90 days): 41</li>
            <li>External Guests: 23</li>
            <li>Unverified OAuth Apps: 9</li>
            <li>Shared Drives Without Owners: 6</li>
          </ul>
        </CardContent>
      </Card>

      <Card className="bg-slate-900 border-slate-800 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Key className="text-red-400"/> OAuth & API Access Risks</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="text-white/80 text-sm list-disc pl-4">
            <li>App: HRSync - Scope: <span className="text-red-400">Directory.ReadWrite</span></li>
            <li>App: FinanceBot - Scope: <span className="text-red-400">User.ReadWrite</span></li>
            <li>Service: BackupTool - Scope: <span className="text-red-400">Drive.ReadWrite</span></li>
            <li>App: ChatAI - Scope: <span className="text-red-400">Gmail.Send</span></li>
          </ul>
        </CardContent>
      </Card>

      <Card className="bg-slate-900 border-slate-800 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Mail className="text-cyan-400"/> Gmail Security Posture</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-lg text-white">Phishing Emails Detected</h3>
              <p className="text-4xl font-bold text-red-400">{data.phishingEmailsDetected}</p>
              <p className="text-white/70">Last 7 days</p>
            </div>
            <div>
              <h3 className="text-lg text-white">Unsafe Links Blocked</h3>
              <p className="text-4xl font-bold text-yellow-400">{data.unsafeLinksBlocked}</p>
              <p className="text-white/70">Across organization</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={100}>
            <LineChart data={[{day:'Mon',val:90},{day:'Tue',val:110},{day:'Wed',val:130},{day:'Thu',val:128}]}> 
              <Line type="monotone" dataKey="val" stroke="#22d3ee" strokeWidth={2}/>
              <XAxis dataKey="day" hide/>
              <Tooltip />
            </LineChart>
          </ResponsiveContainer>
          <p className="text-white/70 mt-2 text-sm">Trend of phishing detections over the past week</p>
        </CardContent>
      </Card>

      <Card className="bg-slate-900 border-slate-800 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Share2 className="text-emerald-400"/> External Sharing and Guest Access</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="text-white/80 text-sm list-disc pl-4">
            <li>Publicly shared files or folders: <span className="text-red-400">72</span> with "Anyone with the link"</li>
            <li>Shared drives allowing external members: <span className="text-yellow-400">8</span></li>
            <li>Calendars with public visibility: <span className="text-orange-400">11</span> (details exposed)</li>
            <li>Guest accounts with broad access: <span className="text-red-400">19</span> require review</li>
            <li>Excessive external invitations last 7 days: <span className="text-amber-400">134</span></li>
          </ul>
          <p className="text-white/60 text-xs mt-3">Risks: data exfiltration via open links, calendar OSINT exposure, overshared drives, and persistent guest access without lifecycle controls.</p>
        </CardContent>
      </Card>

      <Card className="col-span-3 bg-slate-900 border-slate-800 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><AlertTriangle className="text-cyan-400"/> Trends & Anomalies</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-6">
            <div>
              <h3 className="text-lg mb-2 text-white">Failed Login Trends (30 Days)</h3>
              <ResponsiveContainer width="100%" height={120}>
                <AreaChart data={[{day:'Week 1',val:30},{day:'Week 2',val:55},{day:'Week 3',val:42},{day:'Week 4',val:67}]}> 
                  <Area type="monotone" dataKey="val" stroke="#06b6d4" fill="#0ea5e9" fillOpacity={0.3}/>
                  <XAxis dataKey="day"/>
                  <Tooltip />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div>
              <h3 className="text-lg mb-2 text-white">Sensitive Scope Grants</h3>
              <ul className="text-white/80 text-sm list-disc pl-4">
                <li>Detected 4 new apps with <span className="text-red-400">Drive.FullAccess</span></li>
                <li>2 apps with <span className="text-yellow-400">Directory.Admin</span> privileges</li>
                <li>5 new user consents to unverified apps</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg mb-2 text-white">Security Score Trend</h3>
              <ResponsiveContainer width="100%" height={120}>
                <LineChart data={[{month:'Jul',score:70},{month:'Aug',score:73},{month:'Sep',score:75},{month:'Oct',score:79}]}> 
                  <Line type="monotone" dataKey="score" stroke="#22d3ee" strokeWidth={2}/>
                  <XAxis dataKey="month"/>
                  <Tooltip />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
