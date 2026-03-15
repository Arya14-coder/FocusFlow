import React, { useState, useMemo } from 'react';
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, Zap, Download, TrendingUp, Target, BarChart3, Activity } from 'lucide-react';
import { useFlow } from '../FlowContext';

// ─── Animated Counter ────────────────────────────────────────────────
const AnimatedNumber = ({ value, suffix = '' }) => {
  // If it's a string like "1h 10m", we shouldn't strip the letters for display.
  // We only treat it as numeric-for-animation if it's strictly a number or a simple numeric string.
  const isStrictlyNumeric = typeof value === 'number' || (typeof value === 'string' && /^-?\d*\.?\d+$/.test(value));
  const num = isStrictlyNumeric ? parseFloat(value) : value;
  const isNumeric = !isNaN(num) && isFinite(num) && isStrictlyNumeric;
  
  return (
    <motion.span
      key={isNumeric ? num : value}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 120, damping: 14 }}
    >
      {isNumeric ? num : value}{isNumeric ? suffix : ''}
    </motion.span>
  );
};


// ─── Circular Progress Ring ──────────────────────────────────────────
const ProgressRing = ({ percent, size = 120, strokeWidth = 10, color = '#A98467' }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(percent, 100) / 100) * circumference;

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle
        cx={size / 2} cy={size / 2} r={radius}
        stroke="currentColor" className="text-zinc-100"
        strokeWidth={strokeWidth} fill="none"
      />
      <motion.circle
        cx={size / 2} cy={size / 2} r={radius}
        stroke={color} strokeWidth={strokeWidth} fill="none"
        strokeLinecap="round"
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
        strokeDasharray={circumference}
      />
    </svg>
  );
};

// ─── Custom Tooltip for ComposedChart ────────────────────────────────
const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const data = payload[0]?.payload;
  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-4 shadow-xl border border-zinc-100 min-w-[180px]">
      <p className="font-bold text-zinc-800 text-sm mb-2">{data?.fullDate || label}</p>
      <div className="space-y-1.5">
        <div className="flex items-center justify-between gap-4">
          <span className="text-xs text-zinc-400 flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-primary inline-block" /> Focus
          </span>
          <span className="text-sm font-bold text-zinc-700">{data?.mins || 0} min</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-xs text-zinc-400 flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-secondary inline-block" /> Sessions
          </span>
          <span className="text-sm font-bold text-zinc-700">{data?.count || 0}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-xs text-zinc-400 flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-accent inline-block" /> Efficiency
          </span>
          <span className="text-sm font-bold text-zinc-700">{data?.eff || 0}/10</span>
        </div>
      </div>
    </div>
  );
};

// ─── Heatmap Cell ────────────────────────────────────────────────────
const HeatmapCell = ({ intensity, date, mins, isPlaceholder }) => {
  if (isPlaceholder) return <div className="w-full aspect-square" />;
  
  const bg = intensity === 0
    ? 'bg-zinc-100'
    : intensity <= 0.25
      ? 'bg-primary/20'
      : intensity <= 0.5
        ? 'bg-primary/40'
        : intensity <= 0.75
          ? 'bg-primary/60'
          : 'bg-primary/90';

  return (
    <div className="group relative">
      <div className={`w-full aspect-square rounded-lg ${bg} transition-all duration-200 group-hover:scale-110 group-hover:ring-2 group-hover:ring-primary/30`} />
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-zinc-800 text-white text-[10px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
        {date}: {mins}m
      </div>
    </div>
  );
};


// ─── Helper: format minutes ──────────────────────────────────────────
const formatMins = (totalMins) => {
  const h = Math.floor(totalMins / 60);
  const m = Math.round(totalMins % 60);
  if (h === 0) return `${m}m`;
  return `${h}h ${m}m`;
};

// ─── Main Dashboard ──────────────────────────────────────────────────
const Dashboard = () => {
  const { sessions, tasks, settings } = useFlow();
  const [range, setRange] = useState(7);

  // ── Derived stats ───────────────────────────────────────────────────
  const stats = useMemo(() => {
    const totalMins = sessions.reduce((a, s) => a + (s.duration / 60), 0);
    const totalSessions = sessions.length;
    const avgMins = totalSessions > 0 ? totalMins / totalSessions : 0;
    const avgEff = totalSessions > 0
      ? sessions.reduce((a, s) => a + (s.efficiency || 0), 0) / totalSessions
      : 0;

    // Real streak calculation
    const daySet = new Set();
    sessions.forEach(s => {
      if (s.timestamp) daySet.add(new Date(s.timestamp).toISOString().split('T')[0]);
    });
    const sortedDays = [...daySet].sort().reverse();
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < sortedDays.length; i++) {
      const expected = new Date(today);
      expected.setDate(today.getDate() - i);
      if (sortedDays[i] === expected.toISOString().split('T')[0]) {
        streak++;
      } else {
        break;
      }
    }

    // Best day of week
    const dayTotals = [0, 0, 0, 0, 0, 0, 0];
    sessions.forEach(s => {
      if (s.timestamp) {
        const dow = new Date(s.timestamp).getDay();
        dayTotals[dow] += (s.duration / 60);
      }
    });
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const bestDayIdx = dayTotals.indexOf(Math.max(...dayTotals));
    const bestDay = dayTotals[bestDayIdx] > 0 ? dayNames[bestDayIdx] : '—';

    // Today's minutes
    const todayStr = new Date().toISOString().split('T')[0];
    const todayMins = sessions
      .filter(s => s.timestamp && new Date(s.timestamp).toISOString().split('T')[0] === todayStr)
      .reduce((a, s) => a + (s.duration / 60), 0);

    return { totalMins, totalSessions, avgMins, avgEff, streak, bestDay, todayMins };
  }, [sessions]);

  // ── Chart data (variable range) ────────────────────────────────────
  const chartData = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const data = Array.from({ length: range }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      return {
        day: range <= 7 ? days[d.getDay()] : `${months[d.getMonth()]} ${d.getDate()}`,
        fullDate: `${days[d.getDay()]}, ${months[d.getMonth()]} ${d.getDate()}`,
        date: dateStr,
        mins: 0,
        eff: 0,
        count: 0,
      };
    }).reverse();

    sessions.forEach(session => {
      if (!session.timestamp) return;
      const sd = new Date(session.timestamp).toISOString().split('T')[0];
      const entry = data.find(d => d.date === sd);
      if (entry) {
        entry.mins += session.duration / 60;
        entry.eff += (session.efficiency || 0);
        entry.count += 1;
      }
    });

    return data.map(d => ({
      ...d,
      mins: Math.round(d.mins),
      eff: d.count > 0 ? parseFloat((d.eff / d.count).toFixed(1)) : 0,
    }));
  }, [sessions, range]);

  // ── Session-type distribution ──────────────────────────────────────
  const pieData = useMemo(() => {
    let focus = 0, shortB = 0, longB = 0;
    sessions.forEach(s => {
      if (s.type === 'focus') focus++;
      else if (s.type === 'short-break') shortB++;
      else if (s.type === 'long-break') longB++;
    });
    return [
      { name: 'Focus', value: focus, color: '#A98467' },
      { name: 'Short Break', value: shortB, color: '#7EBDC2' },
      { name: 'Long Break', value: longB, color: '#D4A373' },
    ].filter(d => d.value > 0);
  }, [sessions]);

  // ── Heatmap data (last 28 days) ────────────────────────────────────
  const heatmapData = useMemo(() => {
    // Goal: Show last 28 days aligned to S-M-T-W-T-F-S
    const baseDate = new Date();
    baseDate.setDate(baseDate.getDate() - 27);
    const startOffset = baseDate.getDay(); // 0 is Sun, 6 is Sat

    const grid = Array.from({ length: 28 }, (_, i) => {
      const d = new Date(baseDate);
      d.setDate(baseDate.getDate() + i);
      return {
        date: d.toISOString().split('T')[0],
        label: `${d.getMonth() + 1}/${d.getDate()}`,
        mins: 0,
        isPlaceholder: false
      };
    });

    sessions.forEach(s => {
      if (!s.timestamp) return;
      const sd = new Date(s.timestamp).toISOString().split('T')[0];
      const cell = grid.find(g => g.date === sd);
      if (cell) cell.mins += s.duration / 60;
    });

    const maxMins = Math.max(...grid.map(g => g.mins), 1);
    const dataWithIntensity = grid.map(g => ({ ...g, intensity: g.mins / maxMins }));
    
    // Prepend placeholders to align day of week
    const placeholders = Array.from({ length: startOffset }, (_, i) => ({ isPlaceholder: true }));
    return [...placeholders, ...dataWithIntensity];
  }, [sessions]);


  // ── Grouped sessions ───────────────────────────────────────────────
  const groupedSessions = useMemo(() => {
    const groups = {};
    sessions.slice(0, 15).forEach(s => {
      const dateKey = s.timestamp
        ? new Date(s.timestamp).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
        : 'Unknown';
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(s);
    });
    return groups;
  }, [sessions]);

  const exportData = () => {
    const dataStr = JSON.stringify(sessions, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const link = document.createElement('a');
    link.setAttribute('href', dataUri);
    link.setAttribute('download', 'focusflow-data.json');
    link.click();
  };

  const DAILY_GOAL = settings.dailyGoal || 120; // minutes
  const goalPercent = Math.min((stats.todayMins / DAILY_GOAL) * 100, 100);

  // ─── RENDER ────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-6 pb-24">

      {/* ── Stat Cards ─────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { icon: Clock, label: 'Total Focus', value: formatMins(stats.totalMins), bg: 'bg-primary/10', text: 'text-primary' },
          { icon: BarChart3, label: 'Sessions', value: stats.totalSessions, bg: 'bg-secondary/10', text: 'text-secondary' },
          { icon: TrendingUp, label: 'Avg Efficiency', value: stats.avgEff.toFixed(1), suffix: '/10', bg: 'bg-accent/10', text: 'text-accent' },
          { icon: Calendar, label: 'Streak', value: stats.streak, suffix: 'd', bg: 'bg-primary/10', text: 'text-primary' },
        ].map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, type: 'spring', stiffness: 100 }}
            className="bg-white p-5 rounded-[1.6rem] shadow-premium border border-zinc-50 flex flex-col gap-0.5"
          >
            <div className={`w-9 h-9 ${card.bg} ${card.text} rounded-xl flex items-center justify-center mb-1.5`}>
              <card.icon className="w-4.5 h-4.5" />
            </div>
            <span className="text-2xl font-black text-zinc-900 font-outfit leading-tight">
              <AnimatedNumber value={card.value} suffix={card.suffix || ''} />
            </span>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{card.label}</span>
          </motion.div>
        ))}
      </div>

      {/* ── Avg Session + Best Day + Goal (secondary row) ──────── */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white p-4 rounded-2xl shadow-premium border border-zinc-50 flex flex-col items-center justify-center text-center">
          <span className="text-lg font-black text-zinc-900 font-outfit"><AnimatedNumber value={Math.round(stats.avgMins)} suffix="m" /></span>
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Avg Session</span>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-premium border border-zinc-50 flex flex-col items-center justify-center text-center">
          <span className="text-lg font-black text-zinc-900 font-outfit">{stats.bestDay}</span>
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Best Day</span>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-premium border border-zinc-50 flex flex-col items-center justify-center relative">
          <div className="relative w-16 h-16 flex items-center justify-center">
            <ProgressRing percent={goalPercent} size={64} strokeWidth={6} />
            <span className="absolute text-xs font-black text-zinc-700 font-outfit">{Math.round(goalPercent)}%</span>
          </div>
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">Daily Goal</span>
        </div>
      </div>

      {/* ── Weekly Chart ───────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="bg-white p-6 md:p-8 rounded-[2rem] shadow-premium border border-zinc-50"
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
          <h3 className="text-base font-bold font-outfit text-zinc-900">Activity Overview</h3>
          <div className="flex items-center gap-2">
            {/* Range Toggle */}
            <div className="flex bg-zinc-100 rounded-xl p-0.5 text-[11px] font-bold">
              {[7, 14, 30].map(r => (
                <button
                  key={r}
                  onClick={() => setRange(r)}
                  className={`px-3 py-1.5 rounded-[10px] transition-all ${
                    range === r ? 'bg-white shadow-sm text-zinc-800' : 'text-zinc-400 hover:text-zinc-600'
                  }`}
                >
                  {r}d
                </button>
              ))}
            </div>
            <button
              onClick={exportData}
              className="flex items-center gap-1.5 text-xs font-bold text-primary hover:bg-primary/5 px-3 py-2 rounded-xl transition-all"
            >
              <Download className="w-3.5 h-3.5" /> Export
            </button>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} barCategoryGap="20%">
              <defs>
                <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#A98467" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#A98467" stopOpacity={0.3} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: '#a1a1aa', fontWeight: 600 }}
              />
              <YAxis
                yAxisId="left"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: '#a1a1aa', fontWeight: 600 }}
                width={32}
                label={{ value: 'min', position: 'top', offset: 4, style: { fontSize: 10, fill: '#a1a1aa' } }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                domain={[0, 10]}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: '#a1a1aa', fontWeight: 600 }}
                width={28}
                label={{ value: 'eff', position: 'top', offset: 4, style: { fontSize: 10, fill: '#a1a1aa' } }}
              />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(169,132,103,0.06)' }} />
              <Bar
                yAxisId="left"
                dataKey="mins"
                fill="url(#barGrad)"
                radius={[8, 8, 0, 0]}
                maxBarSize={40}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="eff"
                stroke="#7EBDC2"
                strokeWidth={3}
                dot={{ r: 4, fill: '#7EBDC2', stroke: '#fff', strokeWidth: 2 }}
                activeDot={{ r: 6, stroke: '#7EBDC2', strokeWidth: 2, fill: '#fff' }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mt-4 text-xs font-semibold text-zinc-400">
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-primary inline-block" /> Focus Mins</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-1 rounded-full bg-secondary inline-block" /> Efficiency</span>
        </div>
      </motion.div>

      {/* ── Distribution + Heatmap Row ─────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Donut Chart */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-6 rounded-[2rem] shadow-premium border border-zinc-50"
        >
          <h3 className="text-sm font-bold font-outfit text-zinc-900 mb-4">Session Distribution</h3>
          {pieData.length > 0 ? (
            <div className="h-48 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%" cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    iconSize={8}
                    formatter={(value) => (
                      <span className="text-xs font-semibold text-zinc-500 ml-1">{value}</span>
                    )}
                  />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 20px rgba(0,0,0,0.08)', fontSize: '12px' }}
                    formatter={(value, name) => [`${value} sessions`, name]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-zinc-300 text-sm font-medium">
              No sessions yet
            </div>
          )}
        </motion.div>

        {/* Heatmap */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-white p-6 rounded-[2rem] shadow-premium border border-zinc-50"
        >
          <h3 className="text-sm font-bold font-outfit text-zinc-900 mb-4">Focus Heatmap (4 weeks)</h3>
          <div className="grid grid-cols-7 gap-1.5 mb-3">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
              <span key={i} className="text-[10px] font-bold text-zinc-300 text-center">{d}</span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1.5">
            {heatmapData.map((cell, i) => (
              <HeatmapCell 
                key={i} 
                isPlaceholder={cell.isPlaceholder}
                intensity={cell.intensity} 
                date={cell.label} 
                mins={Math.round(cell.mins)} 
              />
            ))}
          </div>
          {/* Legend */}
          <div className="flex items-center justify-end gap-1 mt-3">
            <span className="text-[10px] text-zinc-400 mr-1">Less</span>
            {[0, 0.25, 0.5, 0.75, 1].map(v => (
              <div
                key={v}
                className={`w-3 h-3 rounded ${
                  v === 0 ? 'bg-zinc-100' : v <= 0.25 ? 'bg-primary/20' : v <= 0.5 ? 'bg-primary/40' : v <= 0.75 ? 'bg-primary/60' : 'bg-primary/90'
                }`}
              />
            ))}
            <span className="text-[10px] text-zinc-400 ml-1">More</span>
          </div>
        </motion.div>
      </div>

      {/* ── Recent Sessions (grouped by date) ─────────────────── */}
      <div className="flex flex-col gap-4">
        <h3 className="text-base font-bold font-outfit text-zinc-900 px-1">Recent Sessions</h3>
        {Object.keys(groupedSessions).length > 0 ? (
          Object.entries(groupedSessions).map(([date, group]) => (
            <div key={date}>
              <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-2 px-1">{date}</p>
              <div className="flex flex-col gap-2">
                {group.map(session => {
                  const linkedTask = tasks?.find(t => t.id === session.taskId);
                  return (
                    <motion.div
                      key={session.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="bg-white p-4 rounded-2xl border border-zinc-50 shadow-premium flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                          session.type === 'focus' ? 'bg-primary/10 text-primary' : 'bg-secondary/10 text-secondary'
                        }`}>
                          {session.type === 'focus' ? <Zap className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                        </div>
                        <div>
                          <p className="font-bold text-sm text-zinc-800 capitalize">{session.type} Session</p>
                          <p className="text-[11px] font-medium text-zinc-400 flex items-center gap-1.5">
                            {Math.round(session.duration / 60)}m
                            {linkedTask && <span className="text-primary">• {linkedTask.text?.substring(0, 24)}{linkedTask.text?.length > 24 ? '…' : ''}</span>}
                          </p>
                        </div>
                      </div>
                      {/* Efficiency bar */}
                      <div className="flex flex-col items-end gap-1 min-w-[60px]">
                        <span className="text-sm font-black text-primary font-outfit">{session.efficiency}/10</span>
                        <div className="w-full h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full rounded-full bg-primary"
                            initial={{ width: 0 }}
                            animate={{ width: `${((session.efficiency || 0) / 10) * 100}%` }}
                            transition={{ duration: 0.6, ease: 'easeOut' }}
                          />
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ))
        ) : (
          <div className="p-12 text-center text-zinc-400 font-medium rounded-2xl bg-white border border-zinc-50">
            <Activity className="w-8 h-8 mx-auto mb-2 text-zinc-200" />
            No sessions recorded yet. Complete a focus session to see your data here.
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
