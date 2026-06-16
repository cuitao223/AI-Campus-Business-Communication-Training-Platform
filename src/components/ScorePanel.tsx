import { AlertTriangle, BarChart3 } from "lucide-react";
import { getScenario } from "@/data/scenarios";
import type { TrainingSession } from "@/types";

export function ScorePanel({ session }: { session: TrainingSession }) {
  const scenario = getScenario(session.scenarioId);
  if (!scenario) return null;
  const entries = Object.entries(session.scores) as Array<[keyof typeof session.scores, number]>;

  return (
    <aside className="space-y-4">
      <section className="panel motion-card rounded-lg p-4">
        <div className="mb-3 flex items-center gap-2">
          <BarChart3 size={18} className="text-indigo-700" />
          <h2 className="font-semibold text-[#18245c]">当前评分</h2>
        </div>
        <div className="space-y-3">
          {entries.map(([key, value]) => (
            <div key={key}>
              <div className="mb-1 flex justify-between text-xs text-[#607095]">
                <span>{scenario.scoringLabels[key]}</span>
                <span>{value}</span>
              </div>
              <div className="h-2 rounded-full bg-indigo-50">
                <div className="progress-fill h-2 rounded-full bg-gradient-to-r from-indigo-500 to-teal-500" style={{ width: `${value}%` }} />
              </div>
            </div>
          ))}
        </div>
      </section>
      <section className="panel motion-card rounded-lg p-4">
        <h2 className="font-semibold text-[#18245c]">谈判状态</h2>
        <dl className="mt-3 space-y-2 text-sm text-[#607095]">
          <div className="flex justify-between gap-3">
            <dt>阶段</dt>
            <dd>{stageLabel(session.stage)}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt>成交概率</dt>
            <dd>{session.scores.dealProbability}%</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt>状态</dt>
            <dd>{dealLabel(session.dealStatus)}</dd>
          </div>
        </dl>
      </section>
      <section className="panel motion-card rounded-lg p-4">
        <div className="mb-2 flex items-center gap-2">
          <AlertTriangle size={18} className="text-amber-700" />
          <h2 className="font-semibold text-[#18245c]">风险与提示</h2>
        </div>
        <div className="space-y-2 text-sm leading-6 text-[#607095]">
          {session.risks.length > 0 ? (
            <p className="rounded-md bg-amber-50 p-3 text-amber-900">已识别：{Array.from(new Set(session.risks)).join("、")}</p>
          ) : (
            <p>暂未识别高风险词，继续确认条款和边界。</p>
          )}
          {session.realtimeHint && session.hints.at(-1) ? <p>{session.hints.at(-1)}</p> : null}
        </div>
      </section>
    </aside>
  );
}

function stageLabel(stage: TrainingSession["stage"]) {
  return { opening: "开场", probing: "澄清", bargaining: "议价", closing: "收尾", ended: "已结束" }[stage];
}

function dealLabel(status: TrainingSession["dealStatus"]) {
  return { not_yet: "未确定", likely: "较可能", unlikely: "偏低", reached: "已达成", failed: "失败" }[status];
}

