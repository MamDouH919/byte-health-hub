

import { useState, useRef, useEffect, useCallback } from "react"
import {
  ChevronDown,
  ChevronUp,
  Heart,
  Activity,
  Moon,
  User,
  Footprints,
  Bandage,
  X,
  GripHorizontal,
  TrendingUp,
  TrendingDown,
  Minus,
  FileText,
  ChevronRight,
  Clock,
} from "lucide-react"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  RadialBarChart,
  RadialBar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts"
import { cn } from "@/lib/utils"

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type MetricStatus  = "ok" | "attention"
type MetricKey     = "rhr" | "steps" | "sleep" | "hrv"
type InjuryStatus  = "active" | "recovering" | "cleared"
type ReadinessLevel = "low" | "medium" | "high"

type Injury = { label: string; status: InjuryStatus; note: string }
type TrendDir = "up" | "down" | "flat"

/* ------------------------------------------------------------------ */
/*  Profile data                                                       */
/* ------------------------------------------------------------------ */

const PROFILE = {
  name:    "Ahmed Hassan",
  age:     34,
  gender:  "Male",
  bodyComp: { weight: "88 kg", bf: "27% BF", smm: "32 kg SMM", bmi: "28.4", visceralFat: "12" },
  // Single source of truth for bio age
  bioAge:  { value: 39.2, delta: +5.2 },
  rhr:     "72 bpm",
  steps:   "5,200 steps/day",
  sleep:   { score: 63, avg: "6h 10m avg" },
  hrv:     { value: "42 ms", score: 58 },

  // Coach essentials
  coachEssentials: {
    avoid:      ["Deep squats", "Plyometrics"],
    allowed:    ["Upper body", "Swimming"],
    goal:       "Return to play",
    readiness:  "medium" as ReadinessLevel,
  },

  injuries: [
    { label: "ACL Tear — Left Knee",      status: "recovering" as InjuryStatus, note: "Post-op month 4" },
    { label: "Meniscus Tear — Right Knee", status: "active"    as InjuryStatus, note: "Avoid deep squats" },
  ] satisfies Injury[],

  doctorNotes: [
    { id: "dn-1", date: "2025-03-28", doctor: "Dr. Al-Rashid", type: "Orthopedic" as const, summary: "ACL rehab progressing well. Cleared for light cycling and pool work. Continue avoiding lateral movements for 4 more weeks.", flagged: true },
    { id: "dn-2", date: "2025-03-14", doctor: "Dr. Khoury", type: "Sports Medicine" as const, summary: "Right knee MRI shows meniscus inflammation. Prescribed anti-inflammatory protocol. No deep squats or loaded knee flexion beyond 90°.", flagged: true },
    { id: "dn-3", date: "2025-02-20", doctor: "Dr. Al-Rashid", type: "Orthopedic" as const, summary: "Post-op month 3 review. ROM improving — flexion at 125°. Added resistance band exercises to home program.", flagged: false },
    { id: "dn-4", date: "2025-01-30", doctor: "Dr. Hassan", type: "General" as const, summary: "Blood panel normal. Vitamin D slightly low — supplementation recommended. Sleep quality discussion — referred to sleep clinic.", flagged: false },
    { id: "dn-5", date: "2025-01-10", doctor: "Dr. Al-Rashid", type: "Orthopedic" as const, summary: "Post-op month 2. Graft healing on track. Begin weight-bearing exercises with brace. Physical therapy 3x/week.", flagged: false },
    { id: "dn-6", date: "2024-12-05", doctor: "Dr. Khoury", type: "Sports Medicine" as const, summary: "Initial meniscus assessment. Conservative management recommended. Monitor for 6 weeks before considering surgical options.", flagged: false },
  ],
}

/* ------------------------------------------------------------------ */
/*  Trend + freshness data (mock)                                      */
/* ------------------------------------------------------------------ */

const TILE_META: Record<MetricKey, { sync: string; trend: TrendDir; trendLabel: string }> = {
  rhr:   { sync: "Today 09:10",  trend: "down",  trendLabel: "↓2 this week" },
  steps: { sync: "Today 08:55",  trend: "up",    trendLabel: "↑12% this week" },
  sleep: { sync: "Today 07:30",  trend: "down",  trendLabel: "↓0.4h this week" },
  hrv:   { sync: "Today 09:10",  trend: "flat",  trendLabel: "Stable" },
}

/* ------------------------------------------------------------------ */
/*  Historical chart data                                              */
/* ------------------------------------------------------------------ */

const RHR_DATA   = [74,71,73,76,72,69,72].map((bpm,i)=>({day:["Mon","Tue","Wed","Thu","Fri","Sat","Sun"][i],bpm}))
const STEPS_DATA = [6200,4800,7100,3900,5500,4200,5200].map((steps,i)=>({day:["Mon","Tue","Wed","Thu","Fri","Sat","Sun"][i],steps}))
const SLEEP_DATA = [6.5,5.8,7.0,6.0,5.5,6.8,6.2].map((hours,i)=>({day:["Mon","Tue","Wed","Thu","Fri","Sat","Sun"][i],hours,score:[68,55,72,60,51,67,63][i]}))
const HRV_DATA   = [38,41,44,40,42,45,42].map((ms,i)=>({day:["Mon","Tue","Wed","Thu","Fri","Sat","Sun"][i],ms}))

/* ------------------------------------------------------------------ */
/*  Chart components                                                   */
/* ------------------------------------------------------------------ */

// Resolve design-system tokens to recharts-friendly color strings.
// Recharts accepts any CSS color, including hsl(var(...)).
const C = {
  grid:   "hsl(var(--surface-border))",
  axis:   "hsl(var(--muted-foreground))",
  border: "hsl(var(--border))",
  rhr:    "hsl(var(--trend-down))",       // heart rate → critical/red token family
  steps:  "hsl(var(--brand-blue))",
  sleep:  "hsl(var(--spec-physio-fg))",   // purple physio token
  hrv:    "hsl(var(--trend-up))",         // green
}
const TOOLTIP_STYLE = { fontSize: 12, borderRadius: 8, border: `1px solid ${C.border}`, background: "hsl(var(--popover))", color: "hsl(var(--popover-foreground))" }

function RHRChart() {
  return (
    <ResponsiveContainer width="100%" height={160}>
      <LineChart data={RHR_DATA} margin={{top:8,right:8,left:-24,bottom:0}}>
        <CartesianGrid strokeDasharray="3 3" stroke={C.grid}/>
        <XAxis dataKey="day" tick={{fontSize:11, fill: C.axis}}/>
        <YAxis domain={[60,85]} tick={{fontSize:11, fill: C.axis}}/>
        <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v:number)=>[`${v} bpm`,"RHR"]}/>
        <ReferenceLine y={72} stroke={C.rhr} strokeDasharray="4 2" strokeOpacity={0.4}/>
        <Line type="monotone" dataKey="bpm" stroke={C.rhr} strokeWidth={2} dot={{r:3,fill:C.rhr}} activeDot={{r:5}}/>
      </LineChart>
    </ResponsiveContainer>
  )
}

function StepsChart() {
  return (
    <ResponsiveContainer width="100%" height={160}>
      <BarChart data={STEPS_DATA} margin={{top:8,right:8,left:-24,bottom:0}}>
        <CartesianGrid strokeDasharray="3 3" stroke={C.grid} vertical={false}/>
        <XAxis dataKey="day" tick={{fontSize:11, fill: C.axis}}/>
        <YAxis tick={{fontSize:11, fill: C.axis}}/>
        <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v:number)=>[v.toLocaleString(),"Steps"]}/>
        <ReferenceLine y={7500} stroke={C.steps} strokeDasharray="4 2" strokeOpacity={0.4} label={{value:"Goal",fontSize:10,fill:C.axis}}/>
        <Bar dataKey="steps" fill={C.steps} radius={[4,4,0,0]}/>
      </BarChart>
    </ResponsiveContainer>
  )
}

function SleepChart() {
  return (
    <ResponsiveContainer width="100%" height={160}>
      <AreaChart data={SLEEP_DATA} margin={{top:8,right:8,left:-24,bottom:0}}>
        <defs>
          <linearGradient id="sleepGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={C.sleep} stopOpacity={0.25}/>
            <stop offset="95%" stopColor={C.sleep} stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={C.grid}/>
        <XAxis dataKey="day" tick={{fontSize:11, fill: C.axis}}/>
        <YAxis domain={[4,9]} tick={{fontSize:11, fill: C.axis}}/>
        <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v:number)=>[`${v}h`,"Sleep"]}/>
        <ReferenceLine y={7} stroke={C.sleep} strokeDasharray="4 2" strokeOpacity={0.4} label={{value:"Target",fontSize:10,fill:C.axis}}/>
        <Area type="monotone" dataKey="hours" stroke={C.sleep} strokeWidth={2} fill="url(#sleepGrad)" dot={{r:3,fill:C.sleep}}/>
      </AreaChart>
    </ResponsiveContainer>
  )
}

function HRVChart() {
  return (
    <ResponsiveContainer width="100%" height={160}>
      <LineChart data={HRV_DATA} margin={{top:8,right:8,left:-24,bottom:0}}>
        <CartesianGrid strokeDasharray="3 3" stroke={C.grid}/>
        <XAxis dataKey="day" tick={{fontSize:11, fill: C.axis}}/>
        <YAxis domain={[30,55]} tick={{fontSize:11, fill: C.axis}}/>
        <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v:number)=>[`${v} ms`,"HRV"]}/>
        <ReferenceLine y={42} stroke={C.hrv} strokeDasharray="4 2" strokeOpacity={0.4}/>
        <Line type="monotone" dataKey="ms" stroke={C.hrv} strokeWidth={2} dot={{r:3,fill:C.hrv}} activeDot={{r:5}}/>
      </LineChart>
    </ResponsiveContainer>
  )
}

/* ------------------------------------------------------------------ */
/*  Chart configs                                                      */
/* ------------------------------------------------------------------ */

interface ChartConfig { key: MetricKey; title: string; subtitle: string }

const CHART_CONFIGS: Record<MetricKey, ChartConfig> = {
  rhr:   { key:"rhr",   title:"Resting Heart Rate", subtitle:"7-day trend (bpm)" },
  steps: { key:"steps", title:"Daily Activity",      subtitle:"7-day steps count" },
  sleep: { key:"sleep", title:"Sleep Quality",       subtitle:"7-day hours & score" },
  hrv:   { key:"hrv",   title:"HRV / Readiness",     subtitle:"7-day HRV (ms)" },
}

/* ------------------------------------------------------------------ */
/*  Chart modal                                                        */
/* ------------------------------------------------------------------ */

function ChartModal({ config, onClose }: { config: ChartConfig; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-end p-5" onClick={onClose}>
      <div className="w-80 rounded-2xl border border-border bg-card shadow-2xl" onClick={e=>e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div>
            <p className="text-sm font-semibold text-card-foreground">{config.title}</p>
            <p className="text-[11px] text-muted-foreground">{config.subtitle}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1 hover:bg-accent">
            <X className="size-4 text-muted-foreground"/>
          </button>
        </div>
        <div className="px-4 py-4">
          {config.key==="rhr"   && <RHRChart/>}
          {config.key==="steps" && <StepsChart/>}
          {config.key==="sleep" && <SleepChart/>}
          {config.key==="hrv"   && <HRVChart/>}
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Trend icon                                                         */
/* ------------------------------------------------------------------ */

function TrendIcon({ dir }: { dir: TrendDir }) {
  if (dir === "up")   return <TrendingUp   className="size-2.5 text-[hsl(var(--status-optimal-fg))]"/>
  if (dir === "down") return <TrendingDown className="size-2.5 text-[hsl(var(--status-critical-fg))]"/>
  return <Minus className="size-2.5 text-muted-foreground"/>
}

/* ------------------------------------------------------------------ */
/*  MetricTile                                                         */
/* ------------------------------------------------------------------ */

function MetricTile({
  icon, label, value, sub, subStatus, metricKey, onOpen,
}: {
  icon: React.ReactNode
  label: string
  value: string
  sub?: string
  subStatus?: MetricStatus
  metricKey: MetricKey
  onOpen: (k: MetricKey) => void
}) {
  const meta = TILE_META[metricKey]
  return (
    <button
      type="button"
      onClick={() => onOpen(metricKey)}
      className="group flex flex-col rounded-lg border border-border bg-background px-2.5 py-2 text-left transition-all hover:border-foreground/25 hover:shadow-sm active:scale-[0.98]"
    >
      {/* label row */}
      <div className="mb-0.5 flex items-center gap-1 text-[10px] text-muted-foreground">
        {icon}
        <span>{label}</span>
        <span className="ml-auto flex items-center gap-0.5 text-[9px]">
          <TrendIcon dir={meta.trend}/>
          <span className={cn(
            meta.trend === "up"   ? "text-[hsl(var(--status-optimal-fg))]" :
            meta.trend === "down" ? "text-[hsl(var(--status-critical-fg))]" : "text-muted-foreground"
          )}>{meta.trendLabel}</span>
        </span>
      </div>
      {/* value */}
      <p className="text-xs font-semibold text-card-foreground">{value}</p>
      {sub && (
        <p className={cn("text-[10px]", subStatus==="attention" ? "text-[hsl(var(--status-normal-fg))] font-medium" : "text-muted-foreground")}>
          {sub}
        </p>
      )}
      {/* last sync */}
      <p className="mt-0.5 text-[9px] text-muted-foreground/50">{meta.sync}</p>
    </button>
  )
}


/* ------------------------------------------------------------------ */
/*  Body Composition strip (replaces Coach Essentials labels)          */
/* ------------------------------------------------------------------ */

function BodyCompStrip() {
  const { weight, bf, bmi, visceralFat } = PROFILE.bodyComp
  const bmiVal = parseFloat(bmi)
  const vfVal = parseInt(visceralFat)
  const bmiStatus = bmiVal >= 30 ? "text-destructive" : bmiVal >= 25 ? "text-[hsl(var(--status-normal-fg))]" : "text-[hsl(var(--status-optimal-fg))]"
  const vfStatus = vfVal >= 13 ? "text-destructive" : vfVal >= 10 ? "text-[hsl(var(--status-normal-fg))]" : "text-[hsl(var(--status-optimal-fg))]"

  return (
    <div className="grid grid-cols-4 gap-px border-b border-border bg-border">
      {[
        { label: "Weight", value: weight },
        { label: "Body Fat", value: bf },
        { label: "BMI", value: bmi, className: bmiStatus },
        { label: "Visceral Fat", value: visceralFat, className: vfStatus },
      ].map((item) => (
        <div key={item.label} className="flex flex-col items-center justify-center bg-card px-2 py-1.5">
          <span className="text-[9px] uppercase tracking-wide text-muted-foreground">{item.label}</span>
          <span className={cn("text-xs font-semibold text-card-foreground", item.className)}>{item.value}</span>
        </div>
      ))}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Injury row                                                         */
/* ------------------------------------------------------------------ */

const INJURY_STATUS_STYLES: Record<InjuryStatus,{badge:string}> = {
  active:     { badge:"bg-[hsl(var(--status-critical-bg))] text-[hsl(var(--status-critical-fg))] border-[hsl(var(--status-critical-bg))]" },
  recovering: { badge:"bg-[hsl(var(--status-normal-bg))] text-[hsl(var(--status-normal-fg))] border-[hsl(var(--status-normal-bg))]" },
  cleared:    { badge:"bg-[hsl(var(--status-optimal-bg))] text-[hsl(var(--status-optimal-fg))] border-[hsl(var(--status-optimal-bg))]" },
}

function InjuryRow({ injury }: { injury: Injury }) {
  const s = INJURY_STATUS_STYLES[injury.status]
  return (
    <div className="flex items-start gap-2 rounded-lg border border-border bg-background px-3 py-2">
      <Bandage className="mt-0.5 size-3 shrink-0 text-muted-foreground"/>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-medium text-card-foreground leading-tight">{injury.label}</p>
        <p className="text-[10px] text-muted-foreground">{injury.note}</p>
      </div>
      <span className={cn("shrink-0 rounded-full border px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide", s.badge)}>
        {injury.status}
      </span>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Doctor's Notes Section                                             */
/* ------------------------------------------------------------------ */

const NOTE_TYPE_STYLES: Record<string, string> = {
  Orthopedic: "bg-[hsl(var(--tag-athlete-bg))] text-[hsl(var(--tag-athlete-fg))] border-[hsl(var(--tag-athlete-bg))]",
  "Sports Medicine": "bg-[hsl(var(--tag-inbody-bg))] text-[hsl(var(--tag-inbody-fg))] border-[hsl(var(--tag-inbody-bg))]",
  General: "bg-secondary text-secondary-foreground border-border",
}

function DoctorNotesSection() {
  const [expanded, setExpanded] = useState(false)
  const [selectedNote, setSelectedNote] = useState<string | null>(null)
  const notes = PROFILE.doctorNotes
  const visible = expanded ? notes : notes.slice(0, 2)

  return (
    <div>
      <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1">
        <FileText className="size-3.5" /> User History
      </p>
      <div className="space-y-1.5">
        {visible.map((note) => (
          <button
            key={note.id}
            type="button"
            onClick={() => setSelectedNote(selectedNote === note.id ? null : note.id)}
            className={cn(
              "w-full text-left rounded-lg border px-3 py-2 transition-all",
              selectedNote === note.id
                ? "border-foreground/20 bg-accent shadow-sm"
                : "border-border bg-background hover:border-foreground/15 hover:shadow-sm"
            )}
          >
            {/* Top row: date + type badge */}
            <div className="flex items-center gap-1.5 mb-0.5">
              <Clock className="size-2.5 text-muted-foreground" />
              <span className="text-[10px] text-muted-foreground">{note.date}</span>
              <span className={cn("rounded-full border px-1.5 py-px text-[8px] font-semibold uppercase tracking-wide", NOTE_TYPE_STYLES[note.type] ?? NOTE_TYPE_STYLES.General)}>
                {note.type}
              </span>
              {note.flagged && (
                <span className="ml-auto size-1.5 rounded-full bg-[hsl(var(--status-normal-fg))] shrink-0" />
              )}
              <ChevronRight className={cn("size-3 text-muted-foreground transition-transform ml-auto shrink-0", selectedNote === note.id && "rotate-90")} />
            </div>
            {/* Doctor name */}
            <p className="text-[11px] font-medium text-card-foreground leading-tight">{note.doctor}</p>
            {/* Summary — truncated or full */}
            <p className={cn("text-[10px] text-muted-foreground mt-0.5 leading-relaxed", selectedNote !== note.id && "line-clamp-1")}>
              {note.summary}
            </p>
          </button>
        ))}
      </div>
      {notes.length > 2 && (
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="mt-1.5 text-[10px] font-medium text-primary hover:underline"
        >
          {expanded ? "Show less" : `View all ${notes.length} notes`}
        </button>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  AthleteProfileCard                                                 */
/* ------------------------------------------------------------------ */

type ViewState = "min" | "collapsed" | "expanded"

const CARD_MARGIN = 12
const QUARTER_WIDTH_RATIO = 0.38   // ~38% of viewport width
const QUARTER_HEIGHT_RATIO = 0.52  // ~52% of viewport height

function clampPos(x: number, y: number, w: number, h: number) {
  const vw = window.innerWidth
  const vh = window.innerHeight
  return {
    x: Math.max(CARD_MARGIN, Math.min(x, vw - w - CARD_MARGIN)),
    y: Math.max(CARD_MARGIN, Math.min(y, vh - h - CARD_MARGIN)),
  }
}

export function AthleteProfileCard() {
  const [view, setView] = useState<ViewState>("expanded")
  const [activeChart, setActiveChart] = useState<MetricKey | null>(null)
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null)
  const [size, setSize] = useState<{ w: number; h: number } | null>(null)
  const didDrag = useRef(false)
  const dragOffset = useRef({ x: 0, y: 0 })
  const cardRef = useRef<HTMLDivElement>(null)

  /* Re-clamp whenever view changes so the card never overflows after expanding */
  useEffect(() => {
    if (!pos || !cardRef.current) return
    const { offsetWidth: w, offsetHeight: h } = cardRef.current
    const clamped = clampPos(pos.x, pos.y, w, h)
    if (clamped.x !== pos.x || clamped.y !== pos.y) setPos(clamped)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view])

  /* drag-to-move */
  const startDrag = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return
    e.preventDefault()
    const rect = cardRef.current!.getBoundingClientRect()
    dragOffset.current = { x: e.clientX - rect.left, y: e.clientY - rect.top }
    didDrag.current = false

    const onMove = (ev: MouseEvent) => {
      didDrag.current = true
      const { offsetWidth: w, offsetHeight: h } = cardRef.current!
      const raw = { x: ev.clientX - dragOffset.current.x, y: ev.clientY - dragOffset.current.y }
      setPos(clampPos(raw.x, raw.y, w, h))
    }
    const onUp = () => {
      window.removeEventListener("mousemove", onMove)
      window.removeEventListener("mouseup", onUp)
    }
    window.addEventListener("mousemove", onMove)
    window.addEventListener("mouseup", onUp)
  }, [])

  /* resize from top-left corner */
  const startResize = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0 || view !== "expanded") return
    e.preventDefault()
    e.stopPropagation()
    const rect = cardRef.current!.getBoundingClientRect()
    const startX = e.clientX
    const startY = e.clientY
    const startW = rect.width
    const startH = rect.height
    const startRight = rect.right
    const startBottom = rect.bottom

    const onMove = (ev: MouseEvent) => {
      const dw = startX - ev.clientX
      const dh = startY - ev.clientY
      const newW = Math.max(300, Math.min(startW + dw, window.innerWidth - CARD_MARGIN * 2))
      const newH = Math.max(300, Math.min(startH + dh, window.innerHeight - CARD_MARGIN * 2))
      const newX = startRight - newW
      const newY = startBottom - newH
      setSize({ w: newW, h: newH })
      setPos({ x: Math.max(CARD_MARGIN, newX), y: Math.max(CARD_MARGIN, newY) })
    }
    const onUp = () => {
      window.removeEventListener("mousemove", onMove)
      window.removeEventListener("mouseup", onUp)
    }
    window.addEventListener("mousemove", onMove)
    window.addEventListener("mouseup", onUp)
  }, [view])

  const attentionCount = PROFILE.injuries.filter(i => i.status !== "cleared").length

  /* Quarter-screen sizing (default) */
  const quarterW = Math.max(320, Math.floor(window.innerWidth * QUARTER_WIDTH_RATIO))
  const quarterH = Math.max(400, Math.floor(window.innerHeight * QUARTER_HEIGHT_RATIO))

  const cardW = size?.w ?? quarterW
  const cardH = size?.h ?? quarterH

  const cardStyle = pos
    ? { position: "fixed" as const, left: pos.x, top: pos.y, bottom: "auto", right: "auto" }
    : { position: "fixed" as const, bottom: CARD_MARGIN, right: CARD_MARGIN, top: "auto" }

  /* ── Minimised: just the avatar bubble ─────────────────────────── */
  if (view === "min") {
    return (
      <button
        ref={cardRef as any}
        type="button"
        style={cardStyle}
        aria-label="Expand athlete profile"
        onMouseDown={startDrag}
        onClick={() => { if (!didDrag.current) setView("collapsed"); didDrag.current = false }}
        className="z-50 flex size-11 cursor-pointer items-center justify-center rounded-full border-2 border-border bg-foreground text-sm font-bold text-background shadow-lg transition-transform hover:scale-105 active:scale-95"
      >
        AH
        {attentionCount > 0 && (
          <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-[hsl(var(--status-normal-fg))] text-[9px] font-bold text-white">
            {attentionCount}
          </span>
        )}
      </button>
    )
  }

  return (
    <>
      {activeChart && (
        <ChartModal config={CHART_CONFIGS[activeChart]} onClose={() => setActiveChart(null)}/>
      )}

      <div
        ref={cardRef}
        className={cn(
          "z-50 rounded-2xl border border-border bg-card shadow-xl flex flex-col",
          view === "expanded" ? "overflow-hidden" : "w-76"
        )}
        style={{
          ...cardStyle,
          ...(view === "expanded" ? { width: cardW, maxHeight: cardH } : {}),
        }}
      >
        {/* ── Resize handle — top-left corner ─────────────────────────── */}
        {view === "expanded" && (
          <div
            onMouseDown={startResize}
            className="absolute left-0 top-0 z-10 size-4 cursor-nw-resize"
            title="Drag to resize"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" className="text-muted-foreground/40 hover:text-muted-foreground transition-colors">
              <path d="M0 12L12 0M0 8L8 0M0 4L4 0" stroke="currentColor" strokeWidth="1.5" fill="none" />
            </svg>
          </div>
        )}
        {/* ── Header ─────────────────────────────────────────────────── */}
        <div className="flex items-center gap-2 px-3 py-2.5">
          {/* Grip — drag handle */}
          <button
            type="button"
            aria-label="Drag to reposition"
            onMouseDown={startDrag}
            className="cursor-grab rounded-md p-1 text-muted-foreground/40 hover:bg-accent hover:text-muted-foreground active:cursor-grabbing"
          >
            <GripHorizontal className="size-4"/>
          </button>

          {/* Avatar */}
          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-foreground text-[11px] font-bold text-background">
            AH
          </div>

          {/* Name + subtitle */}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-card-foreground">{PROFILE.name}</p>
            <p className="text-[11px] text-muted-foreground">
              {PROFILE.age} y/o · {PROFILE.gender} · Bio{" "}
              <span className="font-medium text-[hsl(var(--status-normal-fg))]">
                {PROFILE.bioAge.value} (+{PROFILE.bioAge.delta} yrs)
              </span>
            </p>
          </div>

          {/* Attention badge */}
          {attentionCount > 0 && (
            <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--status-normal-bg))] text-[10px] font-bold text-[hsl(var(--status-normal-fg))]">
              {attentionCount}
            </span>
          )}

          {/* Cycle: expanded → collapsed → min */}
          <button
            type="button"
            aria-label={view === "expanded" ? "Collapse profile" : "Minimise profile"}
            onClick={() => setView(v => v === "expanded" ? "collapsed" : "min")}
            className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            {view === "expanded" ? <ChevronDown className="size-4"/> : <Minus className="size-4"/>}
          </button>

          {/* Expand to full when collapsed */}
          {view === "collapsed" && (
            <button
              type="button"
              aria-label="Expand profile"
              onClick={() => setView("expanded")}
              className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <ChevronUp className="size-4"/>
            </button>
          )}
        </div>

        {/* ── Body Composition strip — always visible ─────────────────── */}
        <BodyCompStrip/>

        {/* ── Expanded body ───────────────────────────────────────────── */}
        {view === "expanded" && (
          <div className="flex-1 overflow-y-auto px-4 pb-4 pt-3 space-y-3">

            {/* User History — Doctor's Notes (moved to top) */}
            <DoctorNotesSection />

            {/* Injuries */}
            <div>
              <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                Injuries
              </p>
              <div className="space-y-1.5">
                {PROFILE.injuries.map(injury => (
                  <InjuryRow key={injury.label} injury={injury}/>
                ))}
              </div>
            </div>

            {/* Body Composition */}
            <div>
              <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1">
                <User className="size-3.5"/> Body Composition
              </p>
              <div className="flex gap-2">
                {[PROFILE.bodyComp.weight, PROFILE.bodyComp.bf, PROFILE.bodyComp.smm].map(v => (
                  <span key={v} className="rounded-md bg-secondary px-2 py-0.5 text-[11px] font-medium text-secondary-foreground">
                    {v}
                  </span>
                ))}
              </div>
            </div>

            {/* Vitals */}
            <div>
              <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                Vitals — tap to view trend
              </p>
              <div className="grid grid-cols-2 gap-2">
                <MetricTile
                  icon={<Heart className="size-3 text-[hsl(var(--status-critical-fg))]"/>}
                  label="Resting HR"
                  value={PROFILE.rhr}
                  metricKey="rhr"
                  onOpen={setActiveChart}
                />
                <MetricTile
                  icon={<Footprints className="size-3 text-[hsl(var(--tag-inbody-fg))]"/>}
                  label="Daily Activity"
                  value={PROFILE.steps}
                  metricKey="steps"
                  onOpen={setActiveChart}
                />
                <MetricTile
                  icon={<Moon className="size-3 text-[hsl(var(--tag-athlete-fg))]"/>}
                  label="Sleep"
                  value={`Score ${PROFILE.sleep.score}`}
                  sub={PROFILE.sleep.avg}
                  subStatus={PROFILE.sleep.score < 70 ? "attention" : "ok"}
                  metricKey="sleep"
                  onOpen={setActiveChart}
                />
                <MetricTile
                  icon={<Activity className="size-3 text-[hsl(var(--status-optimal-fg))]"/>}
                  label="HRV / Readiness"
                  value={PROFILE.hrv.value}
                  sub={`Score ${PROFILE.hrv.score}`}
                  subStatus={PROFILE.hrv.score < 65 ? "attention" : "ok"}
                  metricKey="hrv"
                  onOpen={setActiveChart}
                />
              </div>
            </div>

          </div>
        )}
      </div>
    </>
  )
}
