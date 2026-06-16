"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { FileText, Mic, MicOff, Send, Volume2, VolumeX } from "lucide-react";
import { BackLink } from "@/components/BackLink";
import { ChatAvatar } from "@/components/ChatAvatar";
import { EndDialog } from "@/components/EndDialog";
import { ScorePanel } from "@/components/ScorePanel";
import { HeatPanel } from "@/components/HeatPanel";
import { OpponentProfile } from "@/components/OpponentProfile";
import { OpponentEntrance } from "@/components/OpponentEntrance";
import { VoiceWave } from "@/components/VoiceWave";
import { getScenario } from "@/data/scenarios";
import { appendMessage } from "@/lib/engine";
import { getStoredSession, saveReport, saveSession } from "@/lib/storage";
import type { TrainingSession } from "@/types";

type SpeechRecognitionResultLike = {
  isFinal: boolean;
  0: { transcript: string };
};

type SpeechRecognitionEventLike = {
  resultIndex: number;
  results: ArrayLike<SpeechRecognitionResultLike>;
};

type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
};

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognitionLike;
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  }
}

export default function TrainingPage() {
  const params = useParams<{ sessionId: string }>();
  const router = useRouter();
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const chatScrollRef = useRef<HTMLDivElement | null>(null);
  const [session, setSession] = useState<TrainingSession | null>(null);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [listening, setListening] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [showEndDialog, setShowEndDialog] = useState(false);
  const [showOpponentEntrance, setShowOpponentEntrance] = useState(true);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const isTerminal = session ? session.stage === "ended" || session.dealStatus === "reached" || session.dealStatus === "failed" : false;

  useEffect(() => {
    setSession(getStoredSession(params.sessionId));
    setVoiceSupported(
      typeof window !== "undefined" &&
        (Boolean(window.SpeechRecognition || window.webkitSpeechRecognition) || "speechSynthesis" in window),
    );
  }, [params.sessionId]);

  useEffect(() => {
    return () => {
      recognitionRef.current?.abort();
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      setSpeakingMessageId(null);
    };
  }, []);

  useEffect(() => {
    if (isTerminal) setShowEndDialog(true);
  }, [isTerminal]);

  useEffect(() => {
    if (!session || isTerminal) return;
    setShowOpponentEntrance(true);
    const timer = window.setTimeout(() => setShowOpponentEntrance(false), 2800);
    return () => window.clearTimeout(timer);
  }, [session?.id, isTerminal]);

  const messageCount = session?.messages.length ?? 0;

  useEffect(() => {
    const chatScroll = chatScrollRef.current;
    if (!chatScroll) return;

    requestAnimationFrame(() => {
      chatScroll.scrollTo({ top: chatScroll.scrollHeight, behavior: "smooth" });
    });
  }, [messageCount, loading]);

  if (!session) {
    return <main className="container py-10">未找到训练记录，请从场景页重新开始。</main>;
  }

  const scenario = getScenario(session.scenarioId);
  const latestAssistantMessage = [...session.messages].reverse().find((message) => message.role === "assistant");
  const canRecognize = typeof window !== "undefined" && Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
  const canSpeak = typeof window !== "undefined" && "speechSynthesis" in window;
  const terminalMessage =
    session.dealStatus === "reached"
      ? "谈判已成交，系统已锁定对话。请生成复盘报告。"
      : session.dealStatus === "failed"
        ? "本轮未达预期，系统已锁定对话。请生成复盘报告。"
        : "本轮谈判已结束，系统已锁定对话。请生成复盘报告。";
  const terminalClass =
    session.dealStatus === "reached"
      ? "border-teal-200 bg-teal-50 text-teal-900"
      : session.dealStatus === "failed"
        ? "border-rose-200 bg-rose-50 text-rose-900"
        : "border-indigo-200 bg-indigo-50 text-indigo-900";

  async function send() {
    if (!session || !text.trim() || loading || isTerminal) return;
    stopListening();
    setError("");
    setLoading(true);
    const userText = text.trim();
    setText("");
    const withUser = appendMessage(session, { role: "user", content: userText });
    setSession(withUser);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session: withUser, latestUserMessage: userText }),
      });
      if (!response.ok) throw new Error("chat failed");
      const data = await response.json();
      const withAssistant = appendMessage(
        {
          ...withUser,
          scores: data.scores,
          risks: Array.from(new Set([...withUser.risks, ...data.hiddenAssessment.riskDetected])),
          hints: [...withUser.hints, data.hint],
          stage: data.conversationState.stage,
          dealStatus: data.conversationState.dealStatus,
        },
        { role: "assistant", content: data.assistantMessage },
      );
      setSession(withAssistant);
      saveSession(withAssistant);
      const assistantMessage = withAssistant.messages[withAssistant.messages.length - 1];
      if (autoSpeak) speak(data.assistantMessage, assistantMessage?.id);
    } catch {
      setError("AI 回复失败，请稍后重试。");
      saveSession(withUser);
    } finally {
      setLoading(false);
    }
  }

  async function finish() {
    if (!session) return;
    stopListening();
    stopSpeaking();
    setLoading(true);
    const ended = { ...session, stage: "ended" as const, updatedAt: Date.now() };
    saveSession(ended);
    try {
      const response = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session: ended }),
      });
      const report = await response.json();
      saveReport(ended.id, report);
      router.push(`/report/${ended.id}`);
    } finally {
      setLoading(false);
    }
  }

  function startListening() {
    if (!canRecognize) {
      setError("当前浏览器不支持语音输入，建议使用 Chrome 或 Edge。");
      return;
    }
    stopSpeaking();
    const Recognition = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!Recognition) return;
    const baseText = text.trim();
    const recognition = new Recognition();
    recognition.lang = "zh-CN";
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.onresult = (event) => {
      let transcript = "";
      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        transcript += event.results[index][0].transcript;
      }
      setText(baseText ? `${baseText} ${transcript.trim()}` : transcript.trim());
    };
    recognition.onerror = () => {
      setError("语音识别失败，请检查麦克风权限后重试。");
      setListening(false);
    };
    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
    setError("");
  }

  function stopListening() {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setListening(false);
  }

  function speak(content?: string, messageId?: string) {
    if (!content) return;
    if (!canSpeak) {
      setError("当前浏览器不支持 AI 朗读。");
      return;
    }
    window.speechSynthesis.cancel();
    setSpeakingMessageId(null);
    const utterance = new SpeechSynthesisUtterance(content);
    utterance.lang = "zh-CN";
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.onstart = () => setSpeakingMessageId(messageId ?? null);
    utterance.onend = () => setSpeakingMessageId(null);
    utterance.onerror = () => setSpeakingMessageId(null);
    window.speechSynthesis.speak(utterance);
  }

  function stopSpeaking() {
    if (canSpeak) window.speechSynthesis.cancel();
    setSpeakingMessageId(null);
  }

  return (
    <main className="page-shell container py-3">
      <div className="mb-3 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-indigo-700">{scenario?.name}</p>
          <h1 className="mt-1 text-2xl font-semibold text-[#18245c]">对话训练</h1>
        </div>
        <div className="flex gap-2">
          <BackLink href="/scenarios" label="返回场景" />
          <button onClick={finish} disabled={loading} className="btn-secondary inline-flex h-9 items-center gap-2 rounded-md px-4 text-sm font-medium disabled:opacity-60">
            <FileText size={16} />
            生成复盘
          </button>
        </div>
      </div>
      <div className="grid min-h-0 gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
        <section className="panel reveal relative flex h-[calc(100vh-122px)] min-h-[520px] flex-col overflow-hidden rounded-lg">
          {showOpponentEntrance && !isTerminal ? <OpponentEntrance session={session} onClose={() => setShowOpponentEntrance(false)} /> : null}
          <div className="border-b border-indigo-100 bg-indigo-50/35 p-4">
            <div className="grid gap-3 text-sm text-[#607095] md:grid-cols-3">
              <p>
                <span className="font-medium text-[#24345f]">身份：</span>
                {session.userRole}
              </p>
              <p>
                <span className="font-medium text-[#24345f]">目标：</span>
                {session.goal}
              </p>
              <p>
                <span className="font-medium text-[#24345f]">底线：</span>
                {session.bottomLine}
              </p>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <button
                onClick={listening ? stopListening : startListening}
                disabled={!canRecognize || loading || isTerminal}
                className="btn-secondary inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm disabled:cursor-not-allowed disabled:opacity-50"
                title={canRecognize ? "语音输入" : "当前浏览器不支持语音输入"}
              >
                {listening ? <MicOff size={16} /> : <Mic size={16} />}
                {listening ? "停止听写" : "语音输入"}
              </button>
              <button
                onClick={() => setAutoSpeak((value) => !value)}
                disabled={!canSpeak}
                className="btn-secondary inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm disabled:cursor-not-allowed disabled:opacity-50"
                title={canSpeak ? "AI 回复自动朗读" : "当前浏览器不支持朗读"}
              >
                {autoSpeak ? <Volume2 size={16} /> : <VolumeX size={16} />}
                {autoSpeak ? "自动朗读开" : "自动朗读关"}
              </button>
              <button
                onClick={() => speak(latestAssistantMessage?.content, latestAssistantMessage?.id)}
                disabled={!canSpeak || !latestAssistantMessage}
                className="btn-secondary inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Volume2 size={16} />
                朗读上一句
              </button>
              <button onClick={stopSpeaking} disabled={!canSpeak} className="btn-secondary inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm disabled:cursor-not-allowed disabled:opacity-50">
                <VolumeX size={16} />
                停止朗读
              </button>
              {!voiceSupported ? <span className="text-xs text-amber-700">当前浏览器语音能力有限，可继续使用文字输入。</span> : null}
            </div>
          </div>
          {isTerminal ? <div className={`reveal border-b px-4 py-3 text-sm ${terminalClass}`}>{terminalMessage}</div> : null}
          <div ref={chatScrollRef} className="chat-scroll min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain p-4 pr-2">
            {session.messages.map((message) => (
              <div key={message.id} className={`flex items-end gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                {message.role === "assistant" ? (
                  <div className="flex flex-col items-center gap-2">
                    <ChatAvatar variant="opponent" style={session.opponentStyle} label={session.aiRole} />
                    <VoiceWave active={speakingMessageId === message.id} />
                  </div>
                ) : null}
                <div className={`chat-message-in max-w-[82%] rounded-lg px-4 py-3 text-sm leading-7 shadow-sm ${message.role === "user" ? "bg-gradient-to-br from-indigo-500 to-violet-500 text-white" : "border border-indigo-100 bg-white/86 text-[#405077]"}`}>
                  <div className={`mb-1 text-xs ${message.role === "user" ? "text-indigo-100" : "text-[#7b88a8]"}`}>
                    {message.role === "user" ? "我" : session.aiRole}
                  </div>
                  {message.content}
                </div>
                {message.role === "user" ? <ChatAvatar variant="user" label={session.userRole} /> : null}
              </div>
            ))}
            {loading ? <p className="text-sm text-[#7b88a8]">正在生成回复...</p> : null}
          </div>
          {error ? <div className="border-t border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-800">{error}</div> : null}
          <div className="border-t border-indigo-100 bg-white/60 p-4">
            <textarea
              className="focus-ring min-h-24 w-full rounded-md border border-indigo-100 bg-white/90 p-3 text-[#223056]"
              value={text}
              disabled={isTerminal}
              placeholder="输入你的回复，Enter 发送，Shift + Enter 换行；也可以点击语音输入"
              onChange={(event) => setText(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  void send();
                }
              }}
            />
            <div className="mt-3 flex justify-end">
              <button onClick={send} disabled={loading || !text.trim() || isTerminal} className="btn-primary inline-flex h-10 items-center gap-2 rounded-md px-4 text-sm font-medium disabled:opacity-50">
                <Send size={16} />
                发送
              </button>
            </div>
          </div>
        </section>
        <aside className="reveal-delay space-y-4">
          <OpponentProfile session={session} />
          <HeatPanel session={session} />
          <ScorePanel session={session} />
        </aside>
      </div>
      {showEndDialog ? <EndDialog session={session} loading={loading} onClose={() => setShowEndDialog(false)} onReport={finish} /> : null}
    </main>
  );
}
