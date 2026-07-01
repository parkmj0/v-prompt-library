import type { AwardLabel } from "@/types";

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export const AWARD_LABEL_STYLE: Record<AwardLabel, string> = {
  대상: "bg-amber-100 text-amber-800 border-amber-300",
  Best: "bg-yellow-100 text-yellow-800 border-yellow-300",
  참신상: "bg-neutral-200 text-neutral-700 border-neutral-300",
  운영특별상: "bg-orange-100 text-orange-800 border-orange-300",
  추천작: "bg-blue-100 text-blue-700 border-blue-300",
};
