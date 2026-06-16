import { nanoid } from "nanoid";
import { baseScores, getScenario } from "@/data/scenarios";
import type { Message, Report, Scores, TrainingSession } from "@/types";

const positiveSignals = {
  valueExpression: ["价值", "成本", "经验", "质量", "方案", "服务", "效果", "能力", "优势", "预算"],
  dataPersuasion: ["多少", "时间", "周期", "数据", "人数", "页", "小时", "结算", "次数", "范围", "标准", "合同", "协议"],
  riskAwareness: ["押金", "资料费", "刷单", "定金", "验货", "平台", "协议", "风险", "安全", "先付", "先交", "商用"],
  bottomLineControl: ["底线", "不能低于", "不接受", "至少", "可以改为", "如果", "前提", "最多", "报价", "薪资"],
  professionalism: ["您好", "请问", "确认", "建议", "感谢", "方便", "我们可以", "我理解", "清楚"],
};

const riskReplies = {
  part_time_salary: "这个兼职信息里仍有一些规则不清楚。我可以先说流程，但押金、试岗和结算方式要看店里安排，你最关心哪一块？",
  freelance_quote: "预算确实有限，我更希望先看到方案或初稿。你能不能把价格压低一点，后面合作多了再补？",
  campus_startup: "我担心你们的用户量和执行能力。你能拿出什么数据，证明这件事值得我投入资源？",
  second_hand_bargain: "我想尽快成交，但价格还得再谈。你能说明这个价格为什么合理，以及怎么保证交易安全吗？",
};

export function createInitialSession(input: {
  scenarioId: string;
  userRole: string;
  aiRole: string;
  goal: string;
  bottomLine: string;
  opponentStyle: TrainingSession["opponentStyle"];
  difficulty: TrainingSession["difficulty"];
  openingMessage: string;
  realtimeHint: boolean;
  strictScoring: boolean;
}): TrainingSession {
  const now = Date.now();
  return {
    id: nanoid(),
    scenarioId: input.scenarioId,
    userRole: input.userRole,
    aiRole: input.aiRole,
    goal: input.goal,
    bottomLine: input.bottomLine,
    opponentStyle: input.opponentStyle,
    difficulty: input.difficulty,
    realtimeHint: input.realtimeHint,
    strictScoring: input.strictScoring,
    messages: [
      {
        id: nanoid(),
        role: "assistant",
        content: input.openingMessage,
        createdAt: now,
      },
    ],
    scores: { ...baseScores },
    risks: [],
    hints: [],
    stage: "opening",
    dealStatus: "not_yet",
    createdAt: now,
    updatedAt: now,
  };
}

export function assessUserMessage(session: TrainingSession, latestUserMessage: string) {
  const scenario = getScenario(session.scenarioId);
  const text = latestUserMessage.trim();
  const strictPenalty = session.strictScoring ? 1 : 0;
  const deltas: Scores = {
    valueExpression: countSignals(text, positiveSignals.valueExpression) * 3,
    dataPersuasion: countSignals(text, positiveSignals.dataPersuasion) * 3,
    riskAwareness: countSignals(text, positiveSignals.riskAwareness) * 4,
    bottomLineControl: countSignals(text, positiveSignals.bottomLineControl) * 4,
    professionalism: countSignals(text, positiveSignals.professionalism) * 2,
    dealProbability: 0,
  };

  if (text.length < 12) {
    deltas.professionalism -= 7 + strictPenalty;
    deltas.dealProbability -= 5;
  }
  if (/随便|算了|不干|爱要不要|你不懂/.test(text)) {
    deltas.professionalism -= 12;
    deltas.dealProbability -= 10;
  }
  if (/接受|可以|没问题/.test(text) && !/前提|如果|确认|协议|范围|结算|定金/.test(text)) {
    deltas.bottomLineControl -= 8 + strictPenalty;
  }
  if (/方案|套餐|分成|试点|预售|基础版|标准版|修改/.test(text)) {
    deltas.valueExpression += 6;
    deltas.dealProbability += 8;
  }
  if (/不接受|拒绝|不能|必须|至少|底线/.test(text)) {
    deltas.bottomLineControl += 6;
  }
  deltas.dealProbability += Math.round((deltas.valueExpression + deltas.dataPersuasion + deltas.professionalism) / 12);

  const risks = scenario?.riskKeywords.filter((keyword) => text.includes(keyword)) ?? [];
  const nextScores = clampScores(session.scores, deltas);
  const hint = buildHint(deltas, risks);
  const turnCount = session.messages.filter((message) => message.role === "user").length + 1;
  const terminalStatus = getTerminalStatus([...session.messages.map((message) => message.content), text].join("\n"), nextScores, turnCount);

  return {
    scoresDelta: deltas,
    scores: nextScores,
    risks,
    hint,
    stage: terminalStatus ? "ended" : turnCount >= 5 ? "closing" : turnCount >= 3 ? "bargaining" : "probing",
    dealStatus: terminalStatus ?? (nextScores.dealProbability >= 72 ? "likely" : nextScores.dealProbability <= 28 ? "unlikely" : "not_yet"),
  } as const;
}

export function generateLocalAssistantReply(session: TrainingSession, latestUserMessage: string) {
  const scenario = getScenario(session.scenarioId);
  const assess = assessUserMessage(session, latestUserMessage);
  const userAskedQuestion = /？|\?|吗|多少|怎么|是否|能否|结算|协议|范围|修改|验货/.test(latestUserMessage);
  const pressurePrefix =
    session.opponentStyle === "dominant"
      ? "我需要你说得更具体一点。"
      : session.opponentStyle === "price_pressure"
        ? "价格和成本我还是有压力。"
        : session.opponentStyle === "skeptical"
          ? "你的说法有一定道理，但我还不完全确定。"
          : "可以，我们可以继续沟通。";

  let reply = riskReplies[session.scenarioId as keyof typeof riskReplies] ?? "你说得有道理，但我还需要进一步确认条件。";
  if (session.scenarioId === "part_time_salary" && session.opponentStyle === "price_pressure") {
    reply = "12 元是我们试用期标准；你想谈到更高，需要先说明经验、可排班时间和能承担的工作。";
  }
  if (userAskedQuestion) {
    reply = `${pressurePrefix}你问到的条件可以谈，但我希望你先明确：你的报价或要求依据是什么？如果我只能接受更低成本，你能给出哪些调整方案？`;
  }
  if (assess.risks.length > 0) {
    reply = `${pressurePrefix}这些要求确实涉及流程安排。你如果担心 ${assess.risks[0]}，可以提出你能接受的替代做法。`;
  }
  if (assess.scores.dealProbability >= 70) {
    reply = "你的条件比较清楚，也给出了可执行方案。如果能把付款、交付和风险责任写清楚，我可以考虑先达成初步合作。";
  }

  return {
    assistantMessage: reply,
    hiddenAssessment: {
      userStrength: assess.hint,
      userWeakness: assess.scores.dealProbability < 45 ? "需要补充更明确的依据、边界或风险处理方式。" : "可以进一步推进成交条件。",
      riskDetected: assess.risks,
      scoresDelta: assess.scoresDelta,
    },
    conversationState: {
      stage: assess.stage,
      dealStatus: assess.dealStatus,
    },
    scores: assess.scores,
    hint: assess.hint,
    scenarioName: scenario?.name ?? "训练场景",
  };
}

export function generateLocalReport(session: TrainingSession): Report {
  const scenario = getScenario(session.scenarioId);
  const userMessages = session.messages.filter((message) => message.role === "user").map((message) => message.content).join("\n");
  const askedDetails = /确认|请问|多少|时间|结算|范围|修改|验货|协议/.test(userMessages);
  const keptBottomLine = /不接受|不能低于|至少|底线|前提|如果/.test(userMessages);
  const usedData = /页|小时|人数|比例|成本|数据|次数|周期|价格|报价/.test(userMessages);
  const riskWarnings = session.risks.length > 0 ? Array.from(new Set(session.risks)).map((risk) => `本次对话出现“${risk}”相关信号，需要继续核实。`) : ["未发现明显高风险词，但仍建议确认书面协议、付款和交付规则。"];

  return {
    summary: `你完成了“${scenario?.name ?? "商务谈判"}”训练，当前成交概率为 ${session.scores.dealProbability}%。整体表现${session.scores.dealProbability >= 70 ? "较成熟" : "仍有提升空间"}，关键在于把价值、数据和底线说得更具体。`,
    result: {
      dealStatus: session.scores.dealProbability >= 72 ? "已达成初步合作" : session.scores.dealProbability >= 50 ? "谨慎继续" : "建议继续沟通",
      dealProbability: session.scores.dealProbability,
    },
    strengths: [
      askedDetails ? "能够主动追问关键条件，降低信息不对称。" : "完成了基本回应，保持了谈判连续性。",
      keptBottomLine ? "表达了底线或前提，没有直接无条件让步。" : "沟通态度相对平稳，为后续补充条件留下空间。",
      usedData ? "尝试用数量、价格或周期说明判断依据。" : "已经开始围绕目标进行沟通。",
    ],
    weaknesses: [
      askedDetails ? "仍可把问题拆得更细，例如付款节点、验收标准和违约处理。" : "对工作内容、交易条件或合作规则追问不足。",
      keptBottomLine ? "底线表达可以更柔和地绑定替代方案。" : "底线控制偏弱，容易被对方模糊条件带走。",
      usedData ? "数据可以进一步连接到对方收益。" : "缺少成本、时间、市场价格或用户数据作为说服依据。",
    ],
    riskWarnings,
    improvementSuggestions: [
      "先确认事实，再报价或表态，避免过早接受模糊条件。",
      "把要求拆成可执行条款，例如价格、范围、次数、周期和付款方式。",
      "面对压价时用缩小服务范围、试点方案或分层报价替代直接降价。",
    ],
    betterReplyExample: "我理解您关注成本。为了保证双方预期一致，我想先确认交付范围、验收标准和付款节点；如果预算有限，我们可以缩小范围做基础版，但押金、无薪试岗、无限修改或脱离平台交易这类风险条件我不能接受。",
    digitalEconomyExplanation: scenario?.economyExplanation ?? "本次训练体现了数字经济中的信息匹配、交易成本和风险控制问题。",
    nextPracticeSuggestion: "下一次可以重点练习“先澄清需求，再给条件化方案”，并尝试用 2-3 个数据点支撑自己的报价或合作要求。",
  };
}

function countSignals(text: string, words: string[]) {
  return words.reduce((total, word) => total + (text.includes(word) ? 1 : 0), 0);
}

function clampScores(current: Scores, deltas: Scores): Scores {
  return Object.fromEntries(
    Object.entries(current).map(([key, value]) => [key, Math.max(0, Math.min(100, value + deltas[key as keyof Scores]))]),
  ) as Scores;
}

function buildHint(deltas: Scores, risks: string[]) {
  if (risks.length > 0) return `你识别或提到了“${risks[0]}”相关风险，建议继续追问替代方案和书面确认。`;
  if (deltas.dataPersuasion > 0) return "你在追问具体条件，能降低信息不对称。";
  if (deltas.bottomLineControl > 0) return "你表达了底线或前提，谈判控制力提升。";
  if (deltas.valueExpression > 0) return "你开始说明价值或成本依据，可以继续补充数据。";
  return "本轮信息偏少，建议补充价格、范围、结算、风险或验收条件。";
}

function getTerminalStatus(text: string, scores: Scores, turnCount: number): TrainingSession["dealStatus"] | null {
  const reachedSignal = /成交|达成|同意|可以合作|就这么定|接受这个方案|按这个来|签协议|确认合作|可以，就|可以按|愿意合作|没问题，|那就这样|就这样定|先这么定|到时候见|回头见|明天见|周.*见|到时候.*见|约.*见|见面聊|按这个.*来|就按.*来/.test(text);
  const failedSignal = /不谈了|先不谈|算了|没必要继续|到此为止|直接拒绝|差距太大|不合作|拉倒|不干了|放弃这次/.test(text);
  const conditionalCooperation = /但|但是|不过|前提|如果|可以|建议|方案|替代|调整|确认/.test(text);
  if (reachedSignal) return "reached";
  if (failedSignal && !conditionalCooperation && scores.dealProbability <= 55) return "failed";
  if (turnCount >= 3 && scores.dealProbability >= 86 && scores.bottomLineControl >= 62) return "reached";
  return null;
}

export function appendMessage(session: TrainingSession, message: Omit<Message, "id" | "createdAt">): TrainingSession {
  const now = Date.now();
  return {
    ...session,
    messages: [...session.messages, { ...message, id: nanoid(), createdAt: now }],
    updatedAt: now,
  };
}
