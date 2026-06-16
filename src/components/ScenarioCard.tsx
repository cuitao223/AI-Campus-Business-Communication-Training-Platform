import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ScenarioLogo } from "@/components/VisualLogo";
import type { Scenario } from "@/types";

export function ScenarioCard({ scenario }: { scenario: Scenario }) {
  return (
    <article className="panel motion-card compact-card group flex h-full flex-col rounded-lg p-4 transition duration-200 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-[0_26px_60px_rgba(83,109,254,0.16)]">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-indigo-700">{scenario.shortName}</p>
          <h3 className="mt-1 text-lg font-semibold text-[#18245c]">{scenario.name}</h3>
        </div>
        <ScenarioLogo scenarioId={scenario.id} />
      </div>
      <p className="text-sm leading-6 text-[#607095]">{scenario.description}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {scenario.trainingAbilities.slice(0, 5).map((tag) => (
          <span key={tag} className="rounded-md bg-indigo-50 px-2.5 py-1 text-xs text-indigo-800">
            {tag}
          </span>
        ))}
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        {scenario.digitalEconomyTags.map((tag) => (
          <span key={tag} className="rounded-md bg-emerald-50 px-2.5 py-1 text-xs text-emerald-800">
            {tag}
          </span>
        ))}
      </div>
      <Link href={`/setup/${scenario.id}`} className="btn-primary mt-4 inline-flex h-9 items-center justify-center gap-2 rounded-md px-4 text-sm font-medium">
        进入设定 <ArrowRight size={16} />
      </Link>
    </article>
  );
}
