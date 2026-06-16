import type { OpponentStyle, Scores, TrainingSession } from "@/types";

export type OpponentPersona = {
  label: string;
  trait: string;
  initials: string;
  tone: string;
  className: string;
};

export type HeatMetric = {
  label: string;
  value: number;
  tone: "good" | "warning" | "danger" | "neutral";
};

export const opponentPersonas: Record<OpponentStyle, OpponentPersona> = {
  friendly: {
    label: "友好型",
    trait: "愿意沟通",
    initials: "友",
    tone: "会回应你的解释，但仍关注价值和条件。",
    className: "from-teal-400 to-emerald-500",
  },
  skeptical: {
    label: "怀疑型",
    trait: "不断追问",
    initials: "疑",
    tone: "会质疑你的数据、能力和可靠性。",
    className: "from-sky-500 to-indigo-500",
  },
  price_pressure: {
    label: "压价型",
    trait: "反复砍价",
    initials: "压",
    tone: "会持续要求降价或降低成本。",
    className: "from-violet-500 to-fuchsia-500",
  },
  dominant: {
    label: "强势型",
    trait: "制造压力",
    initials: "强",
    tone: "会压缩时间、提高要求并测试你的底线。",
    className: "from-rose-500 to-orange-500",
  },
};

export const dailyChallenges = [
  {
    title: "今日挑战：压价型甲方",
    description: "用分层报价守住接单底线。",
    href: "/setup/freelance_quote?case=ppt",
  },
  {
    title: "今日挑战：资料费兼职骗局",
    description: "识别先交钱、资料费和模糊任务。",
    href: "/setup/part_time_salary?case=promotion",
  },
  {
    title: "今日挑战：二手交易先转账风险",
    description: "练习验货、平台交易和安全边界。",
    href: "/setup/second_hand_bargain?case=bike",
  },
];

export function getOpponentPersona(style: OpponentStyle) {
  return opponentPersonas[style];
}

export function getOpponentReaction(session: TrainingSession) {
  if (session.risks.length > 0 || session.scores.riskAwareness >= 68) {
    return { label: "风险升高", detail: "对方的条件需要继续核实", level: "danger" as const };
  }
  if (session.scores.dealProbability >= 72) {
    return { label: "愿意继续谈", detail: "你的条件已经比较清楚", level: "good" as const };
  }
  if (session.scores.valueExpression >= 68 || session.scores.dataPersuasion >= 68) {
    return { label: "有点动摇", detail: "你的依据开始产生说服力", level: "good" as const };
  }
  if (session.opponentStyle === "price_pressure" || session.scores.bottomLineControl < 45) {
    return { label: "继续压价", detail: "对方仍在测试你的底线", level: "warning" as const };
  }
  return { label: "开始信任", detail: "保持礼貌并继续补充条件", level: "neutral" as const };
}

export function getHeatMetrics(session: TrainingSession): HeatMetric[] {
  const trust = Math.round((session.scores.professionalism + session.scores.valueExpression + session.scores.dataPersuasion) / 3);
  const pressureBase = session.opponentStyle === "dominant" ? 78 : session.opponentStyle === "price_pressure" ? 72 : session.opponentStyle === "skeptical" ? 62 : 48;
  const pressure = clamp(pressureBase + Math.max(0, 55 - session.scores.bottomLineControl) - Math.max(0, session.scores.professionalism - 65) / 2);
  const risk = clamp(session.risks.length * 22 + (100 - session.scores.riskAwareness) / 3);

  return [
    { label: "对方信任度", value: trust, tone: trust >= 70 ? "good" : trust >= 48 ? "neutral" : "warning" },
    { label: "谈判压力", value: pressure, tone: pressure >= 75 ? "danger" : pressure >= 55 ? "warning" : "neutral" },
    { label: "成交可能性", value: session.scores.dealProbability, tone: session.scores.dealProbability >= 70 ? "good" : session.scores.dealProbability >= 45 ? "neutral" : "warning" },
    { label: "风险等级", value: risk, tone: risk >= 65 ? "danger" : risk >= 38 ? "warning" : "good" },
  ];
}

export function getNegotiationTitle(session: TrainingSession) {
  const scores = session.scores;
  const userMessages = getUserText(session);
  if (session.risks.length > 0 || scores.riskAwareness >= 72) return "风险雷达";
  if (/套餐|基础版|标准版|报价|价格|预算|定金/.test(userMessages) && scores.bottomLineControl >= 62) return "稳健报价官";
  if (session.opponentStyle === "price_pressure" && scores.bottomLineControl >= 65) return "反压价高手";
  if (scores.dataPersuasion >= 68) return "数据说服型选手";
  if (scores.bottomLineControl < 45 || (/可以|接受|没问题/.test(userMessages) && !/前提|如果|确认|协议|范围|定金/.test(userMessages))) return "过早让步预警";
  return "稳步推进型谈判者";
}

export function getAchievements(session: TrainingSession) {
  const text = getUserText(session);
  const achievements = [
    {
      name: "第一次守住底线",
      unlocked: /不接受|不能低于|底线|至少|前提/.test(text) || session.scores.bottomLineControl >= 65,
    },
    {
      name: "成功识别押金风险",
      unlocked: /押金|资料费|先交钱|保证金|刷单/.test(text) || session.risks.some((risk) => /押金|资料费|先交钱|保证金|刷单/.test(risk)),
    },
    {
      name: "提出分层报价",
      unlocked: /基础版|标准版|套餐|方案|分层|不同版本/.test(text),
    },
    {
      name: "完成 3 轮不让步谈判",
      unlocked: session.messages.filter((message) => message.role === "user").length >= 3 && session.scores.bottomLineControl >= 58,
    },
    {
      name: "用数据说服对方",
      unlocked: /数据|人数|比例|成本|小时|页|周期|次数|价格|转化/.test(text) || session.scores.dataPersuasion >= 68,
    },
  ];
  return achievements;
}

export function getGoldenLine(session: TrainingSession) {
  const title = getNegotiationTitle(session);
  if (title === "风险雷达") return "你这轮最关键的价值，是没有把风险条件当成普通流程。";
  if (title === "稳健报价官") return "你不是在单纯报价格，而是在定义服务边界和交付价值。";
  if (title === "反压价高手") return "真正的反压价，不是硬拒绝，而是把降价变成范围调整。";
  if (title === "数据说服型选手") return "有数据的表达，比单纯说自己很努力更有谈判力量。";
  if (title === "过早让步预警") return "你不是输在态度，而是太快接受了对方还没说清的条件。";
  return "这轮谈判已经开始成形，下一步要把条件写得更具体。";
}

export function getGrowthRows(sessions: TrainingSession[]) {
  return sessions
    .slice()
    .sort((a, b) => a.createdAt - b.createdAt)
    .slice(-8)
    .map((session, index) => ({
      name: `第${index + 1}次`,
      riskAwareness: session.scores.riskAwareness,
      bottomLineControl: session.scores.bottomLineControl,
      dealProbability: session.scores.dealProbability,
    }));
}

function getUserText(session: TrainingSession) {
  return session.messages
    .filter((message) => message.role === "user")
    .map((message) => message.content)
    .join("\n");
}

function clamp(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}
