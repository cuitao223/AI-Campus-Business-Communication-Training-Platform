import { CheckCircle2, Copy, Lightbulb, ShieldAlert, XCircle } from "lucide-react";
import type { Report } from "@/types";

export function ReportCard({ report }: { report: Report }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Block title="本次亮点" icon={<CheckCircle2 size={18} className="text-emerald-700" />} items={report.strengths} />
      <Block title="主要问题" icon={<XCircle size={18} className="text-rose-700" />} items={report.weaknesses} />
      <Block title="风险提醒" icon={<ShieldAlert size={18} className="text-amber-700" />} items={report.riskWarnings} />
      <Block title="改进建议" icon={<Lightbulb size={18} className="text-indigo-700" />} items={report.improvementSuggestions} />
      <section className="panel rounded-lg p-5 lg:col-span-2">
        <div className="mb-3 flex items-center gap-2 font-semibold text-[#18245c]">
          <Copy size={18} className="text-indigo-600" />
          更优回复示范
        </div>
        <p className="rounded-md border border-indigo-100 bg-indigo-50/70 p-4 text-sm leading-7 text-[#405077]">{report.betterReplyExample}</p>
      </section>
      <section className="panel rounded-lg p-5 lg:col-span-2">
        <h2 className="mb-3 font-semibold text-[#18245c]">数字经济学解释</h2>
        <p className="text-sm leading-7 text-[#405077]">{report.digitalEconomyExplanation}</p>
      </section>
    </div>
  );
}

function Block({ title, icon, items }: { title: string; icon: React.ReactNode; items: string[] }) {
  return (
    <section className="panel rounded-lg p-5">
      <div className="mb-3 flex items-center gap-2 font-semibold text-[#18245c]">
        {icon}
        {title}
      </div>
      <ul className="space-y-2 text-sm leading-6 text-[#405077]">
        {items.map((item) => (
          <li key={item}>• {item}</li>
        ))}
      </ul>
    </section>
  );
}

