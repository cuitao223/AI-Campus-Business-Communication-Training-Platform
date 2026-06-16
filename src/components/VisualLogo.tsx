import {
  BadgeDollarSign,
  BarChart3,
  Bot,
  BriefcaseBusiness,
  ChartSpline,
  FileText,
  Handshake,
  Landmark,
  Mic,
  Palette,
  Repeat2,
  Rocket,
  ShieldAlert,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Trophy,
  type LucideIcon,
} from "lucide-react";

const scenarioIcons: Record<string, { icon: LucideIcon; gradient: string; glow: string }> = {
  part_time_salary: {
    icon: BriefcaseBusiness,
    gradient: "from-sky-500 to-indigo-500",
    glow: "shadow-sky-200",
  },
  freelance_quote: {
    icon: Palette,
    gradient: "from-violet-500 to-fuchsia-500",
    glow: "shadow-violet-200",
  },
  campus_startup: {
    icon: Rocket,
    gradient: "from-teal-500 to-emerald-500",
    glow: "shadow-teal-200",
  },
  second_hand_bargain: {
    icon: Repeat2,
    gradient: "from-amber-500 to-orange-500",
    glow: "shadow-amber-200",
  },
};

const challengeIcons: Record<string, { icon: LucideIcon; gradient: string; glow: string }> = {
  freelance_quote: {
    icon: BadgeDollarSign,
    gradient: "from-violet-500 to-indigo-500",
    glow: "shadow-violet-200",
  },
  part_time_salary: {
    icon: ShieldAlert,
    gradient: "from-rose-500 to-orange-500",
    glow: "shadow-rose-200",
  },
  second_hand_bargain: {
    icon: ShoppingBag,
    gradient: "from-amber-500 to-teal-500",
    glow: "shadow-amber-200",
  },
};

const featureIcons: Record<string, LucideIcon> = {
  role: Bot,
  score: BarChart3,
  risk: ShieldCheck,
  report: FileText,
  voice: Mic,
  growth: ChartSpline,
  achievement: Trophy,
  deal: Handshake,
  economy: Landmark,
  sparkle: Sparkles,
};

export function ScenarioLogo({ scenarioId, size = "md" }: { scenarioId: string; size?: "sm" | "md" | "lg" }) {
  const config = scenarioIcons[scenarioId] ?? scenarioIcons.freelance_quote;
  return <LogoBadge icon={config.icon} gradient={config.gradient} glow={config.glow} size={size} />;
}

export function ChallengeLogo({ href }: { href: string }) {
  const scenarioId = href.includes("part_time_salary") ? "part_time_salary" : href.includes("second_hand_bargain") ? "second_hand_bargain" : "freelance_quote";
  const config = challengeIcons[scenarioId];
  return <LogoBadge icon={config.icon} gradient={config.gradient} glow={config.glow} size="sm" />;
}

export function FeatureLogo({ name, size = "sm" }: { name: keyof typeof featureIcons; size?: "sm" | "md" }) {
  return <LogoBadge icon={featureIcons[name]} gradient="from-indigo-500 to-teal-500" glow="shadow-indigo-200" size={size} />;
}

export function BrandMark() {
  return (
    <div className="relative h-16 w-16">
      <div className="absolute inset-0 rounded-[20px] bg-gradient-to-br from-indigo-500 via-violet-500 to-teal-500 shadow-2xl shadow-indigo-200" />
      <div className="absolute inset-1 grid place-items-center rounded-[17px] border border-white/30 bg-white/12 text-white backdrop-blur">
        <Sparkles size={30} />
      </div>
    </div>
  );
}

function LogoBadge({ icon: Icon, gradient, glow, size }: { icon: LucideIcon; gradient: string; glow: string; size: "sm" | "md" | "lg" }) {
  const box = size === "lg" ? "h-14 w-14 rounded-[18px]" : size === "md" ? "h-11 w-11 rounded-[14px]" : "h-9 w-9 rounded-[12px]";
  const iconSize = size === "lg" ? 28 : size === "md" ? 22 : 18;
  return (
    <span className={`logo-badge grid ${box} place-items-center bg-gradient-to-br ${gradient} text-white shadow-lg ${glow}`}>
      <Icon size={iconSize} strokeWidth={2.2} />
    </span>
  );
}
