import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ScenarioCard } from "@/components/ScenarioCard";
import { BrandMark, ChallengeLogo, FeatureLogo } from "@/components/VisualLogo";
import { scenarios } from "@/data/scenarios";
import { dailyChallenges } from "@/lib/engagement";

export default function HomePage() {
  return (
    <main className="page-shell app-screen">
      <div className="container grid h-full gap-4 py-4 lg:grid-cols-[0.92fr_1.28fr_0.8fr]">
        <section className="reveal flex min-h-0 flex-col justify-between rounded-lg border border-indigo-100 bg-white/58 p-6 shadow-[0_22px_70px_rgba(35,52,91,0.08)] backdrop-blur-2xl">
          <div>
            <BrandMark />
            <p className="mt-5 inline-flex rounded-md border border-teal-100 bg-teal-50/80 px-3 py-1 text-sm font-medium text-teal-800">
              校园商务沟通训练
            </p>
            <h1 className="mt-4 text-4xl font-semibold leading-tight text-[#18245c] xl:text-5xl">
              AI 校园商务谈判官
            </h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-[#607095]">
              用 AI 模拟兼职谈薪、接单报价、创业合作和二手议价，在真实对话中练习商务判断。
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/scenarios" className="btn-primary inline-flex h-11 items-center gap-2 rounded-md px-5 font-medium">
                开始训练 <ArrowRight size={18} />
              </Link>
              <Link href="/setup/freelance_quote" className="btn-secondary inline-flex h-11 items-center rounded-md px-5 font-medium">
                示例训练
              </Link>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-3">
            {[
              ["4 类场景", "deal"],
              ["6 项评分", "score"],
              ["实时复盘", "report"],
            ].map(([item, icon]) => (
              <div key={item} className="motion-card flex flex-col items-center gap-2 rounded-lg border border-indigo-100 bg-white/62 px-3 py-3 text-center text-sm font-medium text-[#3347a5]">
                <FeatureLogo name={icon as "deal"} />
                {item}
              </div>
            ))}
          </div>
        </section>

        <section className="reveal-delay min-h-0">
          <div className="mb-3 flex items-end justify-between">
            <div>
              <p className="text-sm font-medium text-indigo-700">训练场景</p>
              <h2 className="text-2xl font-semibold text-[#18245c]">选择一个谈判对象</h2>
            </div>
            <Link href="/scenarios" className="btn-secondary rounded-md px-3 py-2 text-sm font-medium">
              全部
            </Link>
          </div>
          <div className="grid h-[calc(100%-52px)] min-h-0 grid-cols-2 gap-3">
            {scenarios.map((scenario) => (
              <ScenarioCard key={scenario.id} scenario={scenario} />
            ))}
          </div>
        </section>

        <aside className="reveal-delay flex min-h-0 flex-col gap-3">
          <section className="panel glass-sheen rounded-lg p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="font-semibold text-[#18245c]">能力预览</span>
              <span className="rounded-md bg-teal-50 px-2 py-1 text-xs text-teal-800">实时</span>
            </div>
            <div className="space-y-2.5">
              {["价值表达", "数据说服", "风险意识", "底线控制", "专业礼貌"].map((item, index) => (
                <div key={item}>
                  <div className="mb-1 flex justify-between text-xs text-[#607095]">
                    <span>{item}</span>
                    <span>{62 + index * 6}</span>
                  </div>
                  <div className="h-2 rounded-full bg-indigo-50">
                    <div className="progress-fill h-2 rounded-full bg-gradient-to-r from-indigo-500 to-teal-500" style={{ width: `${62 + index * 6}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="panel rounded-lg p-4">
            <p className="text-sm font-medium text-indigo-700">每日挑战</p>
            <div className="mt-3 space-y-2">
              {dailyChallenges.map((challenge) => (
                <Link key={challenge.title} href={challenge.href} className="motion-card flex gap-3 rounded-lg border border-indigo-100 bg-white/62 p-3">
                  <ChallengeLogo href={challenge.href} />
                  <span>
                    <h3 className="text-sm font-semibold text-[#18245c]">{challenge.title}</h3>
                    <p className="mt-1 text-xs leading-5 text-[#607095]">{challenge.description}</p>
                  </span>
                </Link>
              ))}
            </div>
          </section>

          <section className="grid grid-cols-2 gap-3">
            {[
              ["角色扮演", "role"],
              ["实时评分", "score"],
              ["风险提醒", "risk"],
              ["复盘报告", "report"],
            ].map(([title, icon]) => (
              <div key={title} className="motion-card rounded-lg border border-indigo-100 bg-white/62 p-3">
                <FeatureLogo name={icon as "role"} />
                <h3 className="mt-2 text-sm font-semibold text-[#18245c]">{title}</h3>
              </div>
            ))}
          </section>
        </aside>
      </div>
    </main>
  );
}
