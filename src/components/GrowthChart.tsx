"use client";

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { getGrowthRows } from "@/lib/engagement";
import type { TrainingSession } from "@/types";

export function GrowthChart({ sessions }: { sessions: TrainingSession[] }) {
  const data = getGrowthRows(sessions);

  return (
    <section className="panel reveal-delay rounded-lg p-5">
      <h2 className="font-semibold text-[#18245c]">历史训练成长曲线</h2>
      <p className="mt-1 text-sm text-[#607095]">追踪风险意识、底线控制和成交概率的变化。</p>
      <div className="mt-4 h-72">
        {data.length <= 1 ? (
          <div className="grid h-full place-items-center rounded-lg border border-indigo-100 bg-indigo-50/50 text-sm text-[#607095]">
            完成更多训练后，这里会显示成长趋势。
          </div>
        ) : (
          <ResponsiveContainer>
            <LineChart data={data}>
              <XAxis dataKey="name" tick={{ fill: "#607095", fontSize: 12 }} />
              <YAxis domain={[0, 100]} tick={{ fill: "#607095", fontSize: 12 }} />
              <Tooltip />
              <Line type="monotone" dataKey="riskAwareness" name="风险意识" stroke="#0d9488" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="bottomLineControl" name="底线控制" stroke="#536dfe" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="dealProbability" name="成交概率" stroke="#f59e0b" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </section>
  );
}
