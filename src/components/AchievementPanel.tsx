import { Award, LockKeyhole } from "lucide-react";
import { getAchievements, getGoldenLine, getNegotiationTitle } from "@/lib/engagement";
import type { TrainingSession } from "@/types";

export function AchievementPanel({ session }: { session: TrainingSession }) {
  const title = getNegotiationTitle(session);
  const achievements = getAchievements(session);

  return (
    <section className="panel reveal rounded-lg p-5">
      <p className="text-sm text-[#7b88a8]">谈判称号</p>
      <h2 className="mt-1 text-2xl font-semibold text-[#18245c]">{title}</h2>
      <p className="mt-3 rounded-md border border-indigo-100 bg-indigo-50/70 p-3 text-sm leading-6 text-[#405077]">{getGoldenLine(session)}</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {achievements.map((item) => (
          <div key={item.name} className={`motion-card flex items-center gap-3 rounded-lg border p-3 ${item.unlocked ? "border-teal-100 bg-teal-50/70" : "border-slate-200 bg-slate-50/70"}`}>
            {item.unlocked ? <Award size={18} className="text-teal-700" /> : <LockKeyhole size={18} className="text-slate-400" />}
            <span className={`text-sm font-medium ${item.unlocked ? "text-teal-900" : "text-slate-500"}`}>{item.name}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
