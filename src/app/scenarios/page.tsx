import { BackLink } from "@/components/BackLink";
import { ScenarioCard } from "@/components/ScenarioCard";
import { scenarios } from "@/data/scenarios";

export default function ScenarioPage() {
  return (
    <main className="page-shell app-screen container py-4">
      <div className="reveal mb-4 flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-indigo-700">选择训练场景</p>
          <h1 className="mt-1 text-3xl font-semibold text-[#18245c]">从真实校园交易沟通开始</h1>
          <p className="mt-2 max-w-3xl leading-7 text-[#607095]">
            根据目标、底线、对方风格和难度生成谈判压力，并在结束后复盘。
          </p>
        </div>
        <BackLink href="/" label="返回首页" />
      </div>
      <div className="reveal-delay grid h-[calc(100%-112px)] min-h-0 gap-3 md:grid-cols-2">
        {scenarios.map((scenario) => (
          <ScenarioCard key={scenario.id} scenario={scenario} />
        ))}
      </div>
    </main>
  );
}
