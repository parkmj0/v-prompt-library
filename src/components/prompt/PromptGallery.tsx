"use client";

import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import { ArrowUp, Search, X } from "lucide-react";
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

const AWARD_FILTERS = ["수상 전체", "Best", "참신상", "운영특별상"];
const AI_FILTERS = ["AI 전체", "ChatGPT", "Claude", "Gemini"];

const INITIAL_VISIBLE_COUNT = 24;
const LOAD_MORE_COUNT = 12;
const AUTO_LOAD_TRIGGER_COUNT = 2;

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
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_COUNT);
  const [panelWidth, setPanelWidth] = useState(480);
  const [isDragging, setIsDragging] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dragState = useRef<{ startX: number; startWidth: number } | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const isAutoLoadingRef = useRef(false);
  const bottomHitCountRef = useRef(0);
  const hasUserScrolledRef = useRef(false);
  const isNearBottomRef = useRef(false);

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

  // 5개 조건 AND 필터 + 정렬 (추천작 상단)
  const AWARD_SORT: Record<string, number> = {
    대상: 0,
    Best: 1,
    참신상: 2,
    운영특별상: 3,
  };

  const filteredEntries = useMemo(() => {
    return searchFiltered
      .filter((e) => activeCategory === "전체" || e.category === activeCategory)
      .filter((e) => awardFilter === "수상 전체" || e.award === awardFilter)
      .filter(
        (e) =>
          aiFilter === "AI 전체" ||
          e.aiTools.some((t) => normalizeAI(t) === normalizeAI(aiFilter)),
      )
      .sort(
        (a, b) => (AWARD_SORT[a.award] ?? 99) - (AWARD_SORT[b.award] ?? 99),
      );
  }, [searchFiltered, activeCategory, awardFilter, aiFilter]);

  const filterKey = `${searchQuery}|${activeCategory}|${awardFilter}|${aiFilter}`;
  const [prevFilterKey, setPrevFilterKey] = useState(filterKey);
  if (prevFilterKey !== filterKey) {
    setPrevFilterKey(filterKey);
    setVisibleCount(INITIAL_VISIBLE_COUNT);
  }

  // 필터가 바뀌면 하단 감지 카운트 및 자동 로드 가드도 함께 초기화한다.
  useEffect(() => {
    bottomHitCountRef.current = 0;
    isAutoLoadingRef.current = false;
  }, [filterKey]);

  const displayedEntries = useMemo(
    () => filteredEntries.slice(0, visibleCount),
    [filteredEntries, visibleCount],
  );

  const hasMore = visibleCount < filteredEntries.length;

  const loadMore = useCallback(() => {
    setVisibleCount((prev) =>
      Math.min(prev + LOAD_MORE_COUNT, filteredEntries.length),
    );
  }, [filteredEntries.length]);

  // sentinel이 "하단 근처(rootMargin 240px 이내)"에 있는지만 추적한다.
  // IntersectionObserver는 isIntersecting이 바뀔 때만 콜백을 호출하므로,
  // 실제 하단 감지 횟수 카운트는 scroll 이벤트 쪽에서 처리한다.
  useEffect(() => {
    if (!hasMore) return;
    const node = loadMoreRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        isNearBottomRef.current = entry.isIntersecting;
      },
      { rootMargin: "240px", threshold: 0 },
    );
    observer.observe(node);
    return () => {
      observer.disconnect();
      isNearBottomRef.current = false;
    };
  }, [hasMore]);

  // 사용자가 실제로 스크롤한 뒤, 하단 근처에서 scroll 이벤트가
  // AUTO_LOAD_TRIGGER_COUNT번째 발생했을 때만 자동 로드를 실행한다.
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 120) {
        hasUserScrolledRef.current = true;
      }

      if (
        !hasUserScrolledRef.current ||
        !isNearBottomRef.current ||
        isAutoLoadingRef.current
      ) {
        return;
      }

      bottomHitCountRef.current += 1;
      if (bottomHitCountRef.current < AUTO_LOAD_TRIGGER_COUNT) return;

      bottomHitCountRef.current = 0;
      isAutoLoadingRef.current = true;
      loadMore();
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loadMore]);

  // visibleCount가 실제로 갱신된 시점(로드 완료)에 자동 로드 가드를 해제해
  // 다음 배치도 동일하게 2회째 감지에만 반응하도록 한다.
  useEffect(() => {
    isAutoLoadingRef.current = false;
  }, [visibleCount]);

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
            <Search
              size={16}
              className="absolute left-md top-1/2 z-10 -translate-y-1/2 text-on-dark pointer-events-none"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              placeholder="제목, 업무 상황, 활용 AI, 키워드로 검색"
              className="w-full pl-10 pr-10 py-sm bg-surface-search backdrop-blur-md border border-transparent rounded-md text-sm text-ink placeholder:text-subtle focus:outline-none focus:border-accent/60 focus:ring-2 focus:ring-accent/15 transition-colors duration-200"
            />
            {isSearching && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSearchQuery("");
                }}
                className="absolute right-md top-1/2 z-10 -translate-y-1/2 text-subtle hover:text-ink transition-colors duration-200"
                aria-label="검색 초기화"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* 1단: 카테고리 탭 */}
          <div className="flex flex-wrap gap-sm border-b border-hairline mb-xs">
            {CATEGORIES.map(({ value, label }) => (
              <button
                key={value}
                onClick={(e) => {
                  e.stopPropagation();
                  handleCategoryChange(value);
                }}
                className={`flex-shrink-0 px-md py-sm text-sm font-medium whitespace-nowrap border-b-2 transition-colors duration-200 -mb-px ${
                  activeCategory === value
                    ? "border-accent text-ink font-semibold"
                    : "border-transparent text-tab-default hover:text-muted hover:border-hairline"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* 2단: 상세 필터 칩 */}
          <div className="flex flex-wrap items-center gap-xs py-sm mb-lg">
            {/* 수상 그룹 */}
            <div className="flex items-center gap-2xs">
              {AWARD_FILTERS.map((f) => (
                <button
                  key={f}
                  onClick={(e) => {
                    e.stopPropagation();
                    setAwardFilter(f);
                  }}
                  className={`flex-shrink-0 h-xl flex items-center justify-center px-sm rounded-pill border text-xs font-medium whitespace-nowrap transition-colors duration-200 ${
                    awardFilter === f
                      ? "bg-accent/15 text-ink border-transparent"
                      : "bg-surface-card text-muted border-transparent hover:bg-surface-strong"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            <span className="flex-shrink-0 w-px h-4 bg-hairline" />

            {/* AI 그룹 */}
            <div className="flex items-center gap-2xs">
              {AI_FILTERS.map((f) => (
                <button
                  key={f}
                  onClick={(e) => {
                    e.stopPropagation();
                    setAiFilter(f);
                  }}
                  className={`flex-shrink-0 h-xl flex items-center justify-center px-sm rounded-pill border text-xs font-medium whitespace-nowrap transition-colors duration-200 ${
                    aiFilter === f
                      ? "bg-accent/15 text-ink border-transparent"
                      : "bg-surface-card text-muted border-transparent hover:bg-surface-strong"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            <span className="ml-auto flex-shrink-0 text-sm text-subtle whitespace-nowrap pl-md">
              {isSearching
                ? `검색 결과 ${filteredEntries.length}개 중 ${displayedEntries.length}개 표시`
                : `총 ${filteredEntries.length}개 중 ${displayedEntries.length}개 표시`}
            </span>
          </div>

          {/* 카드 그리드 */}
          <div className="grid gap-md grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {filteredEntries.length === 0 ? (
              <p className="col-span-full text-subtle py-16 text-center text-sm">
                {isSearching
                  ? `"${searchQuery.trim()}"에 해당하는 수상작이 없습니다.`
                  : "해당 조건에 맞는 수상작이 없습니다."}
              </p>
            ) : (
              displayedEntries.map((entry) => (
                <PromptCard
                  key={entry.id}
                  entry={entry}
                  isSelected={entry.id === selectedId}
                  onClick={() => handleCardClick(entry)}
                />
              ))
            )}
          </div>

          {/* 더보기 / 자동 로드 sentinel / 완료 안내 */}
          {filteredEntries.length > INITIAL_VISIBLE_COUNT && (
            <div className="flex flex-col items-center gap-xs mt-xl">
              {hasMore ? (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      loadMore();
                    }}
                    className="px-lg py-sm rounded-pill border border-hairline bg-surface-card text-sm font-medium text-ink hover:bg-surface-strong hover:border-accent/60 hover:shadow-[0_0_0_1px_var(--color-accent)] transition-colors duration-200"
                  >
                    더보기
                  </button>
                  <p className="text-xs text-subtle">
                    스크롤하면 자동으로 더 불러옵니다
                  </p>
                  {/* 자동 로드 감지용 sentinel (뷰포트 진입 시 IntersectionObserver 트리거) */}
                  <div
                    ref={loadMoreRef}
                    className="h-px w-full"
                    aria-hidden="true"
                  />
                </>
              ) : (
                <p className="text-center text-xs text-subtle">
                  모든 프롬프트를 확인했습니다
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 위로가기 (브라우저 우측 고정, 패널 열림 시 숨김) */}
      {filteredEntries.length > INITIAL_VISIBLE_COUNT && !panelOpen && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="맨 위로 이동"
          className="fixed bottom-xl right-xl z-30 flex items-center justify-center w-xl h-xl rounded-full border border-hairline bg-surface-card text-muted hover:bg-surface-strong hover:border-accent/60 transition-colors duration-200"
        >
          <ArrowUp size={16} />
        </button>
      )}

      {/* 패널 래퍼 */}
      <div
        className={`sticky top-0 h-screen flex-shrink-0 overflow-hidden bg-surface-soft ${
          !isDragging
            ? "transition-[width] duration-[280ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
            : ""
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
            <div className="w-full h-full group-hover:bg-accent/40 transition-colors duration-200" />
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
