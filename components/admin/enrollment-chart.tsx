"use client"

import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"

const data = [
  { month: "Jan", students: 120 },
  { month: "Feb", students: 135 },
  { month: "Mar", students: 142 },
  { month: "Apr", students: 158 },
  { month: "May", students: 165 },
  { month: "Jun", students: 172 },
  { month: "Jul", students: 180 },
  { month: "Aug", students: 195 },
  { month: "Sep", students: 210 },
  { month: "Oct", students: 225 },
  { month: "Nov", students: 240 },
  { month: "Dec", students: 255 },
]

export function EnrollmentChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <XAxis dataKey="month" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <Tooltip />
        <Line type="monotone" dataKey="students" stroke="#8884d8" strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  )
}
