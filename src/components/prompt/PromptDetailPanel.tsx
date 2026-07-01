"use client";

import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import type { PromptEntry } from "@/types";
import { Badge } from "@/components/ui/Badge";

const CLOSE_ICON = "✕"; // 닫기 버튼 아이콘 — 변경 가능: ×, ⟩⟩, », ▶, ←, ↩

const CATEGORY_META: Record<string, { icon: string; bg: string }> = {
  "개발/자동화": { icon: "⚙️", bg: "bg-category-dev" },
  "콘텐츠 제작": { icon: "✏️", bg: "bg-category-content" },
  "업무 운영": { icon: "📊", bg: "bg-category-ops" },
  고객관리: { icon: "💬", bg: "bg-category-crm" },
  "기획/검토": { icon: "🔍", bg: "bg-category-plan" },
};

interface PromptDetailPanelProps {
  entry: PromptEntry;
  onClose: () => void;
  isClosing?: boolean;
}

function PropRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[76px_1fr] items-start gap-xs">
      <span className="text-caption text-subtle shrink-0 pt-0.5">{label}</span>
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
  const scrollRef = useRef<HTMLDivElement>(null);
  const meta = CATEGORY_META[entry.category] ?? {
    icon: "📌",
    bg: "bg-surface-soft",
  };
  const previewImage = entry.thumbnail ?? entry.resultImage;
  const thumbnails = [previewImage, null, null, null];
  const currentImage = thumbnails[activeThumb];

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
    setActiveThumb(0);
  }, [entry.id]);

  async function handleCopy() {
    await navigator.clipboard.writeText(entry.promptText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <aside
      ref={scrollRef}
      className="w-full h-full overflow-y-auto flex flex-col"
      style={{
        animation: isClosing
          ? "panel-slide-out 0.18s cubic-bezier(0.4, 0, 1, 1) forwards"
          : "panel-slide-in 0.3s cubic-bezier(0.16, 1, 0.3, 1) 0.08s both",
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* ── 닫기 버튼 (좌상단 sticky) ───────────────────── */}
      <div className="sticky top-0 z-10 flex items-center justify-end px-md pt-xs bg-canvas/95 backdrop-blur-sm">
        <button
          onClick={onClose}
          aria-label="패널 닫기"
          className="w-8 h-8 flex items-center justify-center rounded-full bg-canvas border border-hairline shadow-sm text-subtle hover:bg-surface-soft hover:border-hairline-soft hover:text-ink transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
        >
          <span className="text-base leading-none select-none">
            {CLOSE_ICON}
          </span>
        </button>
      </div>

      {/* ── 상단 요약 ─────────────────────────────────── */}
      <div className="px-lg pt-sm pb-lg border-b border-hairline flex flex-col gap-sm">
        {/* 배지 */}
        <div className="flex flex-wrap gap-1">
          <Badge variant="award" value={entry.award}>
            {entry.award}
          </Badge>
          <Badge variant="category">{entry.category}</Badge>
        </div>

        {/* 제목 */}
        <h2 className="text-xl font-semibold leading-heading tracking-title text-ink">
          {entry.title}
        </h2>

        {/* 한 줄 요약 */}
        {entry.promptSummary && (
          <p className="text-sm text-subtle leading-body">
            {entry.promptSummary}
          </p>
        )}

        {/* 2컬럼: 프로퍼티 | 미리보기 */}
        <div className="flex flex-wrap items-start gap-md mt-xs">
          {/* 좌: 프로퍼티 */}
          <div className="flex-1 min-w-[180px] flex flex-col gap-xs">
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
              <PropRow label="태그">
                <div className="flex flex-wrap gap-1">
                  {entry.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-2 py-0.5 text-badge rounded-pill bg-surface-card text-muted border border-hairline font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </PropRow>
            )}

            <PropRow label="반복 사용">
              <span className="inline-flex gap-[2px]">
                {Array.from({ length: 5 }, (_, i) => {
                  const filled =
                    entry.repeatType === "바로 복붙"
                      ? 5
                      : entry.repeatType === "구조이해 필요"
                        ? 1
                        : 3;
                  return (
                    <span
                      key={i}
                      className={`text-sm leading-none ${i < filled ? "text-warning" : "text-hairline"}`}
                    >
                      ★
                    </span>
                  );
                })}
              </span>
            </PropRow>

            {entry.packCandidate && (
              <PropRow label="팩 후보">
                <span className="inline-flex items-center gap-xxs text-sm font-medium text-success">
                  <span>✓</span>
                  <span>활용 가능</span>
                </span>
              </PropRow>
            )}
          </div>

          {/* 우: 결과 미리보기 */}
          <div className="w-44 min-w-[160px] flex-shrink-0 flex flex-col gap-xs">
            {/* 메인 미리보기 카드 */}
            <div className="border border-hairline rounded-lg overflow-hidden shadow-sm">
              {entry.resultFileUrl ? (
                <a
                  href={entry.resultFileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block aspect-[4/3] relative group"
                >
                  {currentImage ? (
                    <Image
                      src={currentImage}
                      alt={`${entry.title} 결과물`}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div
                      className={`absolute inset-0 ${meta.bg} flex flex-col items-center justify-center gap-xs`}
                    >
                      <span className="text-4xl select-none opacity-60">
                        {meta.icon}
                      </span>
                      <span className="text-xs text-subtle text-center px-sm leading-snug">
                        결과물 미리보기
                      </span>
                    </div>
                  )}
                  {/* 호버 오버레이 */}
                  <div className="absolute inset-0 bg-ink/0 group-hover:bg-ink/30 transition-colors flex items-center justify-center">
                    <span className="text-xs font-medium text-canvas opacity-0 group-hover:opacity-100 transition-opacity bg-ink/60 backdrop-blur-sm px-sm py-xxs rounded-md whitespace-nowrap">
                      결과물 보기 ↗
                    </span>
                  </div>
                  <div className="absolute bottom-2 right-2 bg-canvas/80 backdrop-blur-sm text-micro px-xs py-xxs rounded-xs text-muted font-medium leading-none">
                    {activeThumb + 1} / {thumbnails.length}
                  </div>
                </a>
              ) : (
                <div className="aspect-[4/3] relative">
                  <div
                    className={`absolute inset-0 ${meta.bg} flex flex-col items-center justify-center gap-xs`}
                  >
                    <span className="text-4xl select-none opacity-60">
                      {meta.icon}
                    </span>
                    <span className="text-xs text-subtle text-center px-sm leading-snug">
                      결과물 미리보기
                    </span>
                  </div>
                  <div className="absolute bottom-2 right-2 bg-canvas/80 backdrop-blur-sm text-micro px-xs py-xxs rounded-xs text-muted font-medium leading-none">
                    {activeThumb + 1} / {thumbnails.length}
                  </div>
                </div>
              )}
            </div>

            {/* 썸네일 스트립 */}
            <div className="flex gap-xxs">
              {thumbnails.map((img, i) => (
                <button
                  key={i}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveThumb(i);
                  }}
                  className={`relative w-9 h-9 rounded-xs overflow-hidden flex-shrink-0 ring-1 transition-opacity ${
                    i === activeThumb
                      ? "ring-muted opacity-100"
                      : "ring-hairline opacity-40 hover:opacity-70"
                  }`}
                >
                  {img ? (
                    <Image src={img} alt="" fill className="object-cover" />
                  ) : (
                    <div
                      className={`w-full h-full ${meta.bg} flex items-center justify-center`}
                    >
                      <span className="text-micro select-none">
                        {meta.icon}
                      </span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── 업무 상황 + 최종 제출 Prompt ────────────────── */}
      <div className="px-lg py-md flex flex-col gap-md border-b border-hairline">
        {entry.usage && (
          <div>
            <p className="text-caption font-semibold text-subtle uppercase tracking-normal mb-xxs">
              업무 상황
            </p>
            <p className="text-sm text-body leading-body">{entry.usage}</p>
          </div>
        )}
        <div>
          <p className="text-caption font-semibold text-subtle uppercase tracking-normal mb-sm">
            최종 제출 Prompt
          </p>
          <div className="group relative">
            <pre className="text-xs text-muted bg-surface-soft border border-hairline rounded-lg p-md whitespace-pre-wrap font-mono leading-body">
              {entry.promptText}
            </pre>
            <button
              onClick={handleCopy}
              className="absolute top-sm right-sm opacity-0 group-hover:opacity-100 transition-opacity bg-primary-soft text-on-primary text-xs font-medium px-sm py-xxs rounded-md hover:bg-primary-active"
            >
              {copied ? "✓ Copied" : "Copy"}
            </button>
          </div>
        </div>
      </div>

      {/* ── 활용 방법 ─────────────────────────────────── */}
      {(entry.effect || entry.usage) && (
        <div className="px-lg py-md border-b border-hairline">
          <p className="text-caption font-semibold text-subtle uppercase tracking-normal mb-xxs">
            활용 방법
          </p>
          <p className="text-sm text-body leading-body">
            {entry.effect || entry.usage}
          </p>
        </div>
      )}

      {/* ── Cell / 제출자 ─────────────────────────────── */}
      {(entry.cell || entry.submitter) && (
        <div className="px-lg py-md border-b border-hairline flex flex-col gap-xs">
          {entry.cell && (
            <div className="grid grid-cols-[76px_1fr] gap-xs">
              <span className="text-caption text-subtle">Cell</span>
              <span className="text-sm text-body">{entry.cell}</span>
            </div>
          )}
          {entry.submitter && (
            <div className="grid grid-cols-[76px_1fr] gap-xs">
              <span className="text-caption text-subtle">제출자</span>
              <span className="text-sm text-body">{entry.submitter}</span>
            </div>
          )}
        </div>
      )}
    </aside>
  );
}
