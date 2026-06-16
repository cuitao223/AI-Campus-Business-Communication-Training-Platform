import { getHeatMetrics } from "@/lib/engagement";
import type { TrainingSession } from "@/types";

const colors = {
  good: "from-teal-500 to-emerald-500",
  warning: "from-amber-500 to-orange-500",
  danger: "from-rose-500 to-red-500",
  neutral: "from-indigo-500 to-sky-500",
};

export function HeatPanel({ session }: { session: TrainingSession }) {
  return (
    <section className="panel motion-card rounded-lg p-4">
      <h2 className="font-semibold text-[#18245c]">谈判热力条</h2>
      <div className="mt-3 space-y-3">
        {getHeatMetrics(session).map((metric) => (
          <div key={metric.label}>
            <div className="mb-1 flex justify-between text-xs text-[#607095]">
              <span>{metric.label}</span>
              <span>{metric.value}</span>
            </div>
            <div className="h-2 rounded-full bg-indigo-50">
              <div className={`progress-fill h-2 rounded-full bg-gradient-to-r ${colors[metric.tone]}`} style={{ width: `${metric.value}%` }} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
