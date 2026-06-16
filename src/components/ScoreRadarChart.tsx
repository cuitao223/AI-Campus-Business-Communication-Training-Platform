"use client";

import { PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer } from "recharts";
import type { Scores, ScoringLabels } from "@/types";

export function ScoreRadarChart({ scores, labels }: { scores: Scores; labels: ScoringLabels }) {
  const data = (Object.keys(scores) as Array<keyof Scores>).map((key) => ({
    subject: labels[key],
    value: scores[key],
  }));

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer>
        <RadarChart data={data}>
          <PolarGrid stroke="#d9e0ec" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: "#475569", fontSize: 12 }} />
          <Radar dataKey="value" stroke="#4158d0" fill="#4158d0" fillOpacity={0.22} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
