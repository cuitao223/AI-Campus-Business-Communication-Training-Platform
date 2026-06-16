import { BadgeDollarSign, Crown, GraduationCap, Handshake, Search, Sparkles } from "lucide-react";
import { getOpponentPersona } from "@/lib/engagement";
import type { OpponentStyle } from "@/types";

type ChatAvatarProps =
  | {
      variant: "user";
      label?: string;
    }
  | {
      variant: "opponent";
      style: OpponentStyle;
      label?: string;
    };

const opponentIcons = {
  friendly: Handshake,
  skeptical: Search,
  price_pressure: BadgeDollarSign,
  dominant: Crown,
} as const;

export function ChatAvatar(props: ChatAvatarProps) {
  if (props.variant === "user") {
    return (
      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-white/70 bg-gradient-to-br from-[#2dd4bf] via-[#60a5fa] to-[#8b5cf6] shadow-[0_10px_24px_rgba(79,70,229,0.22)]" title={props.label ?? "user"}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_28%_22%,rgba(255,255,255,0.95),transparent_24%),radial-gradient(circle_at_76%_72%,rgba(255,255,255,0.28),transparent_30%)]" />
        <div className="absolute inset-0 grid place-items-center text-white">
          <GraduationCap size={21} strokeWidth={2.3} />
        </div>
        <Sparkles className="absolute right-1 top-1 text-white/85" size={9} strokeWidth={2.4} />
      </div>
    );
  }

  const persona = getOpponentPersona(props.style);
  const Icon = opponentIcons[props.style];

  return (
    <div className={`relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-gradient-to-br ${persona.className} shadow-[0_10px_24px_rgba(79,70,229,0.2)]`} title={props.label ?? persona.label}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_28%_20%,rgba(255,255,255,0.9),transparent_22%),linear-gradient(145deg,rgba(255,255,255,0.22),transparent_52%)]" />
      <div className="absolute inset-0 grid place-items-center text-white">
        <Icon size={20} strokeWidth={2.4} />
      </div>
      <div className="absolute bottom-1 right-1 h-2 w-2 rounded-full border border-white/80 bg-emerald-300 shadow-sm" />
    </div>
  );
}
