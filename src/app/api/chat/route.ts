import { NextResponse } from "next/server";
import { generateLocalAssistantReply } from "@/lib/engine";
import type { TrainingSession } from "@/types";

export async function POST(request: Request) {
  const body = (await request.json()) as { session: TrainingSession; latestUserMessage: string };

  if (isTerminal(body.session)) {
    return NextResponse.json({
      assistantMessage: "本轮谈判已经结束，请生成复盘报告。",
      hiddenAssessment: { userStrength: "", userWeakness: "", riskDetected: [], scoresDelta: zeroScores() },
      conversationState: { stage: "ended", dealStatus: body.session.dealStatus },
      scores: body.session.scores,
      hint: "谈判已进入终局状态。",
      scenarioName: "",
    });
  }

  const local = generateLocalAssistantReply(body.session, body.latestUserMessage);
  if (isTerminalState(local.conversationState.dealStatus)) {
    local.assistantMessage =
      local.conversationState.dealStatus === "reached"
        ? "可以，就按这个条件达成初步合作，建议现在生成复盘。"
        : "这次还没完全达到预期，建议现在生成复盘。";
  }
  local.assistantMessage = enforceRoleConsistency(body.session, body.latestUserMessage, limitAssistantMessage(local.assistantMessage));

  if (!process.env.OPENAI_API_KEY || isTerminalState(local.conversationState.dealStatus)) {
    return NextResponse.json(local);
  }

  try {
    const response = await fetch(`${process.env.OPENAI_BASE_URL ?? "https://api.openai.com/v1"}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: buildRoleSystemPrompt(body.session) },
          {
            role: "user",
            content: JSON.stringify({
              roleCard: buildRoleCard(body.session),
              conversationHistory: body.session.messages.slice(-8),
              latestUserMessage: body.latestUserMessage,
              localAssessment: local.hiddenAssessment,
              output: "只输出 JSON：{\"assistantMessage\":\"...\"}",
            }),
          },
        ],
      }),
    });
    if (!response.ok) return NextResponse.json(local);
    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    const parsed = content ? JSON.parse(content) : {};
    const assistantMessage = enforceRoleConsistency(body.session, body.latestUserMessage, limitAssistantMessage(parsed.assistantMessage ?? local.assistantMessage));
    const judgedState = await judgeDealStateWithAI(body.session, body.latestUserMessage, assistantMessage, local.conversationState.dealStatus);
    return NextResponse.json({
      ...local,
      assistantMessage,
      conversationState: {
        ...local.conversationState,
        stage: judgedState === "reached" || judgedState === "failed" ? "ended" : local.conversationState.stage,
        dealStatus: judgedState,
      },
    });
  } catch {
    return NextResponse.json(local);
  }
}

async function judgeDealStateWithAI(
  session: TrainingSession,
  latestUserMessage: string,
  assistantMessage: string,
  fallback: TrainingSession["dealStatus"],
): Promise<TrainingSession["dealStatus"]> {
  if (!process.env.OPENAI_API_KEY) return fallback;
  try {
    const response = await fetch(`${process.env.OPENAI_BASE_URL ?? "https://api.openai.com/v1"}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              "你是谈判状态裁判。只判断当前对话是否已经结束，不要评价话术。输出 JSON：{\"dealStatus\":\"not_yet|reached|unmet\",\"reason\":\"一句话理由\"}。reached=双方已明确约定条件、时间、价格、合作或自然收尾如到时候见；unmet=用户或对方明确表示不谈、不合作、条件差距太大或目标未达成并结束；not_yet=还在谈。",
          },
          {
            role: "user",
            content: JSON.stringify({
              scenarioId: session.scenarioId,
              userGoal: session.goal,
              userBottomLine: session.bottomLine,
              conversation: [...session.messages, { role: "user", content: latestUserMessage }, { role: "assistant", content: assistantMessage }],
            }),
          },
        ],
      }),
    });
    if (!response.ok) return fallback;
    const data = await response.json();
    const parsed = JSON.parse(data.choices?.[0]?.message?.content ?? "{}") as { dealStatus?: string };
    if (parsed.dealStatus === "reached") return "reached";
    if (parsed.dealStatus === "unmet") return "failed";
    return fallback === "reached" || fallback === "failed" ? fallback : "not_yet";
  } catch {
    return fallback;
  }
}

function buildRoleSystemPrompt(session: TrainingSession) {
  const roleCard = buildRoleCard(session);
  return [
    "你正在一个校园商务谈判训练系统中扮演“谈判对手”。",
    "你不是用户的助手，不是老师，不是复盘分析师，不要解释训练规则。",
    `你的固定身份：${roleCard.aiRole}。`,
    `你的对手风格：${roleCard.styleLabel}。`,
    `你的利益目标：${roleCard.interestGoal}。`,
    `你的行为方式：${roleCard.behaviorRule}。`,
    `禁止行为：${roleCard.forbiddenRule}。`,
    "必须始终用第一人称维护你的角色利益，不要跳出角色。",
    "回复必须简短，只说一句话，60 个中文字符以内。",
    "输出 JSON，字段只能包含 assistantMessage。",
  ].join("\n");
}

function buildRoleCard(session: TrainingSession) {
  const styleLabel = {
    friendly: "友好型，但仍要守住自身利益",
    skeptical: "怀疑型，会追问证据、能力和可靠性",
    price_pressure: "压价型，会持续控制成本、要求降价或要求依据",
    dominant: "强势型，会施压、压缩时间、提高要求",
  }[session.opponentStyle];

  const scenarioRule = {
    part_time_salary: {
      interestGoal: "控制用工成本，避免轻易提高试用期薪资，要求学生证明经验和稳定性",
      behaviorRule: "围绕薪资、排班、试用期、结算方式继续谈；不要主动帮学生争取更高工资",
      forbiddenRule: "不能忘记你是雇主/店长/招聘方；不能主动说给 16 元以上或直接满足用户底线",
    },
    freelance_quote: {
      interestGoal: "控制预算，争取更多交付内容和更低报价",
      behaviorRule: "继续追问价格依据、交付范围、修改次数；不要主动替用户抬价",
      forbiddenRule: "不能忘记你是甲方；不能主动提高预算或直接接受报价",
    },
    campus_startup: {
      interestGoal: "降低合作风险，确认真实用户量、试点成本和收益",
      behaviorRule: "追问数据、风险分担、试点方案和对方能带来的收益",
      forbiddenRule: "不能忘记你是合作方；不能无条件给资源、折扣或承诺",
    },
    second_hand_bargain: {
      interestGoal: "争取更有利价格，并控制交易安全风险",
      behaviorRule: "围绕成色、凭证、验货、价格和交易方式继续谈",
      forbiddenRule: "不能忘记你是买家或卖家；不能直接满足对方价格",
    },
  }[session.scenarioId] ?? {
    interestGoal: "维护自己的交易利益",
    behaviorRule: "继续追问依据和条件",
    forbiddenRule: "不能跳出角色",
  };

  return {
    scenarioId: session.scenarioId,
    userRole: session.userRole,
    aiRole: session.aiRole,
    styleLabel,
    ...scenarioRule,
    userGoal: session.goal,
    userBottomLine: session.bottomLine,
  };
}

function enforceRoleConsistency(session: TrainingSession, latestUserMessage: string, message: string) {
  const normalized = message.replace(/\s+/g, " ").trim();
  const userTurns = session.messages.filter((item) => item.role === "user").length;

  if (isOutOfRole(normalized)) {
    return fallbackInRoleReply(session, latestUserMessage);
  }

  if (session.scenarioId === "part_time_salary" && userTurns < 4) {
    const tooGenerousSalary = /涨到\s*16|16\s*元以上|至少\s*16|16\s*起步|可以.*16|同意.*16|熟练后.*16/.test(normalized);
    if (tooGenerousSalary) return "16 元现在做不到，试用期仍是 12 元；你先说说经验和可排班时间。";
  }

  if (session.opponentStyle === "price_pressure" && userTurns < 4) {
    const tooEasy = /可以|同意|没问题|就按|成交|达成/.test(normalized) && !/不能|暂时|先|依据|条件|范围|成本|但/.test(normalized);
    if (tooEasy) return "我还不能直接接受，你先说明这个价格或条件的依据。";
  }

  if (/408|专业课|不是店长|你是谁|忘了|你是什么/.test(latestUserMessage)) {
    return fallbackInRoleReply(session, latestUserMessage);
  }

  return normalized;
}

function isOutOfRole(message: string) {
  return /作为AI|作为一个AI|我是AI|我是模型|训练系统|我来帮你|建议你可以|你的表现|复盘|评分|我不是/.test(message);
}

function fallbackInRoleReply(session: TrainingSession, latestUserMessage: string) {
  const asksIdentity = /不是店长|你是谁|你是什么|忘了/.test(latestUserMessage);
  if (session.scenarioId === "part_time_salary") {
    return asksIdentity
      ? `我是${session.aiRole}，我们继续谈兼职条件。`
      : "那先说清楚，试用期 12 元，排班每周至少三天，你能接受吗？";
  }
  if (session.scenarioId === "freelance_quote") {
    return asksIdentity ? `我是${session.aiRole}，我们继续谈预算和交付范围。` : "那先说清楚预算和交付范围，你这个报价依据是什么？";
  }
  if (session.scenarioId === "campus_startup") {
    return asksIdentity ? `我是${session.aiRole}，我们继续谈合作条件。` : "你先说清楚用户数据和试点风险怎么控制。";
  }
  if (session.scenarioId === "second_hand_bargain") {
    return asksIdentity ? `我是${session.aiRole}，我们继续谈交易条件。` : "那先谈价格、成色和交易方式，你能接受怎么验货？";
  }
  return latestUserMessage.includes("你是谁") ? `我是${session.aiRole}，我们继续谈当前条件。` : "我们先回到这次交易条件本身。";
}

function limitAssistantMessage(message: string) {
  const normalized = String(message ?? "").replace(/\s+/g, " ").trim();
  if (normalized.length <= 90) return normalized;
  const firstSentence = normalized.split(/(?<=[。！？!?])/)[0];
  if (firstSentence && firstSentence.length <= 90) return firstSentence;
  return `${normalized.slice(0, 88)}…`;
}

function isTerminal(session: TrainingSession) {
  return session.stage === "ended" || isTerminalState(session.dealStatus);
}

function isTerminalState(status: TrainingSession["dealStatus"]) {
  return status === "reached" || status === "failed";
}

function zeroScores() {
  return {
    valueExpression: 0,
    dataPersuasion: 0,
    riskAwareness: 0,
    bottomLineControl: 0,
    professionalism: 0,
    dealProbability: 0,
  };
}
