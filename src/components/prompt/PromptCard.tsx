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
      {/* Thumbnail */}
      <div
        className={`relative h-36 w-full ${meta.bg} flex items-center justify-center flex-shrink-0`}
      >
        {entry.thumbnail ? (
          <Image
            src={entry.thumbnail}
            alt={entry.title}
            fill
            className="object-cover"
          />
        ) : (
          <span className="text-4xl select-none">{meta.icon}</span>
        )}
        {entry.aiTools[0] && (
          <span className="absolute top-2 right-2 text-micro bg-canvas/90 backdrop-blur rounded-xs px-1.5 py-0.5 text-muted font-medium">
            {entry.aiTools[0]}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-md flex flex-col gap-2 flex-1">
        <div className="flex flex-wrap gap-1">
          <Badge variant="award" value={entry.award}>
            {entry.award}
          </Badge>
          <Badge variant="category">{entry.category}</Badge>
        </div>

        <h2 className="text-base font-semibold text-ink line-clamp-2 leading-snug">
          {entry.title}
        </h2>

        <p className="text-xs text-subtle line-clamp-2">
          {entry.promptSummary}
        </p>

        <div className="mt-auto pt-2 border-t border-hairline flex flex-col gap-1">
          <div className="flex items-center justify-between text-xs text-subtle">
            <span>
              {entry.cell} · {entry.submitter}
            </span>
            <span
              className={`px-1.5 py-0.5 rounded-xs text-micro font-medium ${
                entry.reuseType
                  ? "bg-reuse-bg text-reuse-text"
                  : "bg-surface-card text-subtle"
              }`}
            >
              {entry.reuseType ? "재사용" : "단발성"}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-subtle">
            <span>{entry.repeatType}</span>
            <span>·</span>
            <span className="truncate">{entry.aiTools.join(", ")}</span>
          </div>
        </div>
      </div>
    </article>
  );
}
