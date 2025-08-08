"use client"

import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"

const data = [
  { date: "Mon", attendance: 95 },
  { date: "Tue", attendance: 92 },
  { date: "Wed", attendance: 88 },
  { date: "Thu", attendance: 94 },
  { date: "Fri", attendance: 89 },
  { date: "Sat", attendance: 85 },
  { date: "Sun", attendance: 0 },
]

export function AttendanceChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data}>
        <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <Tooltip formatter={(value) => [`${value}%`, "Attendance"]} />
        <Area type="monotone" dataKey="attendance" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} />
      </AreaChart>
    </ResponsiveContainer>
  )
}
