import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export function BackLink({ href = "/", label = "返回" }: { href?: string; label?: string }) {
  return (
    <Link href={href} className="btn-secondary inline-flex h-9 items-center gap-1.5 rounded-md px-3 text-sm font-medium">
      <ChevronLeft size={16} />
      {label}
    </Link>
  );
}
