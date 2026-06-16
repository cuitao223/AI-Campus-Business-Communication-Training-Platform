import { getOpponentPersona, getOpponentReaction } from "@/lib/engagement";
import type { TrainingSession } from "@/types";

export function OpponentProfile({ session }: { session: TrainingSession }) {
  const persona = getOpponentPersona(session.opponentStyle);
  const reaction = getOpponentReaction(session);

  return (
    <section className="panel motion-card rounded-lg p-4">
      <div className="flex items-center gap-3">
        <div className={`soft-pulse grid h-12 w-12 place-items-center rounded-lg bg-gradient-to-br ${persona.className} font-semibold text-white shadow-md`}>
          {persona.initials}
        </div>
        <div>
          <h2 className="font-semibold text-[#18245c]">{persona.label}</h2>
          <p className="text-sm text-[#607095]">{persona.trait}</p>
        </div>
      </div>
      <p className="mt-3 text-sm leading-6 text-[#607095]">{persona.tone}</p>
      <div className="glass-sheen mt-3 rounded-md border border-indigo-100 bg-indigo-50/60 p-3">
        <p className="text-xs text-[#7b88a8]">对手反应</p>
        <p className="mt-1 font-medium text-[#18245c]">{reaction.label}</p>
        <p className="mt-1 text-sm text-[#607095]">{reaction.detail}</p>
      </div>
    </section>
  );
}
