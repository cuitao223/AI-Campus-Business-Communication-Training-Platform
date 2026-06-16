"use client";

import { FileText, Medal, RotateCcw, X } from "lucide-react";
import Link from "next/link";
import { getGoldenLine, getNegotiationTitle } from "@/lib/engagement";
import type { TrainingSession } from "@/types";

export function EndDialog({
  session,
  loading,
  onClose,
  onReport,
}: {
  session: TrainingSession;
  loading: boolean;
  onClose: () => void;
  onReport: () => void;
}) {
  const isReached = session.dealStatus === "reached";
  const isFailed = session.dealStatus === "failed";
  const title = isReached ? "谈判成交" : isFailed ? "未达预期" : "本轮谈判结束";
  const subtitle = isReached ? "你已达成初步合作，可以查看复盘和成就。" : isFailed ? "本轮没有完全达到目标，建议复盘条件差距和表达方式。" : "对话已结束，可以生成复盘报告。";
  const badgeText = isReached ? getNegotiationTitle(session) : isFailed ? "继续优化" : "训练完成";

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[#18245c]/18 px-4 backdrop-blur-md">
      <section className="reveal panel relative w-full max-w-[520px] rounded-[20px] p-6 text-center">
        <button onClick={onClose} className="absolute right-4 top-4 rounded-full p-2 text-[#607095] hover:bg-indigo-50" aria-label="关闭弹窗">
          <X size={18} />
        </button>

        <div className="mx-auto grid h-20 w-20 place-items-center rounded-[24px] bg-gradient-to-br from-amber-300 via-orange-400 to-rose-400 text-white shadow-2xl shadow-amber-200">
          {isReached ? <Medal size={42} /> : <FileText size={38} />}
        </div>

        <p className="mt-5 text-sm font-medium text-indigo-700">{badgeText}</p>
        <h2 className="mt-2 text-3xl font-semibold text-[#18245c]">{title}</h2>
        <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-[#607095]">{subtitle}</p>

        <div className="mt-5 rounded-lg border border-indigo-100 bg-indigo-50/70 p-4 text-left">
          <p className="text-xs font-medium text-[#7b88a8]">复盘金句</p>
          <p className="mt-2 text-sm leading-6 text-[#405077]">{getGoldenLine(session)}</p>
        </div>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button onClick={onReport} disabled={loading} className="btn-primary inline-flex h-11 items-center gap-2 rounded-md px-5 font-medium disabled:opacity-60">
            <FileText size={18} />
            {loading ? "生成中..." : "查看复盘报告"}
          </button>
          <Link href={`/setup/${session.scenarioId}`} className="btn-secondary inline-flex h-11 items-center gap-2 rounded-md px-5 font-medium">
            <RotateCcw size={18} />
            再练一次
          </Link>
        </div>
      </section>
    </div>
  );
}
