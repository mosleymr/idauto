
'use client'

import { useEffect, useState, useRef } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { LineChart, Line, BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Legend, Cell, AreaChart, Area } from "recharts"
import { Shield, Lock, AlertTriangle, ArrowUp, ArrowDown } from "lucide-react"
import type { IdentityData } from '@/lib/types/identity'
import Image from 'next/image'

export default function IdentityDashboard() {
  const [data, setData] = useState<IdentityData | null>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'humans' | 'nonhumans'>('humans')
  const [admins, setAdmins] = useState<any | null>(null)
  const [adminsLoading, setAdminsLoading] = useState(true)
  const [selectedAdminGroup, setSelectedAdminGroup] = useState<string | null>(null)
  // selectedAdminMembers state removed (not used currently)
  const [selectedAdminMemberObjects, setSelectedAdminMemberObjects] = useState<any[]>([])
  const [selectedAdminUsername, setSelectedAdminUsername] = useState<string | null>(null)
  const [adminDetails, setAdminDetails] = useState<any | null>(null)
  const [adminDetailsLoading, setAdminDetailsLoading] = useState(false)
  const adminScrollRef = useRef<HTMLDivElement | null>(null)
  const [thumbTop, setThumbTop] = useState(0)
  const [thumbHeight, setThumbHeight] = useState(0)
  const [thumbVisible, setThumbVisible] = useState(false)
  const thumbRef = useRef<HTMLDivElement | null>(null)
  const draggingRef = useRef(false)
  const dragCleanupRef = useRef<() => void | null>(null)

  // Risk details scroll/thumb (separate from admins)
  const riskScrollRef = useRef<HTMLDivElement | null>(null)
  const [riskThumbTop, setRiskThumbTop] = useState(0)
  const [riskThumbHeight, setRiskThumbHeight] = useState(0)
  const [riskThumbVisible, setRiskThumbVisible] = useState(false)
  const riskThumbRef = useRef<HTMLDivElement | null>(null)
  const riskDraggingRef = useRef(false)
  const riskDragCleanupRef = useRef<() => void | null>(null)

  // Risk users from external REST endpoint (moved here so hooks run unconditionally)
  const [riskUsers, setRiskUsers] = useState<any[]>([])
  const [riskLoading, setRiskLoading] = useState(true)
  const [selectedRiskUserId, setSelectedRiskUserId] = useState<string | null>(null)

  // Fetch admin/user details when an admin username is selected
  useEffect(() => {
    let mounted = true
    if (!selectedAdminUsername) return
    setAdminDetails(null)
    setAdminDetailsLoading(true)
    const fetchDetails = async () => {
      try {
        const r = await fetch(`/api/users?username=${encodeURIComponent(selectedAdminUsername)}`)
        if (!mounted) return
        if (!r.ok) {
          setAdminDetails(null)
        } else {
          const json = await r.json()
          // The RAPID endpoint may return an object or list; try to extract the first user record
          const user = Array.isArray(json) ? (json[0] || null) : (json && (json.users || json.data || json[0]) ? (json.users ? json.users[0] : (json.data ? json.data[0] : json[0])) : json)
          setAdminDetails(user || json || null)
        }
      } catch (err) {
        console.error('Error fetching admin details', err)
        if (mounted) setAdminDetails(null)
      } finally {
        if (mounted) setAdminDetailsLoading(false)
      }
    }
    fetchDetails()
    return () => { mounted = false }
  }, [selectedAdminUsername])

  const onThumbPointerDown = (clientY: number) => {
    const el = adminScrollRef.current
    if (!el) return
    draggingRef.current = true
    document.body.style.userSelect = 'none'

    const wrapperRect = el.getBoundingClientRect()
    const clientHeight = el.clientHeight
    const scrollHeight = el.scrollHeight
    const maxTop = Math.max(0, clientHeight - thumbHeight)

    const move = (pageY: number) => {
      const y = pageY - wrapperRect.top
      const clamped = Math.max(0, Math.min(y, maxTop))
      const newScrollTop = (clamped / (maxTop || 1)) * (scrollHeight - clientHeight)
      el.scrollTop = newScrollTop
    }

    const onMove = (e: MouseEvent | TouchEvent) => {
      const pageY = (e as TouchEvent).touches ? (e as TouchEvent).touches[0].clientY : (e as MouseEvent).clientY
      move(pageY)
    }

    const onUp = () => {
      draggingRef.current = false
      document.body.style.userSelect = ''
      document.removeEventListener('mousemove', onMove as any)
      document.removeEventListener('mouseup', onUp)
      document.removeEventListener('touchmove', onMove as any)
      document.removeEventListener('touchend', onUp)
    }

    document.addEventListener('mousemove', onMove as any)
    document.addEventListener('mouseup', onUp)
    document.addEventListener('touchmove', onMove as any, { passive: false } as any)
    document.addEventListener('touchend', onUp)

    // perform initial move to align to current pointer
    move(clientY)

    // keep cleanup ref (not strictly necessary but helpful)
    dragCleanupRef.current = onUp
  }

  const handleThumbMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    onThumbPointerDown(e.clientY)
  }

  const handleThumbTouchStart = (e: React.TouchEvent) => {
    e.preventDefault()
    onThumbPointerDown(e.touches[0].clientY)
  }

  const onRiskThumbPointerDown = (clientY: number) => {
    const el = riskScrollRef.current
    if (!el) return
    riskDraggingRef.current = true
    document.body.style.userSelect = 'none'

    const wrapperRect = el.getBoundingClientRect()
    const clientHeight = el.clientHeight
    const scrollHeight = el.scrollHeight
    const maxTop = Math.max(0, clientHeight - riskThumbHeight)

    const move = (pageY: number) => {
      const y = pageY - wrapperRect.top
      const clamped = Math.max(0, Math.min(y, maxTop))
      const newScrollTop = (clamped / (maxTop || 1)) * (scrollHeight - clientHeight)
      el.scrollTop = newScrollTop
    }

    const onMove = (e: MouseEvent | TouchEvent) => {
      const pageY = (e as TouchEvent).touches ? (e as TouchEvent).touches[0].clientY : (e as MouseEvent).clientY
      move(pageY)
    }

    const onUp = () => {
      riskDraggingRef.current = false
      document.body.style.userSelect = ''
      document.removeEventListener('mousemove', onMove as any)
      document.removeEventListener('mouseup', onUp)
      document.removeEventListener('touchmove', onMove as any)
      document.removeEventListener('touchend', onUp)
    }

    document.addEventListener('mousemove', onMove as any)
    document.addEventListener('mouseup', onUp)
    document.addEventListener('touchmove', onMove as any, { passive: false } as any)
    document.addEventListener('touchend', onUp)

    move(clientY)
    riskDragCleanupRef.current = onUp
  }

  const handleRiskThumbMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    onRiskThumbPointerDown(e.clientY)
  }

  const handleRiskThumbTouchStart = (e: React.TouchEvent) => {
    e.preventDefault()
    onRiskThumbPointerDown(e.touches[0].clientY)
  }

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
      .then(json => {
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
        .map((g: any) => ({ name: g.name, members: (g.members || []).filter((m: any) => m && (m.username || m.mail)) }))
        .filter((g: any) => g.members.length > 0)
        .sort((a: any, b: any) => b.members.length - a.members.length)
      if (groups.length > 0) {
        const first = groups[0]
        setSelectedAdminGroup(first.name)
        setSelectedAdminMemberObjects(first.members || [])
          // members list prepared but not stored separately (filtering currently unused)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [admins])

  // Sync custom scrollbar thumb with scroll position/size (must be before any early returns)
  useEffect(() => {
    const el = adminScrollRef.current
    if (!el) return

    const update = () => {
      const { scrollHeight, clientHeight, scrollTop } = el
      if (scrollHeight <= clientHeight) {
        setThumbVisible(false)
        return
      }
      const ratio = clientHeight / scrollHeight
      const height = Math.max(20, Math.floor(clientHeight * ratio))
      const top = Math.round((scrollTop / (scrollHeight - clientHeight)) * (clientHeight - height))
      setThumbHeight(height)
      setThumbTop(top)
      setThumbVisible(true)
    }

    update()
    el.addEventListener('scroll', update)
    window.addEventListener('resize', update)
    const ro = new ResizeObserver(update)
    ro.observe(el)

    return () => {
      el.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
      ro.disconnect()
    }
  }, [adminScrollRef, admins, selectedAdminGroup, selectedAdminMemberObjects])

  // Sync custom scrollbar thumb for risk details
  useEffect(() => {
    const el = riskScrollRef.current
    if (!el) return

    const update = () => {
      const { scrollHeight, clientHeight, scrollTop } = el
      if (scrollHeight <= clientHeight) {
        setRiskThumbVisible(false)
        return
      }
      const ratio = clientHeight / scrollHeight
      const height = Math.max(20, Math.floor(clientHeight * ratio))
      const top = Math.round((scrollTop / (scrollHeight - clientHeight)) * (clientHeight - height))
      setRiskThumbHeight(height)
      setRiskThumbTop(top)
      setRiskThumbVisible(true)
    }

    update()
    el.addEventListener('scroll', update)
    window.addEventListener('resize', update)
    const ro = new ResizeObserver(update)
    ro.observe(el)

    return () => {
      el.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
      ro.disconnect()
    }
  }, [riskScrollRef, selectedRiskUserId, riskUsers])

  // Fetch risk users for High Risk Score card
  useEffect(() => {
    let mounted = true
    setRiskLoading(true)
  fetch('/api/risk')
      .then(r => r.json())
      .then(json => {
        if (!mounted) return
        const usersRaw = (json && json.users) ? json.users : []
        const users = usersRaw.map((u: any) => {
          const riskScoreNum = Number(u.riskScore) || 0
          const riskId = u.idautoid || u.id || u.username || u.email || String(Math.random())
          return { ...u, riskScoreNum, riskId }
        })
        users.sort((a: any, b: any) => b.riskScoreNum - a.riskScoreNum)
        setRiskUsers(users)
        if (users.length > 0) setSelectedRiskUserId(users[0].riskId)
      })
      .catch(() => { if (mounted) setRiskUsers([]) })
      .finally(() => { if (mounted) setRiskLoading(false) })
    return () => { mounted = false }
  }, [])

  if (loading) return <div className="p-6">Loading identity data…</div>

  if (!data) return <div className="p-6">Error loading data</div>

  // If an admin group is selected, we could compute filtered anomalous lists (not used currently)
  // (kept logic removed to avoid unused variable lint warnings)

  // Prepare admin groups pie data (drop zeros, sort largest-first)
  const adminGroupsProcessed = (admins && admins.groups) ? (admins.groups || [])
    .map((g: any) => {
      const members = (g.members || []).filter((m: any) => m && (m.username || m.mail))
      return { name: g.name, value: members.length, members }
    })
    .filter((g: any) => g.value > 0)
    .sort((a: any, b: any) => b.value - a.value) : []

  const adminPieData = adminGroupsProcessed
  const adminColors = ['#60a5fa', '#a78bfa', '#f97316', '#34d399', '#fca5a5', '#f59e0b', '#38bdf8', '#7c3aed']

  // MFA sample data removed (not used in current cards)
      // mfaData intentionally omitted (not used in current cards)

  // Determine how MFA values are represented so we can format ticks/tooltips robustly.
  // MFA value heuristics were previously used for formatting ticks/tooltips; omitted to avoid unused helpers.
  
  
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
          <div className="flex flex-col items-center justify-center">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart margin={{ top: 8, right: 0, bottom: 0, left: 0 }}>
                {adminPieData && adminPieData.length > 0 ? (
                  <>
                    <Pie
                      data={adminPieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={4}
                      isAnimationActive={true}
                      animationDuration={800}
                      animationEasing="ease-in-out"
                      label={false}
                      labelLine={false}
                      onClick={(entry: any) => {
                        const payload = entry && entry.payload ? entry.payload : entry
                        if (payload && payload.name) {
                          setSelectedAdminGroup(payload.name)
                          const memberObjs = (payload.members || [])
                          setSelectedAdminMemberObjects(memberObjs)
                          // members computed (not stored)
                        }
                      }}
                    >
                      {adminPieData.map((slice: any, i: number) => (
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
            <div className="mt-2 text-sm text-white/70">Selected group: <span className="font-medium text-white">{selectedAdminGroup || '—'}</span></div>
          </div>

          <div className="flex flex-col max-h-[200px] relative admin-scroll-wrapper">
            <div ref={adminScrollRef} className="overflow-y-auto admin-scroll-content admin-scroll max-h-[200px]">
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
                          <td className="py-1 text-xs">
                            {username ? (
                              <button
                                type="button"
                                onClick={() => setSelectedAdminUsername(username)}
                                className={`text-left w-full text-sm ${selectedAdminUsername === username ? 'underline' : 'hover:underline'}`}
                              >
                                {username}
                              </button>
                            ) : '—'}
                          </td>
                        </tr>
                      )
                    })
                  })()}
              </tbody>
            </table>
              </div>
              {/* custom scrollbar thumb (positioned overlay) */}
              <div
                aria-hidden
                ref={thumbRef}
                onMouseDown={handleThumbMouseDown}
                onTouchStart={handleThumbTouchStart}
                className="absolute right-2 w-2 rounded-full admin-scroll-thumb"
                style={{ height: `${thumbHeight}px`, transform: `translateY(${thumbTop}px)`, opacity: thumbVisible ? 1 : 0, cursor: thumbVisible ? 'grab' : 'default' }}
              />
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
            <CardTitle className="flex items-center gap-2"><Shield className="text-blue-400"/> Privileged Users</CardTitle>
          </CardHeader>
        <CardContent>
          {adminContent}

          {selectedAdminUsername ? (
            <div className="mt-4 p-3 bg-slate-850 rounded relative">
              <div className="flex items-center justify-between mb-2">
                <div className="font-medium">Details: {selectedAdminUsername}</div>
                <div>
                  <button type="button" onClick={() => { setSelectedAdminUsername(null); setAdminDetails(null) }} className="text-xs text-white/60 hover:text-white">Close</button>
                </div>
              </div>
              {adminDetailsLoading ? (
                <div className="text-sm text-white/70">Loading details…</div>
              ) : adminDetails ? (
                <div className="text-sm text-white/80">
                  {(() => {
                    const name = adminDetails.name || adminDetails.displayName || adminDetails.username || '—'
                    const email = adminDetails.email || adminDetails.mail || '—'
                    const riskScore = adminDetails.riskScore ?? adminDetails.riskScoreNum ?? adminDetails.risk ?? '—'
                    const riskField = adminDetails.risk ?? adminDetails.risks ?? adminDetails.riskDetail ?? '—'
                    return (
                      <>
                        <div className="mb-1"><span className="text-white/70">Name: </span><span className="font-medium">{name}</span></div>
                        <div className="mb-1"><span className="text-white/70">Email: </span><span className="font-medium">{email}</span></div>
                        <div className="mb-1"><span className="text-white/70">Risk score: </span><span className="font-medium">{String(riskScore)}</span></div>
                        <div className="mb-1"><span className="text-white/70">Risk: </span><span className="font-medium">{typeof riskField === 'string' ? riskField : JSON.stringify(riskField)}</span></div>
                      </>
                    )
                  })()}
                </div>
              ) : (
                <div className="text-sm text-white/70">No details available</div>
              )}
            </div>
          ) : null}
        </CardContent>
      </Card>

      {/* keep High Risk Score immediately after Privileged Users (moved) */}
      <Card className="bg-slate-900 border-slate-800 text-white col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Shield className="text-blue-400"/> High Risk Score</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="border-r border-white/5 pr-3">
              <h4 className="text-sm text-white/80 mb-2">Identity</h4>
              {riskLoading ? (
                <div className="text-sm text-white/70">Loading…</div>
              ) : ( (riskUsers || []).length === 0 ? (
                <div className="text-sm text-white/70">No risk data available</div>
              ) : (
                <ul className="text-sm text-white/80">
                  {(riskUsers || []).slice(0,5).map((u: any) => (
                    <li key={u.riskId}>
                      <button
                        type="button"
                        onClick={() => setSelectedRiskUserId(u.riskId)}
                        className={`w-full text-left py-2 px-1 rounded ${selectedRiskUserId === u.riskId ? 'bg-slate-800' : 'hover:bg-slate-850'}`}
                      >
                        <div className="flex items-center gap-1">
                          <span className="font-medium">{u.username || u.email || u.name || 'unknown'}</span>
                          <span className="text-xs text-white/70">{u.riskScore ?? u.riskScoreNum}</span>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              ))}
            </div>
            <div className="pl-3">
              <h4 className="text-sm text-white/80 mb-2">Details</h4>
              <div className="admin-scroll-wrapper relative h-56 overflow-hidden pr-6">
                <div ref={riskScrollRef} className="admin-scroll-content h-full overflow-y-auto pr-0">
                  {selectedRiskUserId ? (
                    (() => {
                      const u = (riskUsers || []).find((x: any) => x.riskId === selectedRiskUserId)
                      if (!u) return <div className="text-sm text-white/70">No user selected</div>
                      return (
                        <div className="text-sm text-white/80">
                          <div className="mb-2"><span className="text-white/70">Username: </span><span className="font-medium">{u.username || u.email || u.name}</span></div>
                          <div className="mb-2"><span className="text-white/70">Risk score: </span><span className="font-medium">{u.riskScore ?? u.riskScoreNum}</span></div>
                          <div className="whitespace-pre-wrap text-xs text-white/70">{u.riskDetail || u.notes || 'No additional details'}</div>
                        </div>
                      )
                    })()
                  ) : (
                    <div className="text-sm text-white/70">Select a user to view details</div>
                  )}
                </div>
                <div
                  aria-hidden
                  ref={riskThumbRef}
                  onMouseDown={handleRiskThumbMouseDown}
                  onTouchStart={handleRiskThumbTouchStart}
                  className="absolute right-2 w-2 rounded-full admin-scroll-thumb"
                  style={{ height: `${riskThumbHeight}px`, top: `${riskThumbTop}px`, opacity: riskThumbVisible ? 1 : 0, cursor: riskThumbVisible ? 'grab' : 'default' }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Investigations: summary metrics + lists (new) */}
      <Card className="col-span-3 bg-slate-900 border-slate-800 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><AlertTriangle className="text-amber-400"/> Investigations</CardTitle>
        </CardHeader>
        <CardContent>
          {(() => {
            const summary = { openAlerts: 42, usersWithAlerts: 18, investigations: 9 }
            const investigations = [
              { id: 'inv-1', username: 'alice@example.com', type: 'high_risk_user' },
              { id: 'inv-2', username: 'bob@example.com', type: 'high_risk_user' },
              { id: 'inv-3', username: 'carol@example.com', type: 'high_risk_user' },
            ]
            const usersWithOpenAlerts = [
              { id: 'u-1', username: 'dave@example.com', alerts: 3 },
              { id: 'u-2', username: 'eve@example.com', alerts: 2 },
              { id: 'u-3', username: 'mallory@example.com', alerts: 1 },
            ]
            return (
              <>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="bg-slate-800 p-3 rounded">
                    <div className="text-sm text-white/70">Open alerts</div>
                    <div className="text-2xl font-bold text-red-400">{summary.openAlerts}</div>
                  </div>
                  <div className="bg-slate-800 p-3 rounded">
                    <div className="text-sm text-white/70">Users with alerts</div>
                    <div className="text-2xl font-bold text-yellow-400">{summary.usersWithAlerts}</div>
                  </div>
                  <div className="bg-slate-800 p-3 rounded">
                    <div className="text-sm text-white/70">Current investigations</div>
                    <div className="text-2xl font-bold text-green-400">{summary.investigations}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm text-white/80 mb-2">Current investigations</h4>
                    <ul className="space-y-2 text-sm text-white/80">
                      {investigations.map((i) => (
                        <li key={i.id} className="p-2 bg-slate-850 rounded flex items-center justify-between">
                          <div>
                            <div className="font-medium">{i.username}</div>
                            <div className="text-xs text-white/70">Type: {i.type}</div>
                          </div>
                          <div className="text-xs text-white/70">ID: {i.id}</div>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-sm text-white/80 mb-2">Users with open alerts</h4>
                    <ul className="space-y-2 text-sm text-white/80">
                      {usersWithOpenAlerts.map((u) => (
                        <li key={u.id} className="p-2 bg-slate-850 rounded flex items-center justify-between">
                          <div>
                            <div className="font-medium">{u.username}</div>
                            <div className="text-xs text-white/70">Open alerts: {u.alerts}</div>
                          </div>
                          <div className="text-xs text-white/70">Profile</div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </>
            )
          })()}
        </CardContent>
      </Card>

      {/* Trends & Anomalies remains a full row; the smaller summary cards are moved below it */}
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
              <h3 className="text-lg mb-2 text-white">Multi-Factor Authentication</h3>
              <div className="grid grid-cols-1 gap-2">
                <div>
                  <p className="text-sm text-white/70">MFA Enrollment</p>
                  <p className="text-2xl font-bold text-green-400">88%</p>
                </div>
                <div>
                  <p className="text-sm text-white/70">Failed MFA Attempts</p>
                  <p className="text-2xl font-bold text-yellow-400">27</p>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-lg mb-2 text-white">PhishID — Last 7 days</h3>
              {(() => {
                const phishData = [
                  { day: 'Mon', detects: 18 },
                  { day: 'Tue', detects: 22 },
                  { day: 'Wed', detects: 30 },
                  { day: 'Thu', detects: 25 },
                  { day: 'Fri', detects: 20 },
                  { day: 'Sat', detects: 16 },
                  { day: 'Sun', detects: 23 },
                ]
                const today = phishData[phishData.length - 1].detects
                const prev = phishData[phishData.length - 2]?.detects ?? 0
                const delta = today - prev
                const TrendIcon = delta >= 0 ? ArrowUp : ArrowDown
                const trendColor = delta >= 0 ? 'text-red-400' : 'text-green-400'
                return (
                  <>
                    <div className="mb-2 flex items-center gap-3">
                      <span className="text-sm text-white/70">Blocked Phishing Today:</span>
                      <span className={`flex items-center gap-2 ml-2 text-2xl font-bold ${trendColor}`}>
                        <TrendIcon className="w-5 h-5" />
                        <span>{today}</span>
                      </span>
                    </div>
                    <ResponsiveContainer width="100%" height={120}>
                      <LineChart data={phishData} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
                        <Line type="monotone" dataKey="detects" stroke="#f43f5e" strokeWidth={2} dot={{ r: 2 }} />
                        <XAxis dataKey="day" tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }} />
                        <Tooltip />
                      </LineChart>
                    </ResponsiveContainer>
                  </>
                )
              })()}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Identities by type (human / non-human) - moved below Trends */}
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
          <CardTitle className="flex items-center gap-2"><Shield className="text-red-400" /> PhishID Protection</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            <div className="flex flex-col items-start">
              <h4 className="text-base text-white">Phishing Detections</h4>
              <p className="text-2xl font-bold text-red-400">134</p>
              <p className="text-white/70">Past 30 days</p>
            </div>
            <div className="flex flex-col items-start">
              <h4 className="text-base text-white">Blocked Attempts</h4>
              <p className="text-2xl font-bold text-green-400">129</p>
              <p className="text-white/70">Prevented by PhishID</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-900 border-slate-800 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Lock className="text-purple-400"/> Multi-Factor Authentication</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-lg text-white">MFA Enrollment</h3>
              <p className="text-4xl font-bold text-green-400">88%</p>
              <p className="text-white/70">Organization-wide</p>
            </div>
            <div>
              <h3 className="text-lg text-white">Failed MFA Attempts</h3>
              <p className="text-4xl font-bold text-yellow-400">27</p>
              <p className="text-white/70">Past 24 hours</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={120}>
            <BarChart data={[{type:'MFA Success',val:520},{type:'MFA Failures',val:27}]}> 
              <Bar dataKey="val" fill="#818cf8" radius={[4,4,0,0]}/>
              <XAxis dataKey="type"/>
              <Tooltip />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

    </div>
  )
}
