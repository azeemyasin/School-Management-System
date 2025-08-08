"use client"

import { Pie, PieChart, ResponsiveContainer, Cell, Tooltip } from "recharts"

const data = [
  { name: "A+", value: 15, color: "#10b981" },
  { name: "A", value: 25, color: "#3b82f6" },
  { name: "B", value: 30, color: "#f59e0b" },
  { name: "C", value: 20, color: "#ef4444" },
  { name: "F", value: 10, color: "#6b7280" },
]

export function GradeDistributionChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  )
}
