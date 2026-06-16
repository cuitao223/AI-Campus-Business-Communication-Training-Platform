"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Play } from "lucide-react";
import { BackLink } from "@/components/BackLink";
import { getScenario } from "@/data/scenarios";
import { createInitialSession } from "@/lib/engine";
import { saveSession } from "@/lib/storage";
import type { Difficulty, ExampleCase, OpponentStyle } from "@/types";

const styleLabels: Record<OpponentStyle, string> = {
  friendly: "友好型",
  skeptical: "怀疑型",
  price_pressure: "压价型",
  dominant: "强势型",
};

const difficultyLabels: Record<Difficulty, string> = {
  easy: "简单",
  normal: "普通",
  hard: "困难",
};

type SetupFormState = {
  userRole: string;
  aiRole: string;
  goal: string;
  bottomLine: string;
  opponentStyle: OpponentStyle;
  difficulty: Difficulty;
  realtimeHint: boolean;
  strictScoring: boolean;
};

export default function SetupPage() {
  const params = useParams<{ scenarioId: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const scenario = getScenario(params.scenarioId);
  const firstCase = scenario?.exampleCases[0] ?? null;
  const urlCaseId = searchParams.get("case") ?? "";
  const initialCase = scenario?.exampleCases.find((item) => item.id === urlCaseId) ?? firstCase;
  const [caseId, setCaseId] = useState(initialCase?.id ?? "");
  const [error, setError] = useState("");
  const [form, setForm] = useState<SetupFormState>(() => createFormState(initialCase));

  const selectedCase = useMemo(() => scenario?.exampleCases.find((item) => item.id === caseId) ?? firstCase, [scenario, caseId, firstCase]);

  useEffect(() => {
    const nextCase = scenario?.exampleCases.find((item) => item.id === urlCaseId) ?? firstCase;
    if (!nextCase) return;
    setCaseId(nextCase.id);
    setForm(createFormState(nextCase));
  }, [params.scenarioId, urlCaseId, scenario, firstCase]);

  if (!scenario || !selectedCase) {
    return <main className="container py-10">未找到该训练场景。</main>;
  }

  function updateForm<K extends keyof SetupFormState>(key: K, value: SetupFormState[K]) {
    setError("");
    setForm((current) => ({ ...current, [key]: value }));
  }

  function applyCase(nextCaseId: string) {
    const nextCase = scenario?.exampleCases.find((item) => item.id === nextCaseId);
    if (!nextCase) return;
    setCaseId(nextCase.id);
    setForm(createFormState(nextCase));
    setError("");
  }

  function submit() {
    if (!scenario || !selectedCase) return;
    const cleaned = {
      ...form,
      userRole: form.userRole.trim(),
      aiRole: form.aiRole.trim(),
      goal: form.goal.trim(),
      bottomLine: form.bottomLine.trim(),
    };
    if (!cleaned.userRole || !cleaned.aiRole || !cleaned.goal || !cleaned.bottomLine) {
      setError("请把身份、AI 角色、目标和底线填写完整。");
      return;
    }

    const session = createInitialSession({
      scenarioId: scenario.id,
      userRole: cleaned.userRole,
      aiRole: cleaned.aiRole,
      goal: cleaned.goal,
      bottomLine: cleaned.bottomLine,
      opponentStyle: cleaned.opponentStyle,
      difficulty: cleaned.difficulty,
      openingMessage: selectedCase.openingMessage,
      realtimeHint: cleaned.realtimeHint,
      strictScoring: cleaned.strictScoring,
    });
    saveSession(session);
    router.push(`/training/${session.id}`);
  }

  return (
    <main className="page-shell app-screen container py-4">
      <div className="reveal mb-4 flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-indigo-700">{scenario.shortName}</p>
          <h1 className="mt-1 text-3xl font-semibold text-[#18245c]">角色设定</h1>
          <p className="mt-2 max-w-3xl leading-7 text-[#607095]">{scenario.description}</p>
        </div>
        <BackLink href="/scenarios" label="返回场景" />
      </div>

      <div className="grid h-[calc(100%-116px)] min-h-0 gap-4 lg:grid-cols-[0.86fr_1.14fr]">
        <section className="panel reveal app-scroll rounded-lg p-4">
          <h2 className="mb-3 font-semibold text-[#18245c]">示例案例</h2>
          <div className="space-y-3">
            {scenario.exampleCases.map((example) => (
              <button
                key={example.id}
                onClick={() => applyCase(example.id)}
                className={`motion-card w-full rounded-lg border p-3 text-left transition ${caseId === example.id ? "border-indigo-400 bg-indigo-50 shadow-sm" : "border-indigo-100 bg-white/72 hover:border-indigo-200 hover:bg-indigo-50/50"}`}
              >
                <span className="font-medium text-[#18245c]">{example.title}</span>
                <span className="mt-1 block text-sm leading-6 text-[#607095]">{example.openingMessage}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="panel reveal-delay app-scroll rounded-lg p-4">
          <h2 className="mb-3 font-semibold text-[#18245c]">自定义训练参数</h2>
          <div className="grid gap-3 md:grid-cols-2">
            <Field label="我的身份" value={form.userRole} onChange={(value) => updateForm("userRole", value)} />
            <Field label="AI 角色" value={form.aiRole} onChange={(value) => updateForm("aiRole", value)} />
            <TextArea label="我的目标" value={form.goal} onChange={(value) => updateForm("goal", value)} />
            <TextArea label="我的底线" value={form.bottomLine} onChange={(value) => updateForm("bottomLine", value)} />
            <Select label="对方风格" value={form.opponentStyle} options={styleLabels} onChange={(value) => updateForm("opponentStyle", value as OpponentStyle)} />
            <Select label="难度" value={form.difficulty} options={difficultyLabels} onChange={(value) => updateForm("difficulty", value as Difficulty)} />
          </div>
          <div className="mt-4 flex flex-wrap gap-4 text-sm text-[#405077]">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={form.realtimeHint} onChange={(event) => updateForm("realtimeHint", event.target.checked)} />
              开启实时提示
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={form.strictScoring} onChange={(event) => updateForm("strictScoring", event.target.checked)} />
              开启严格评分
            </label>
          </div>
          {error ? <div className="mt-4 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">{error}</div> : null}
          <button onClick={submit} className="btn-primary mt-5 inline-flex h-10 items-center gap-2 rounded-md px-5 font-medium">
            <Play size={18} />
            开始对话
          </button>
        </section>
      </div>
    </main>
  );
}

function createFormState(example: ExampleCase | null): SetupFormState {
  return {
    userRole: example?.userRole ?? "",
    aiRole: example?.aiRole ?? "",
    goal: example?.goal ?? "",
    bottomLine: example?.bottomLine ?? "",
    opponentStyle: example?.opponentStyle ?? "price_pressure",
    difficulty: example?.difficulty ?? "normal",
    realtimeHint: true,
    strictScoring: true,
  };
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-[#405077]">{label}</span>
      <input className="focus-ring h-10 w-full rounded-md border border-indigo-100 bg-white/80 px-3 text-[#223056]" value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function TextArea({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-[#405077]">{label}</span>
      <textarea className="focus-ring min-h-20 w-full rounded-md border border-indigo-100 bg-white/80 p-3 text-[#223056]" value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function Select({ label, value, options, onChange }: { label: string; value: string; options: Record<string, string>; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-[#405077]">{label}</span>
      <select className="focus-ring h-10 w-full rounded-md border border-indigo-100 bg-white/80 px-3 text-[#223056]" value={value} onChange={(event) => onChange(event.target.value)}>
        {Object.entries(options).map(([key, label]) => (
          <option key={key} value={key}>
            {label}
          </option>
        ))}
      </select>
    </label>
  );
}
