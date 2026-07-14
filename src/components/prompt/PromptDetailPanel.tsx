"use client";

import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import {
  X,
  Check,
  Copy,
  ExternalLink,
  Code2,
  PenLine,
  BarChart3,
  MessageSquare,
  SearchCheck,
  Sparkles,
  Maximize2,
} from "lucide-react";
import type { PromptEntry } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { StarRating } from "@/components/ui/StarRating";
import { ImageLightbox } from "@/components/ui/ImageLightbox";

const CATEGORY_META: Record<string, { Icon: typeof Sparkles; tint: string }> = {
  "개발/자동화": { Icon: Code2, tint: "from-category-dev" },
  "콘텐츠 제작": { Icon: PenLine, tint: "from-category-content" },
  "업무 운영": { Icon: BarChart3, tint: "from-category-ops" },
  고객관리: { Icon: MessageSquare, tint: "from-category-crm" },
  "기획/검토": { Icon: SearchCheck, tint: "from-category-plan" },
};

interface PromptDetailPanelProps {
  entry: PromptEntry;
  onClose: () => void;
  isClosing?: boolean;
}

// 원문 전체를 화면에 렌더링하지 않기 위해 앞부분 80%만 미리보기로 노출한다.
// 복사 버튼은 이 미리보기가 아니라 entry.promptText(전문)를 그대로 사용한다.
function createPromptPreview(prompt?: string, ratio = 0.8) {
  const fullPrompt = String(prompt ?? "").trim();
  if (!fullPrompt) {
    return {
      promptPreview: "",
      isPromptTruncated: false,
    };
  }
  const previewLength = Math.floor(fullPrompt.length * ratio);
  const promptPreview = fullPrompt.slice(0, previewLength).trim();
  return {
    promptPreview,
    isPromptTruncated: fullPrompt.length > promptPreview.length,
  };
}

function PropRow({
  label,
  labelClassName = "text-muted",
  children,
}: {
  label: string;
  labelClassName?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[130px_1fr] items-start gap-xs">
      <span className={`text-caption shrink-0 pt-0.5 ${labelClassName}`}>
        {label}
      </span>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

export function PromptDetailPanel({
  entry,
  onClose,
  isClosing = false,
}: PromptDetailPanelProps) {
  const [copied, setCopied] = useState(false);
  const [activeThumb, setActiveThumb] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const meta = CATEGORY_META[entry.category] ?? {
    Icon: Sparkles,
    tint: "from-surface-strong",
  };
  const thumbnails = entry.previewImages;
  const thumbnail = thumbnails[activeThumb] ?? null;
  const { promptPreview, isPromptTruncated } = createPromptPreview(
    entry.promptText,
  );

  const [prevEntryId, setPrevEntryId] = useState(entry.id);
  if (prevEntryId !== entry.id) {
    setPrevEntryId(entry.id);
    setActiveThumb(0);
  }

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [entry.id]);

  async function handleCopy() {
    await navigator.clipboard.writeText(entry.promptText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <aside
      ref={scrollRef}
      className="panel-scrollarea w-full h-full overflow-y-auto flex flex-col"
      style={{
        animation: isClosing
          ? "panel-slide-out 0.18s cubic-bezier(0.4, 0, 1, 1) forwards"
          : "panel-slide-in 0.3s cubic-bezier(0.16, 1, 0.3, 1) 0.08s both",
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* ── 닫기 버튼 (sticky, 섬네일 이미지 위 오버레이) ── */}
      <div className="sticky top-0 z-20 h-0 overflow-visible">
        <div className="flex items-center justify-end px-md pt-xs">
          <button
            onClick={onClose}
            aria-label="패널 닫기"
            className="w-8 h-8 flex items-center justify-center rounded-full bg-canvas/60 backdrop-blur-sm border border-hairline-soft text-on-dark hover:bg-canvas/80 hover:text-on-dark transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* ── 섬네일 이미지 (카드 섬네일과 동일 스타일) ──── */}
      <div
        className={`relative h-48 w-full overflow-hidden bg-linear-to-br ${meta.tint} to-surface-dark-elevated flex-shrink-0`}
      >
        {thumbnail ? (
          <button
            type="button"
            onClick={() => setIsLightboxOpen(true)}
            className="absolute inset-0 h-full w-full cursor-zoom-in"
            aria-label="이미지 크게 보기"
          >
            <Image
              src={thumbnail}
              alt={entry.title}
              fill
              className="object-cover"
            />
          </button>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-xs">
            <meta.Icon size={28} className="text-on-dark/60" />
            <span className="text-xs text-muted text-center px-sm leading-snug">
              결과물 미리보기
            </span>
          </div>
        )}

        {thumbnails.length > 0 && (
          <button
            type="button"
            aria-label="이미지 크게 보기"
            onClick={(e) => {
              e.stopPropagation();
              setIsLightboxOpen(true);
            }}
            className="absolute bottom-3 right-3 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-canvas/30 text-on-dark backdrop-blur-2xl shadow-sm transition-colors duration-200 hover:bg-canvas/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
          >
            <Maximize2 size={20} />
          </button>
        )}

        {/* 썸네일 스트립 — 좌하단 오버레이 (미리보기 이미지가 1개 이상이면 노출) */}
        {thumbnails.length > 0 && (
          <div className="absolute bottom-2 left-2 z-10 flex gap-xxs">
            {thumbnails.map((img, i) => (
              <button
                key={img}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveThumb(i);
                }}
                className={`relative w-lg h-lg rounded-md overflow-hidden flex-shrink-0 ring-1 transition-opacity ${
                  i === activeThumb
                    ? "ring-on-dark/60 opacity-100"
                    : "ring-on-dark/30 opacity-60 hover:opacity-90"
                }`}
              >
                <Image src={img} alt="" fill className="object-cover" />
                <div className="absolute inset-0 bg-canvas/40 pointer-events-none" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── 상단 요약 ─────────────────────────────────── */}
      <div className="px-lg pt-lg pb-lg border-b border-subtle/40 flex flex-col gap-sm">
        {/* 배지 */}
        <div className="flex flex-wrap gap-1">
          {entry.award !== "추천작" && (
            <Badge variant="award" value={entry.award}>
              {entry.award}
            </Badge>
          )}
          <Badge variant="category">{entry.category}</Badge>
        </div>

        {/* 제목 */}
        <h2 className="text-xl font-semibold leading-heading tracking-title text-ink">
          {entry.title}
        </h2>

        {/* 한 줄 요약 */}
        {entry.promptSummary && (
          <p className="-mt-xxs text-sm text-muted leading-body">
            {entry.promptSummary}
          </p>
        )}

        {/* 프로퍼티 */}
        <div className="flex flex-col gap-xs mt-xs">
          <PropRow label="업무 유형">
            <span className="text-sm text-body">{entry.category || "—"}</span>
          </PropRow>

          <PropRow label="업무 대분류">
            <span className="text-sm text-body">{entry.core || "—"}</span>
          </PropRow>

          {entry.aiTools.length > 0 && (
            <PropRow label="활용 AI">
              <div className="flex flex-wrap gap-1">
                {entry.aiTools.map((tool) => (
                  <Badge key={tool} variant="tool">
                    {tool}
                  </Badge>
                ))}
              </div>
            </PropRow>
          )}

          {entry.tags.length > 0 && (
            <PropRow label="추천 키워드">
              <div className="flex flex-wrap gap-1">
                {entry.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex h-lg items-center justify-center px-2 py-0.5 text-badge leading-none rounded-pill bg-accent/20 text-on-accent border border-accent/40 font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </PropRow>
          )}

          <PropRow label="소속">
            <span className="text-sm text-body">{entry.cell}</span>
          </PropRow>
        </div>
      </div>

      {/* ── 활용지표 ─────────────────────────────────── */}
      <div className="px-lg py-md border-b border-subtle/40 flex flex-col gap-sm">
        <p className="text-caption font-semibold text-muted uppercase tracking-normal">
          활용지표
        </p>
        <div className="flex flex-col gap-xs">
          <PropRow label="업무 사용 반복성" labelClassName="text-muted">
            <StarRating
              filled={
                entry.repeatType === "바로 복붙"
                  ? 5
                  : entry.repeatType === "구조이해 필요"
                    ? 1
                    : 3
              }
            />
          </PropRow>

          <PropRow label="동일 업무 활용 가능성" labelClassName="text-muted">
            <StarRating
              filled={
                entry.usage === "동일 업무를 하는 구성원에게 활용 가능" ? 2 : 4
              }
            />
          </PropRow>

          <PropRow label="활용 방법">
            {entry.effect && (
              <span className="text-sm text-body leading-body">
                {entry.effect}
              </span>
            )}
          </PropRow>

          {entry.packCandidate && (
            <PropRow label="팩 후보">
              <span className="inline-flex items-center gap-xxs text-sm font-medium text-success">
                <Check size={14} />
                <span>활용 가능</span>
              </span>
            </PropRow>
          )}
        </div>
      </div>

      {/* ── 최종 결과물 보기 + 제출 Prompt + 활용 방법 ── */}
      <div className="px-lg py-md pb-lg flex flex-col gap-md border-b border-subtle/40">
        {entry.resultFileUrl && (
          <div>
            <p className="text-caption font-semibold text-muted uppercase tracking-normal mb-xxs">
              최종 결과물 보기
            </p>
            <a
              href={entry.resultFileUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-xxs text-sm text-accent hover:underline min-w-0"
            >
              <span className="truncate">{entry.resultFileUrl}</span>
              <ExternalLink size={14} className="shrink-0" />
            </a>
          </div>
        )}

        <div>
          <p className="text-caption font-semibold text-muted uppercase tracking-normal mb-sm">
            Prompt 미리보기
          </p>
          <div className="group relative">
            <pre className="text-xs text-muted bg-surface-soft border border-subtle/40 rounded-lg p-md whitespace-pre-wrap font-mono leading-body">
              {promptPreview}
              {isPromptTruncated && (
                <>
                  {"\n\n"}
                  <span className="text-subtle/60">
                    ... 이하 내용은 회사 업무 자산 보호를 위해 생략되었습니다.
                  </span>
                </>
              )}
            </pre>
            <button
              onClick={handleCopy}
              className="absolute top-sm right-sm inline-flex items-center gap-xxs opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-accent text-on-dark text-xs font-medium px-sm py-xxs rounded-md hover:opacity-90"
            >
              {copied ? (
                <>
                  <Check size={12} />
                  Copied
                </>
              ) : (
                <>
                  <Copy size={12} />
                  Copy
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <ImageLightbox
        images={thumbnails}
        initialIndex={activeThumb}
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        alt={entry.title}
      />
    </aside>
  );
}
