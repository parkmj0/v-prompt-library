import Image from "next/image";
import {
  Code2,
  PenLine,
  BarChart3,
  MessageSquare,
  SearchCheck,
  Sparkles,
} from "lucide-react";
import type { PromptEntry } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { StarRating } from "@/components/ui/StarRating";

const CATEGORY_META: Record<string, { Icon: typeof Sparkles; tint: string }> = {
  "개발/자동화": { Icon: Code2, tint: "from-category-dev" },
  "콘텐츠 제작": { Icon: PenLine, tint: "from-category-content" },
  "업무 운영": { Icon: BarChart3, tint: "from-category-ops" },
  고객관리: { Icon: MessageSquare, tint: "from-category-crm" },
  "기획/검토": { Icon: SearchCheck, tint: "from-category-plan" },
};

const REPEAT_TYPE_DOT: Record<string, string> = {
  "바로 복붙": "bg-success",
  "수정 후 사용": "bg-warning",
  "구조이해 필요": "bg-error",
};

const EXT_LABEL: Record<string, string> = {
  image: "IMG",
  pdf: "PDF",
  docx: "DOCX",
  pptx: "PPTX",
  xlsx: "XLSX",
  video: "MP4",
};

function PreviewMock({ Icon }: { Icon: typeof Sparkles }) {
  return (
    <div className="relative flex h-full w-full items-center justify-center">
      <div className="absolute h-20 w-28 -rotate-6 rounded-md border border-on-dark/10 bg-on-dark/5" />
      <div className="relative flex h-20 w-28 rotate-3 flex-col gap-xxs rounded-md border border-on-dark/15 bg-on-dark/10 p-xs shadow-card backdrop-blur-sm">
        <div className="flex items-center gap-xxs">
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-on-dark/15">
            <Icon size={10} className="text-on-dark" />
          </span>
          <span className="h-1 w-6 rounded-full bg-on-dark/20" />
        </div>
        <span className="h-1 w-full rounded-full bg-on-dark/15" />
        <span className="h-1 w-3/4 rounded-full bg-on-dark/15" />
        <span className="h-1 w-1/2 rounded-full bg-on-dark/10" />
      </div>
    </div>
  );
}

function RepeatBadge({ repeatType }: { repeatType: string }) {
  const filled =
    repeatType === "바로 복붙" ? 5 : repeatType === "구조이해 필요" ? 1 : 3;

  return (
    <div className="flex items-center gap-xs">
      <span className="text-caption text-muted font-medium whitespace-nowrap">
        업무 사용 반복성
      </span>
      <StarRating filled={filled} size={12} />
    </div>
  );
}

function CrossUsageBadge({ usage }: { usage: string }) {
  const filled = usage === "동일 업무를 하는 구성원에게 활용 가능" ? 2 : 4;

  return (
    <div className="flex items-center gap-xs">
      <span className="text-caption text-muted font-medium whitespace-nowrap">
        동일 업무 활용 가능성
      </span>
      <StarRating filled={filled} size={12} />
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
    Icon: Sparkles,
    tint: "from-surface-strong",
  };
  const image = entry.previewImages[0] ?? null;

  return (
    <article
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={`group cursor-pointer rounded-lg border bg-surface-card flex flex-col overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover ${
        isSelected ? "border-selected shadow-glow-accent" : "border-transparent"
      }`}
    >
      {/* 썸네일 */}
      <div
        className={`relative h-36 w-full overflow-hidden bg-linear-to-br ${meta.tint} to-surface-dark-elevated flex items-center justify-center flex-shrink-0`}
      >
        {image ? (
          <Image
            src={image}
            alt={entry.title}
            fill
            className="object-cover opacity-60 transition-transform duration-200 group-hover:scale-105"
          />
        ) : (
          <div className="transition-transform duration-200 group-hover:scale-105">
            <PreviewMock Icon={meta.Icon} />
          </div>
        )}

        {/* 상단 딤 그라데이션 — 배지 시인성 보정 */}
        {image && (
          <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-linear-to-b from-canvas/70 to-transparent" />
        )}

        {/* 수상 배지 — 좌상단 오버레이 (추천작 제외) */}
        {entry.award !== "추천작" && (
          <div className="absolute top-2 left-2">
            <Badge variant="award" value={entry.award}>
              {entry.award}
            </Badge>
          </div>
        )}

        {/* 결과 파일 확장자 — 우하단, hover 시 노출 */}
        <span className="absolute bottom-2 right-2 rounded-xs bg-canvas/60 px-xs py-xxs text-micro font-medium text-on-dark-soft opacity-0 backdrop-blur-sm transition-opacity duration-200 group-hover:opacity-100">
          {EXT_LABEL[entry.resultType] ?? entry.resultType}
        </span>
      </div>

      {/* 본문 */}
      <div className="p-md flex flex-col gap-2 flex-1">
        {/* 메타: 카테고리 · 난이도 */}
        <div className="flex items-center gap-xs flex-wrap">
          <span className="text-xs text-muted">{entry.category}</span>
          {entry.repeatType && (
            <span className="inline-flex items-center gap-[calc(var(--spacing-xxs)/2)] text-xs text-muted">
              <span
                className={`h-[var(--spacing-2xs)] w-[var(--spacing-2xs)] rounded-pill flex-shrink-0 ${
                  REPEAT_TYPE_DOT[entry.repeatType] ?? "bg-subtle"
                }`}
              />
              {entry.repeatType}
            </span>
          )}
        </div>

        {/* 제목 */}
        <h2 className="text-base font-semibold text-ink line-clamp-2 leading-snug">
          {entry.title}
        </h2>

        {/* 태그 */}
        {(entry.tags.length > 0 || entry.aiTools.length > 0) && (
          <div className="flex flex-wrap gap-1">
            {entry.tags
              .filter((tag) => !entry.aiTools.includes(tag))
              .slice(0, 2)
              .map((tag) => (
                <span
                  key={tag}
                  className="inline-flex h-lg items-center justify-center px-2 py-0.5 text-badge leading-none rounded-pill bg-accent/20 text-on-accent border border-accent/40 font-medium"
                >
                  {tag}
                </span>
              ))}
            {entry.aiTools.map((tool) => (
              <Badge key={tool} variant="tool">
                {tool}
              </Badge>
            ))}
          </div>
        )}

        {/* 하단: 활용지표 */}
        <div className="mt-auto pt-2 flex flex-col gap-1">
          <div className="flex items-center justify-between gap-xs">
            <RepeatBadge repeatType={entry.repeatType} />
            {entry.cell && (
              <span className="text-xs text-muted truncate shrink-0">
                {entry.cell}
              </span>
            )}
          </div>
          <CrossUsageBadge usage={entry.usage} />
        </div>
      </div>
    </article>
  );
}
