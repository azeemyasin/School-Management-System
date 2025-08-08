"use client"

import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis } from "recharts"

const data = [
  {
    name: "Jan",
    total: 120,
  },
  {
    name: "Feb",
    total: 135,
  },
  {
    name: "Mar",
    total: 142,
  },
  {
    name: "Apr",
    total: 158,
  },
  {
    name: "May",
    total: 165,
  },
  {
    name: "Jun",
    total: 172,
  },
]

export function AnalyticsChart() {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <AreaChart
        data={data}
        margin={{
          top: 10,
          right: 30,
          left: 0,
          bottom: 0,
        }}
      >
        <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
        <Area type="monotone" dataKey="total" stroke="#8884d8" fillOpacity={0.4} fill="#8884d8" />
      </AreaChart>
    </ResponsiveContainer>
  )
}
