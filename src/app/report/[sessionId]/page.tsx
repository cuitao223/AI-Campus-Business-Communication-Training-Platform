"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { Copy, RotateCcw } from "lucide-react";
import { AchievementPanel } from "@/components/AchievementPanel";
import { BackLink } from "@/components/BackLink";
import { GrowthChart } from "@/components/GrowthChart";
import { ReportCard } from "@/components/ReportCard";
import { ScoreRadarChart } from "@/components/ScoreRadarChart";
import { getScenario } from "@/data/scenarios";
import { getGoldenLine, getNegotiationTitle } from "@/lib/engagement";
import { getStoredReport, getStoredSession, loadSessions } from "@/lib/storage";
import type { Report, TrainingSession } from "@/types";

export default function ReportPage() {
  const params = useParams<{ sessionId: string }>();
  const [session, setSession] = useState<TrainingSession | null>(null);
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [report, setReport] = useState<Report | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setSession(getStoredSession(params.sessionId));
    setSessions(loadSessions());
    setReport(getStoredReport(params.sessionId));
  }, [params.sessionId]);

  const scenario = session ? getScenario(session.scenarioId) : null;
  const exportText = useMemo(() => {
    if (!report || !session || !scenario) return "";
    return [
      "AI 校园商务谈判官复盘报告",
      `场景：${scenario.name}`,
      `身份：${session.userRole}`,
      `目标：${session.goal}`,
      `谈判称号：${getNegotiationTitle(session)}`,
      `复盘金句：${getGoldenLine(session)}`,
      `结果：${report.result.dealStatus}，成交概率 ${report.result.dealProbability}%`,
      `总体评价：${report.summary}`,
      `亮点：${report.strengths.join("；")}`,
      `问题：${report.weaknesses.join("；")}`,
      `风险：${report.riskWarnings.join("；")}`,
      `优化回复：${report.betterReplyExample}`,
      `数字经济解释：${report.digitalEconomyExplanation}`,
    ].join("\n");
  }, [report, scenario, session]);

  if (!session || !report || !scenario) {
    return <main className="container py-10">未找到报告。请先完成一次训练。</main>;
  }

  async function copyReport() {
    await navigator.clipboard.writeText(exportText);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <main className="page-shell app-screen container py-4">
      <div className="reveal mb-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-indigo-700">{scenario.name}</p>
          <h1 className="mt-1 text-3xl font-semibold text-[#18245c]">复盘报告</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <BackLink href="/scenarios" label="返回场景" />
          <button onClick={copyReport} className="btn-secondary inline-flex h-9 items-center gap-2 rounded-md px-4 text-sm font-medium">
            <Copy size={16} />
            {copied ? "已复制" : "导出报告"}
          </button>
          <Link href={`/setup/${session.scenarioId}`} className="btn-primary inline-flex h-9 items-center gap-2 rounded-md px-4 text-sm font-medium">
            <RotateCcw size={16} />
            再练一次
          </Link>
        </div>
      </div>

      <section className="grid h-[calc(100%-74px)] min-h-0 gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="app-scroll min-h-0 space-y-4">
          <div className="panel reveal rounded-lg p-5">
            <p className="text-sm text-[#7b88a8]">总体结果</p>
            <h2 className="mt-2 text-2xl font-semibold text-[#18245c]">{report.result.dealStatus}</h2>
            <p className="mt-3 text-sm leading-7 text-[#405077]">{report.summary}</p>
            <div className="mt-5 rounded-lg border border-indigo-100 bg-indigo-50/60 p-4">
              <div className="mb-2 flex justify-between text-sm text-[#607095]">
                <span>成交概率</span>
                <span>{report.result.dealProbability}%</span>
              </div>
              <div className="h-3 rounded-full bg-white">
                <div className="progress-fill h-3 rounded-full bg-gradient-to-r from-indigo-500 to-teal-500" style={{ width: `${report.result.dealProbability}%` }} />
              </div>
            </div>
            <p className="mt-4 text-sm leading-7 text-[#607095]">{report.nextPracticeSuggestion}</p>
          </div>
          <AchievementPanel session={session} />
        </div>

        <div className="app-scroll min-h-0 space-y-4 pr-1">
          <div className="panel reveal-delay rounded-lg p-5">
            <h2 className="mb-2 font-semibold text-[#18245c]">能力雷达图</h2>
            <ScoreRadarChart scores={session.scores} labels={scenario.scoringLabels} />
          </div>
          <GrowthChart sessions={sessions} />
          <ReportCard report={report} />
          <div>
            <Link href="/" className="btn-secondary rounded-md px-4 py-2 text-sm font-medium">
              返回首页
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
