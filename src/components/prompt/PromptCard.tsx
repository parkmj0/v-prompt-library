import Image from "next/image";
import type { PromptEntry } from "@/types";
import { Badge } from "@/components/ui/Badge";

const CATEGORY_META: Record<string, { icon: string; bg: string }> = {
  "개발/자동화": { icon: "⚙️", bg: "bg-category-dev" },
  "콘텐츠 제작": { icon: "✏️", bg: "bg-category-content" },
  "업무 운영": { icon: "📊", bg: "bg-category-ops" },
  고객관리: { icon: "💬", bg: "bg-category-crm" },
  "기획/검토": { icon: "🔍", bg: "bg-category-plan" },
};

function RepeatBadge({ repeatType }: { repeatType: string }) {
  const filled =
    repeatType === "바로 복붙" ? 5 : repeatType === "구조이해 필요" ? 1 : 3;

  return (
    <div className="flex items-center gap-xs">
      <span className="text-caption text-subtle font-medium whitespace-nowrap">
        반복 활용
      </span>
      {repeatType === "바로 복붙" ? (
        <span className="inline-flex items-center px-2 py-0.5 text-badge rounded-pill bg-success/10 text-success border border-success/20 font-medium whitespace-nowrap">
          바로 복붙
        </span>
      ) : (
        <span className="inline-flex items-center gap-[1px]">
          {Array.from({ length: 5 }, (_, i) => (
            <span
              key={i}
              className={`text-sm leading-none select-none ${
                i < filled ? "text-warning" : "text-hairline-soft"
              }`}
            >
              {i < filled ? "★" : "☆"}
            </span>
          ))}
        </span>
      )}
    </div>
  );
}

interface PromptCardProps {
  entry: PromptEntry;
  isSelected: boolean;
  onClick: () => void;
}

export function PromptCard({ entry, isSelected, onClick }: PromptCardProps) {
  const meta = CATEGORY_META[entry.category] ?? {
    icon: "📌",
    bg: "bg-surface-soft",
  };

  return (
    <article
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={`cursor-pointer rounded-lg border bg-canvas flex flex-col overflow-hidden transition-all hover:shadow-md ${
        isSelected
          ? "border-primary shadow-md ring-1 ring-primary"
          : "border-hairline"
      }`}
    >
      {/* 썸네일 */}
      <div
        className={`relative h-36 w-full ${meta.bg} flex items-center justify-center flex-shrink-0`}
      >
        {(entry.thumbnail ?? entry.resultImage) ? (
          <Image
            src={(entry.thumbnail ?? entry.resultImage)!}
            alt={entry.title}
            fill
            className="object-cover"
          />
        ) : (
          <span className="text-4xl select-none">{meta.icon}</span>
        )}

        {/* 수상 배지 — 좌상단 오버레이 (추천작 제외) */}
        {entry.award !== "추천작" && (
          <div className="absolute top-2 left-2 opacity-80">
            <Badge variant="award" value={entry.award}>
              {entry.award}
            </Badge>
          </div>
        )}
      </div>

      {/* 본문 */}
      <div className="p-md flex flex-col gap-2 flex-1">
        {/* 메타: 카테고리 · AI */}
        <div className="flex items-center gap-1 text-xs text-subtle flex-wrap">
          <span>{entry.category}</span>
          {entry.aiTools.length > 0 && (
            <>
              <span className="text-hairline">·</span>
              <span>{entry.aiTools.join(", ")}</span>
            </>
          )}
        </div>

        {/* 제목 */}
        <h2 className="text-base font-semibold text-ink line-clamp-2 leading-snug">
          {entry.title}
        </h2>

        {/* 태그 */}
        {entry.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {entry.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-2 py-0.5 text-badge rounded-pill bg-accent/10 text-accent border border-accent/20 font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* 하단: 반복 활용 */}
        <div className="mt-auto pt-2 border-t border-hairline flex items-center justify-between gap-xs">
          <RepeatBadge repeatType={entry.repeatType} />
          {entry.cell && (
            <span className="text-xs text-subtle truncate shrink-0">
              {entry.cell}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
