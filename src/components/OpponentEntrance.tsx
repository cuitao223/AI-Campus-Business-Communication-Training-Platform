import { X } from "lucide-react";
import { ChatAvatar } from "@/components/ChatAvatar";
import type { OpponentStyle, TrainingSession } from "@/types";

const styleCopy: Record<OpponentStyle, { label: string; tag: string }> = {
  friendly: { label: "友好型", tag: "愿意沟通" },
  skeptical: { label: "怀疑型", tag: "不断追问" },
  price_pressure: { label: "压价型", tag: "反复砍价" },
  dominant: { label: "强势型", tag: "制造压力" },
};

export function OpponentEntrance({ session, onClose }: { session: TrainingSession; onClose: () => void }) {
  const copy = styleCopy[session.opponentStyle];

  return (
    <div className="pointer-events-none absolute inset-x-4 top-4 z-20 flex justify-center">
      <section className="opponent-entrance pointer-events-auto w-full max-w-[460px] rounded-[22px] border border-white/70 bg-white/82 p-4 shadow-[0_24px_70px_rgba(45,62,110,0.22)] backdrop-blur-2xl">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="absolute -inset-2 rounded-[22px] bg-indigo-200/45 blur-xl" />
            <ChatAvatar variant="opponent" style={session.opponentStyle} label={session.aiRole} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-indigo-600">{copy.tag}</p>
            <h2 className="mt-1 truncate text-lg font-semibold text-[#18245c]">
              {copy.label}
              {session.aiRole}登场
            </h2>
            <p className="mt-1 truncate text-sm text-[#607095]">准备进入真实谈判节奏</p>
          </div>
          <button onClick={onClose} className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-indigo-100 bg-white/72 text-[#607095] transition hover:bg-indigo-50" aria-label="关闭出场动画">
            <X size={15} />
          </button>
        </div>
      </section>
    </div>
  );
}
