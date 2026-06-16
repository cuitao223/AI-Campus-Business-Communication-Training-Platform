import Link from "next/link";
import { BrainCircuit } from "lucide-react";

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-indigo-100 bg-white/82 shadow-[0_8px_30px_rgba(83,109,254,0.06)] backdrop-blur-xl transition-all duration-300">
      <div className="container flex h-14 items-center justify-between">
        <Link href="/" className="group flex items-center gap-2 font-semibold text-[#18245c]">
          <span className="grid h-8 w-8 place-items-center rounded-md bg-gradient-to-br from-indigo-500 via-violet-500 to-teal-500 text-white shadow-lg shadow-indigo-200 transition duration-300 group-hover:rotate-3 group-hover:scale-105">
            <BrainCircuit size={18} />
          </span>
          AI 校园商务谈判官
        </Link>
        <nav className="flex items-center gap-2 text-sm text-[#607095]">
          <Link className="rounded-md px-3 py-2 hover:bg-indigo-50 hover:text-indigo-700" href="/scenarios">
            场景训练
          </Link>
          <Link className="btn-primary rounded-md px-3 py-2" href="/scenarios">
            开始训练
          </Link>
        </nav>
      </div>
    </header>
  );
}

