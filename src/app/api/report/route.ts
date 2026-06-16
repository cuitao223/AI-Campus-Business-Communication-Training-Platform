import { NextResponse } from "next/server";
import { generateLocalReport } from "@/lib/engine";
import type { TrainingSession } from "@/types";

export async function POST(request: Request) {
  const body = (await request.json()) as { session: TrainingSession };
  const local = normalizeReport(generateLocalReport(body.session), body.session);

  if (!process.env.OPENAI_API_KEY) {
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
          {
            role: "system",
            content:
              "你是 AI 校园商务谈判官的复盘分析模型。请基于完整对话生成结构化 JSON，不要输出 Markdown。字段包括 summary,result,strengths,weaknesses,riskWarnings,improvementSuggestions,betterReplyExample,digitalEconomyExplanation,nextPracticeSuggestion。",
          },
          { role: "user", content: JSON.stringify({ session: body.session, localDraft: local }) },
        ],
      }),
    });
    if (!response.ok) return NextResponse.json(local);
    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    return NextResponse.json(normalizeReport(content ? JSON.parse(content) : local, body.session));
  } catch {
    return NextResponse.json(local);
  }
}

function normalizeReport(report: ReturnType<typeof generateLocalReport>, session: TrainingSession) {
  if (session.dealStatus === "reached") {
    return {
      ...report,
      result: {
        dealStatus: "已达成初步合作",
        dealProbability: Math.max(report.result?.dealProbability ?? 0, session.scores.dealProbability, 75),
      },
      summary: report.summary?.includes("破裂") ? "本轮谈判已达成初步合作，关键条件需要在后续用书面方式确认。" : report.summary,
    };
  }
  if (session.dealStatus === "failed") {
    return {
      ...report,
      result: {
        dealStatus: "未达预期",
        dealProbability: Math.min(report.result?.dealProbability ?? session.scores.dealProbability, session.scores.dealProbability, 35),
      },
      summary: report.summary?.includes("破裂") ? "本轮谈判未完全达成预期目标，建议复盘条件差距和下一轮表达方式。" : report.summary,
    };
  }
  return report;
}
