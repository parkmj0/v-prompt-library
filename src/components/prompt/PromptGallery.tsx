"use client";

import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import type { PromptEntry } from "@/types";
import { PromptCard } from "./PromptCard";
import { PromptDetailPanel } from "./PromptDetailPanel";

const CATEGORIES: { value: string; label: string }[] = [
  { value: "전체", label: "전체" },
  { value: "개발/자동화", label: "개발/자동화" },
  { value: "콘텐츠 제작", label: "콘텐츠" },
  { value: "업무 운영", label: "운영" },
  { value: "고객관리", label: "고객관리" },
  { value: "기획/검토", label: "기획/검토" },
];

const AWARD_FILTERS = ["수상 전체", "Best", "참신성", "운영특별상"];
const AI_FILTERS = ["AI 전체", "ChatGPT", "Claude", "Gemini"];
const DIFFICULTY_FILTERS = [
  "난이도 전체",
  "바로 복붙",
  "수정 후 사용",
  "구조이해 필요",
];

interface PromptGalleryProps {
  entries: PromptEntry[];
}

function normalizeAI(s: string) {
  return s.replace(/\s/g, "").toLowerCase();
}

export function PromptGallery({ entries }: PromptGalleryProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [displayedId, setDisplayedId] = useState<string | null>(null);
  const [isClosing, setIsClosing] = useState(false);
  const [activeCategory, setActiveCategory] = useState("전체");
  const [searchQuery, setSearchQuery] = useState("");
  const [awardFilter, setAwardFilter] = useState("수상 전체");
  const [aiFilter, setAiFilter] = useState("AI 전체");
  const [difficultyFilter, setDifficultyFilter] = useState("난이도 전체");
  const [panelWidth, setPanelWidth] = useState(480);
  const [isDragging, setIsDragging] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dragState = useRef<{ startX: number; startWidth: number } | null>(null);

  useEffect(() => {
    const saved = Number(localStorage.getItem("v-prompt-panel-width"));
    if (saved >= 300 && saved <= 800) setPanelWidth(saved);
  }, []);

  const handleDragStart = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      dragState.current = { startX: e.clientX, startWidth: panelWidth };
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      setIsDragging(true);
    },
    [panelWidth],
  );

  const handleDragMove = useCallback((e: React.PointerEvent) => {
    if (!dragState.current) return;
    const delta = dragState.current.startX - e.clientX;
    const next = Math.min(
      800,
      Math.max(300, dragState.current.startWidth + delta),
    );
    setPanelWidth(next);
  }, []);

  const handleDragEnd = useCallback(() => {
    dragState.current = null;
    setIsDragging(false);
    setPanelWidth((prev) => {
      localStorage.setItem("v-prompt-panel-width", String(prev));
      return prev;
    });
  }, []);

  // 검색어 기준 필터링 (카테고리·상세 필터 무관)
  const searchFiltered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return entries;
    return entries.filter((e) =>
      [
        e.title,
        e.promptSummary,
        e.category,
        e.core,
        e.aiTools.join(" "),
        e.usage,
        e.promptText,
      ]
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [entries, searchQuery]);

  // 5개 조건 AND 필터
  const filtered = useMemo(() => {
    return searchFiltered
      .filter((e) => activeCategory === "전체" || e.category === activeCategory)
      .filter((e) => awardFilter === "수상 전체" || e.award === awardFilter)
      .filter(
        (e) =>
          aiFilter === "AI 전체" ||
          e.aiTools.some((t) => normalizeAI(t) === normalizeAI(aiFilter)),
      )
      .filter(
        (e) =>
          difficultyFilter === "난이도 전체" ||
          e.repeatType === difficultyFilter,
      );
  }, [searchFiltered, activeCategory, awardFilter, aiFilter, difficultyFilter]);

  const displayed = useMemo(
    () => entries.find((e) => e.id === displayedId) ?? null,
    [entries, displayedId],
  );

  function closePanel() {
    setIsClosing(true);
    setSelectedId(null);
    closeTimer.current = setTimeout(() => {
      setIsClosing(false);
      setDisplayedId(null);
    }, 300);
  }

  function instantClose() {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setSelectedId(null);
    setDisplayedId(null);
    setIsClosing(false);
  }

  function handleCardClick(entry: PromptEntry) {
    if (selectedId === entry.id) {
      closePanel();
      return;
    }
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
    setIsClosing(false);
    setSelectedId(entry.id);
    setDisplayedId(entry.id);
  }

  function handleCategoryChange(cat: string) {
    setActiveCategory(cat);
    instantClose();
  }

  const panelOpen = !!selectedId || isClosing;
  const isSearching = searchQuery.trim().length > 0;

  return (
    <div className="flex items-start">
      {/* Gallery */}
      <div className="flex-1 min-w-0">
        <div className="mx-auto max-w-7xl px-lg py-xl" onClick={instantClose}>
          {/* 검색창 */}
          <div className="relative mb-md">
            <span className="absolute left-md top-1/2 -translate-y-1/2 text-subtle pointer-events-none text-sm">
              🔍
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              placeholder="제목, 업무 상황, 활용 AI, 키워드로 검색"
              className="w-full pl-10 pr-10 py-sm bg-surface-soft border border-hairline rounded-md text-sm text-ink placeholder:text-subtle focus:outline-none focus:border-primary-soft transition-colors"
            />
            {isSearching && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSearchQuery("");
                }}
                className="absolute right-md top-1/2 -translate-y-1/2 text-subtle hover:text-ink transition-colors text-sm"
                aria-label="검색 초기화"
              >
                ✕
              </button>
            )}
          </div>

          {/* 1단: 카테고리 탭 */}
          <div className="flex flex-wrap border-b border-hairline mb-sm">
            {CATEGORIES.map(({ value, label }) => (
              <button
                key={value}
                onClick={(e) => {
                  e.stopPropagation();
                  handleCategoryChange(value);
                }}
                className={`flex-shrink-0 px-md py-sm text-sm font-medium whitespace-nowrap border-b-2 transition-colors -mb-px ${
                  activeCategory === value
                    ? "border-primary text-ink font-semibold"
                    : "border-transparent text-subtle hover:text-muted hover:border-hairline"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* 2단: 상세 필터 칩 */}
          <div className="flex items-center gap-xs overflow-x-auto py-sm mb-lg">
            {/* 수상 필터 */}
            {AWARD_FILTERS.map((f) => (
              <button
                key={f}
                onClick={(e) => {
                  e.stopPropagation();
                  setAwardFilter(f);
                }}
                className={`flex-shrink-0 px-sm py-xxs rounded-pill text-xs font-medium whitespace-nowrap transition-colors ${
                  awardFilter === f
                    ? "bg-primary text-on-primary"
                    : "bg-surface-card text-muted hover:bg-surface-strong"
                }`}
              >
                {f}
              </button>
            ))}

            <span className="flex-shrink-0 w-px h-4 bg-hairline mx-xxs" />

            {/* AI 필터 */}
            {AI_FILTERS.map((f) => (
              <button
                key={f}
                onClick={(e) => {
                  e.stopPropagation();
                  setAiFilter(f);
                }}
                className={`flex-shrink-0 px-sm py-xxs rounded-pill text-xs font-medium whitespace-nowrap transition-colors ${
                  aiFilter === f
                    ? "bg-primary text-on-primary"
                    : "bg-surface-card text-muted hover:bg-surface-strong"
                }`}
              >
                {f}
              </button>
            ))}

            <span className="flex-shrink-0 w-px h-4 bg-hairline mx-xxs" />

            {/* 난이도 필터 */}
            {DIFFICULTY_FILTERS.map((f) => (
              <button
                key={f}
                onClick={(e) => {
                  e.stopPropagation();
                  setDifficultyFilter(f);
                }}
                className={`flex-shrink-0 px-sm py-xxs rounded-pill text-xs font-medium whitespace-nowrap transition-colors ${
                  difficultyFilter === f
                    ? "bg-primary text-on-primary"
                    : "bg-surface-card text-muted hover:bg-surface-strong"
                }`}
              >
                {f}
              </button>
            ))}

            <span className="ml-auto flex-shrink-0 text-sm text-subtle whitespace-nowrap pl-md">
              {isSearching
                ? `검색 결과 ${filtered.length}개`
                : `${filtered.length}개`}
            </span>
          </div>

          {/* 카드 그리드 */}
          <div className="grid gap-md grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.length === 0 ? (
              <p className="col-span-full text-subtle py-16 text-center text-sm">
                {isSearching
                  ? `"${searchQuery.trim()}"에 해당하는 수상작이 없습니다.`
                  : "해당 조건에 맞는 수상작이 없습니다."}
              </p>
            ) : (
              filtered.map((entry) => (
                <PromptCard
                  key={entry.id}
                  entry={entry}
                  isSelected={entry.id === selectedId}
                  onClick={() => handleCardClick(entry)}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {/* 패널 래퍼 */}
      <div
        className={`sticky top-0 h-screen flex-shrink-0 overflow-hidden border-l border-hairline bg-canvas ${
          !isDragging ? "transition-[width] duration-300 ease-out" : ""
        }`}
        style={{ width: panelOpen ? panelWidth : 0 }}
      >
        {/* 드래그 핸들 */}
        {panelOpen && (
          <div
            className="absolute left-0 top-0 w-1.5 h-full z-20 cursor-col-resize group"
            onPointerDown={handleDragStart}
            onPointerMove={handleDragMove}
            onPointerUp={handleDragEnd}
          >
            <div className="w-full h-full group-hover:bg-primary/30 transition-colors" />
          </div>
        )}
        {displayed && (
          <PromptDetailPanel
            entry={displayed}
            onClose={closePanel}
            isClosing={isClosing}
          />
        )}
      </div>
    </div>
  );
}
