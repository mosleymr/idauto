'use client'

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { LineChart, Line, PieChart, Pie, BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts"
import { Shield, Users, Lock, AlertTriangle, Activity, Globe, TrendingUp } from "lucide-react"
import { motion } from "framer-motion"
import Image from 'next/image'

export default function AzureADSecurityDashboard() {
  return (
    <div className="p-6 grid grid-cols-3 gap-6 bg-slate-950 text-white min-h-screen">
      <motion.div className="col-span-3 mb-2 flex items-center" initial={{opacity:0, y:-10}} animate={{opacity:1, y:0}}>
        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-1">Azure AD Security Overview</h1>
          <p className="text-slate-400">Identity and Access Threat Dashboard for CISOs</p>
        </div>
        <div className="ml-4">
          <Image src="/idauto_light.png" alt="idauto logo" width={60} height={60} className="h-[60px] w-auto" />
        </div>
      </motion.div>

  <Card title="Overview of users that represent a high risk based on inappropriate permissions, non-compliant passwords or other factors" className="bg-slate-900 border-slate-800 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Shield className="text-blue-400"/> Identity Threat Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-lg text-white">High-Risk Users</h3>
              <p className="text-4xl font-bold text-red-400">12</p>
              <p className="text-white/70">+3 this week</p>
            </div>
            <div>
              <h3 className="text-lg text-white">Leaked Credentials</h3>
              <p className="text-4xl font-bold text-orange-400">8</p>
              <p className="text-white/70">Detected via threat feed</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={100}>
            <LineChart data={[{day:'Mon',val:5},{day:'Tue',val:7},{day:'Wed',val:9},{day:'Thu',val:12}]}> 
              <Line type="monotone" dataKey="val" stroke="#60a5fa" strokeWidth={2}/>
              <XAxis dataKey="day" hide/>
              <Tooltip />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

  <Card title="Summary of rates of MFA adoption versus legacy authentication" className="bg-slate-900 border-slate-800 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Lock className="text-purple-400"/> Authentication & Access</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-lg text-white">MFA Adoption</h3>
              <p className="text-4xl font-bold text-green-400">92%</p>
            </div>
            <div>
              <h3 className="text-lg text-white">Legacy Auth Usage</h3>
              <p className="text-4xl font-bold text-yellow-400">5%</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={120}>
            <BarChart data={[{type:'Modern',val:1200},{type:'Legacy',val:80}]}> 
              <Bar dataKey="val" fill="#818cf8" radius={[4,4,0,0]}/>
              <XAxis dataKey="type"/>
              <Tooltip />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

  <Card title="Excessive permissions and use of PIM for admin access" className="bg-slate-900 border-slate-800 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Users className="text-pink-400"/> Privileged Access</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-lg text-white">Global Admins</h3>
              <p className="text-4xl font-bold text-red-400">4</p>
              <p className="text-white/70">Permanent access</p>
            </div>
            <div>
              <h3 className="text-lg text-white">PIM Activations (7d)</h3>
              <p className="text-4xl font-bold text-blue-400">23</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-900 border-slate-800 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Activity className="text-amber-400"/> Conditional Access</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={120}>
            <PieChart>
              <Pie dataKey="value" data={[{name:'Compliant', value:85},{name:'Uncovered',value:15}]} cx="50%" cy="50%" outerRadius={40} fill="#38bdf8" label />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <p className="text-center text-white/80">85% CA Policy Coverage</p>
        </CardContent>
      </Card>

      <Card className="bg-slate-900 border-slate-800 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Globe className="text-green-400"/> Directory Hygiene</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="text-white/80 text-sm list-disc pl-4">
            <li>102 Inactive accounts (≥30 days)</li>
            <li>37 Inactive accounts (≥90 days)</li>
            <li>12 Guest users with elevated access</li>
            <li>6 Apps with unverified OAuth consent</li>
          </ul>
        </CardContent>
      </Card>

      <Card className="bg-slate-900 border-slate-800 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><AlertTriangle className="text-red-400"/> Threat Intelligence</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={100}>
            <LineChart data={[{day:'Mon',attacks:2},{day:'Tue',attacks:3},{day:'Wed',attacks:5},{day:'Thu',attacks:1}]}> 
              <Line type="monotone" dataKey="attacks" stroke="#f87171" strokeWidth={2}/>
              <XAxis dataKey="day" hide/>
              <Tooltip />
            </LineChart>
          </ResponsiveContainer>
          <p className="text-white/80 text-sm mt-1">Detected password spray attempts</p>
        </CardContent>
      </Card>

      <Card className="col-span-3 bg-slate-900 border-slate-800 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><TrendingUp className="text-cyan-400"/> Trends & Anomalies</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-6">
            <div>
              <h3 className="text-lg mb-2 text-white">MFA Failure Rate (30 Days)</h3>
              <ResponsiveContainer width="100%" height={120}>
                <AreaChart data={[{day:'Week 1',val:4},{day:'Week 2',val:6},{day:'Week 3',val:8},{day:'Week 4',val:3}]}> 
                  <Area type="monotone" dataKey="val" stroke="#06b6d4" fill="#0ea5e9" fillOpacity={0.3}/>
                  <XAxis dataKey="day"/>
                  <Tooltip />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div>
              <h3 className="text-lg mb-2 text-white">Excessive Application Permissions</h3>
              <ul className="text-white/80 text-sm list-disc pl-4">
                <li>Service Principal: GraphSync - Delegated: <span className="text-red-400">Directory.ReadWrite.All</span></li>
                <li>Enterprise App: HR Connector - Application: <span className="text-red-400">User.ReadWrite.All</span></li>
                <li>Service Principal: FinanceAPI - Delegated: <span className="text-red-400">Directory.ReadWrite.All</span></li>
                <li>Enterprise App: DevOps Bot - Application: <span className="text-red-400">User.ReadWrite.All</span></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg mb-2 text-white">Secure Score Trend</h3>
              <ResponsiveContainer width="100%" height={120}>
                <LineChart data={[{month:'Jul',score:68},{month:'Aug',score:71},{month:'Sep',score:74},{month:'Oct',score:78}]}> 
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
