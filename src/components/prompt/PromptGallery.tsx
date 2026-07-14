"use client";

import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import Image from "next/image";
import { ArrowUp, ChevronLeft, ChevronRight, Search, X } from "lucide-react";
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
// "수상 전체"는 무조건 전체가 아니라 수상 등급이 있는 항목만 의미한다 (추천작 제외).
const AWARDED_LABELS = ["Best", "참신상", "운영특별상"];
const AI_FILTERS = ["AI 전체", "ChatGPT", "Claude", "Gemini"];

interface RecommendedSearchTag {
  label: string;
  aliases: string[];
}

// 화면엔 label만 노출되고, 클릭 시 검색은 label+aliases 전체를 OR 조건으로 매칭한다.
const RECOMMENDED_SEARCH_TAG_POOL: RecommendedSearchTag[] = [
  {
    label: "문항 자동 생성",
    aliases: [
      "문항 자동 생성",
      "쌍둥이 문항",
      "문항 생성",
      "문항 제작",
      "문제 생성",
      "평가지",
      "문항은행",
      "초등 수학",
      "원형 문항",
    ],
  },
  {
    label: "맞춤형 피드백",
    aliases: [
      "맞춤형 피드백",
      "피드백 작성",
      "강사 피드백",
      "수업 피드백",
      "교육 과정 피드백",
      "코칭",
      "강사 양성",
      "교사 교육",
    ],
  },
  {
    label: "오류 검토 답변",
    aliases: [
      "오류 검토 답변",
      "문항 오류",
      "오류 신고",
      "검토 답변",
      "정답 오류",
      "해설 오류",
      "CS 검수",
      "선생님 답변",
      "비바샘",
    ],
  },
  {
    label: "스토리보드 생성",
    aliases: [
      "스토리보드 생성",
      "스토리보드",
      "콘티",
      "영상 콘티",
      "영상 기획",
      "장면 구성",
      "컷 구성",
      "스크립트",
    ],
  },
  {
    label: "숏폼 영상 기획",
    aliases: [
      "숏폼 영상 기획",
      "숏폼",
      "영상 기획",
      "클립",
      "네이버 클립",
      "릴스",
      "쇼츠",
      "영상 스크립트",
      "컷별 스크립트",
    ],
  },
  {
    label: "교육 삽화",
    aliases: [
      "교육 삽화",
      "삽화",
      "이미지 생성",
      "AI 이미지",
      "일러스트",
      "교재 이미지",
      "교육 콘텐츠 이미지",
      "시각화",
    ],
  },
  {
    label: "광고 카피 생성",
    aliases: [
      "광고 카피 생성",
      "광고 카피",
      "배너 카피",
      "프로모션 카피",
      "홍보 문구",
      "카피라이팅",
      "CTA",
      "A/B 테스트",
    ],
  },
  {
    label: "경쟁사 모니터링 자동화",
    aliases: [
      "경쟁사 모니터링 자동화",
      "경쟁사 모니터링",
      "경쟁사 분석",
      "시장 조사",
      "리서치 자동화",
      "에듀테크 리서치",
      "대시보드",
    ],
  },
  {
    label: "코드 재사용 에이전트",
    aliases: [
      "코드 재사용 에이전트",
      "코드 재사용",
      "개발 자동화",
      "소스코드",
      "버그 수정",
      "리팩토링",
      "개발 Prompt",
      "Claude Code",
    ],
  },
  {
    label: "보안성 검토 체크리스트",
    aliases: [
      "보안성 검토 체크리스트",
      "보안성 검토",
      "보안 체크리스트",
      "정보보안",
      "개인정보",
      "권한 검토",
      "보안 이슈",
      "검토 기준",
    ],
  },
  {
    label: "CS 자동 스크립트",
    aliases: [
      "CS 자동 스크립트",
      "CS",
      "고객 응대",
      "상담 스크립트",
      "답변 작성",
      "응대 문구",
      "회원 상담",
      "문의 답변",
    ],
  },
  {
    label: "스케줄러 생성",
    aliases: [
      "스케줄러 생성",
      "스케줄러",
      "일정표",
      "자동화",
      "VBA",
      "엑셀 자동화",
      "업무 자동화",
      "일정 관리",
    ],
  },
  {
    label: "연구개발 업무일지",
    aliases: [
      "연구개발 업무일지",
      "업무일지",
      "연구개발",
      "R&D",
      "개발 기록",
      "업무 기록",
      "진행 현황",
      "보고서",
    ],
  },
  {
    label: "상담 스크립트 생성",
    aliases: [
      "상담 스크립트 생성",
      "상담 스크립트",
      "회원 상담",
      "학부모 상담",
      "추천 스크립트",
      "관리교사",
      "온리원 상담",
    ],
  },
  {
    label: "홍보 카피라이팅",
    aliases: [
      "홍보 카피라이팅",
      "홍보 카피",
      "광고 카피",
      "배너 문구",
      "프로모션",
      "마케팅 문구",
      "CTA",
      "카피 생성",
    ],
  },
  {
    label: "공지문 작성 시각화",
    aliases: [
      "공지문 작성 시각화",
      "공지문",
      "사내 공지",
      "공지 시각화",
      "안내문",
      "랜딩페이지 이미지",
      "사내 안내",
      "이미지 생성",
    ],
  },
  {
    label: "제작 진행 현황표",
    aliases: [
      "제작 진행 현황표",
      "진행 현황",
      "현황표",
      "제작 관리",
      "업무 관리",
      "일정 관리",
      "엑셀",
      "대시보드",
    ],
  },
  {
    label: "프롬프트 생성",
    aliases: [
      "프롬프트 생성",
      "Prompt 생성",
      "프롬프트 작성",
      "프롬프트 자동화",
      "AI 업무 Prompt",
      "프롬프트 템플릿",
      "프롬프트 개선",
    ],
  },
];

const RECOMMENDED_TAG_VISIBLE_COUNT = 6;

const AWARD_SORT: Record<string, number> = {
  대상: 0,
  Best: 1,
  참신상: 2,
  운영특별상: 3,
};

const INITIAL_VISIBLE_COUNT = 24;
const LOAD_MORE_COUNT = 12;
const FULL_DISPLAY_THRESHOLD = 60;
const AUTO_LOAD_TRIGGER_COUNT = 2;

interface PromptGalleryProps {
  entries: PromptEntry[];
  heroBgPcSrc?: string | null;
  heroBgMobileSrc?: string | null;
  heroVideoWebmSrc?: string | null;
  heroVideoMp4Src?: string | null;
}

function normalizeAI(s: string) {
  return s.replace(/\s/g, "").toLowerCase();
}

/** 모바일에서는 가로 스크롤(+ 화살표 버튼), 데스크톱에서는 flex-wrap으로 표시하는 행 */
function HScrollRow({
  isMobile,
  className = "",
  children,
}: {
  isMobile: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    if (!isMobile) return;
    updateScrollState();
    window.addEventListener("resize", updateScrollState);
    return () => window.removeEventListener("resize", updateScrollState);
  }, [isMobile, updateScrollState]);

  function handleScroll() {
    updateScrollState();
    setHasScrolled(true);
  }

  function scrollByAmount(dir: 1 | -1) {
    scrollRef.current?.scrollBy({ left: dir * 160, behavior: "smooth" });
  }

  if (!isMobile) {
    return <div className={`flex flex-wrap ${className}`}>{children}</div>;
  }

  return (
    <div className="relative">
      {canScrollLeft && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            scrollByAmount(-1);
          }}
          aria-label="이전"
          className={`absolute left-0 top-1/2 z-10 -translate-y-1/2 flex items-center justify-center w-6 h-6 rounded-full bg-canvas/70 shadow-card text-on-dark transition-opacity duration-300 ${
            hasScrolled ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <ChevronLeft size={16} />
        </button>
      )}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className={`flex overflow-x-auto hscroll-hide ${className}`}
      >
        {children}
      </div>
      {canScrollRight && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            scrollByAmount(1);
          }}
          aria-label="다음"
          className={`absolute right-0 top-1/2 z-10 -translate-y-1/2 flex items-center justify-center w-6 h-6 rounded-full bg-canvas/70 shadow-card text-on-dark transition-opacity duration-300 ${
            hasScrolled ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <ChevronRight size={16} />
        </button>
      )}
    </div>
  );
}

export function PromptGallery({
  entries,
  heroBgPcSrc,
  heroBgMobileSrc,
  heroVideoWebmSrc,
  heroVideoMp4Src,
}: PromptGalleryProps) {
  const hasHeroBgPc = Boolean(heroBgPcSrc);
  const hasHeroBgMobile = Boolean(heroBgMobileSrc);
  const hasHeroVideo = Boolean(heroVideoWebmSrc || heroVideoMp4Src);
  const hasHeroBg = hasHeroBgPc || hasHeroBgMobile || hasHeroVideo;

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [displayedId, setDisplayedId] = useState<string | null>(null);
  const [isClosing, setIsClosing] = useState(false);
  const [activeCategory, setActiveCategory] = useState("전체");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSearchTerms, setActiveSearchTerms] = useState<string[]>([]);
  const [recommendedSearchTags, setRecommendedSearchTags] = useState<
    RecommendedSearchTag[]
  >([]);
  const [awardFilter, setAwardFilter] = useState("수상 전체");
  // 첫 진입 시(사용자가 수상 필터를 아직 건드리기 전)엔 추천작까지 전체 노출하고,
  // 수상 필터 버튼을 한 번이라도 클릭한 뒤부터 "수상 전체"가 추천작을 제외한 51개를 의미한다.
  const [awardFilterTouched, setAwardFilterTouched] = useState(false);
  const [aiFilter, setAiFilter] = useState("AI 전체");
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_COUNT);
  const [panelWidth, setPanelWidth] = useState(700);
  const [isDragging, setIsDragging] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dragState = useRef<{ startX: number; startWidth: number } | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const isAutoLoadingRef = useRef(false);
  const bottomHitCountRef = useRef(0);
  const hasUserScrolledRef = useRef(false);
  const isNearBottomRef = useRef(false);
  const heroVideoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    // iOS Safari는 muted 어트리뷰트만으로는 autoplay를 허용하지 않는 경우가 있어,
    // muted 프로퍼티를 명시적으로 설정한 뒤 재생을 시도한다.
    const video = heroVideoRef.current;
    if (!video) return;
    video.muted = true;
    video.play()?.catch(() => {});
  }, [hasHeroVideo]);

  useEffect(() => {
    const saved = Number(localStorage.getItem("v-prompt-panel-width"));
    // localStorage는 SSR에 없어 lazy useState init 대신 마운트 후 1회 동기화한다.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (saved >= 300 && saved <= 800) setPanelWidth(saved);
  }, []);

  useEffect(() => {
    const mql = window.matchMedia("(max-width: 639px)");
    const update = () => setIsMobile(mql.matches);
    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    // 서버/클라이언트 hydration mismatch를 피하기 위해 마운트 후에만 랜덤 구성한다.
    const shuffled = [...RECOMMENDED_SEARCH_TAG_POOL].sort(
      () => Math.random() - 0.5,
    );
    setRecommendedSearchTags(shuffled.slice(0, RECOMMENDED_TAG_VISIBLE_COUNT));
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
  // 추천 태그 클릭 시엔 activeSearchTerms(대표 키워드+aliases)를 OR 매칭하고,
  // 수동 입력 시엔 검색어를 공백 기준으로 나눠 단어 중 하나라도 포함되면 노출한다 (OR 매칭).
  const searchFiltered = useMemo(() => {
    const tokens =
      activeSearchTerms.length > 0
        ? activeSearchTerms.map((term) => term.toLowerCase())
        : searchQuery.trim().toLowerCase().split(/\s+/).filter(Boolean);
    if (tokens.length === 0) return entries;
    return entries.filter((e) => {
      const haystack = [
        e.title,
        e.promptSummary,
        e.category,
        e.core,
        e.aiTools.join(" "),
        e.usage,
        e.promptText,
        e.cell,
      ]
        .join(" ")
        .toLowerCase();
      return tokens.some((token) => haystack.includes(token));
    });
  }, [entries, searchQuery, activeSearchTerms]);

  // 5개 조건 AND 필터 + 정렬 (추천작 상단)
  const filteredEntries = useMemo(() => {
    return searchFiltered
      .filter((e) => activeCategory === "전체" || e.category === activeCategory)
      .filter((e) => {
        if (!awardFilterTouched) return true;
        return awardFilter === "수상 전체"
          ? AWARDED_LABELS.includes(e.award)
          : e.award === awardFilter;
      })
      .filter(
        (e) =>
          aiFilter === "AI 전체" ||
          e.aiTools.some((t) => normalizeAI(t) === normalizeAI(aiFilter)),
      )
      .sort(
        (a, b) => (AWARD_SORT[a.award] ?? 99) - (AWARD_SORT[b.award] ?? 99),
      );
  }, [
    searchFiltered,
    activeCategory,
    awardFilter,
    awardFilterTouched,
    aiFilter,
  ]);

  const filterKey = `${searchQuery}|${activeCategory}|${awardFilter}|${awardFilterTouched}|${aiFilter}`;
  const [prevFilterKey, setPrevFilterKey] = useState(filterKey);
  if (prevFilterKey !== filterKey) {
    setPrevFilterKey(filterKey);
    setVisibleCount(
      filteredEntries.length <= FULL_DISPLAY_THRESHOLD
        ? filteredEntries.length
        : INITIAL_VISIBLE_COUNT,
    );
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
    if (cat === "전체") {
      setAwardFilter("수상 전체");
      setAwardFilterTouched(false);
      setAiFilter("AI 전체");
    }
    instantClose();
  }

  function handleHomeClick() {
    setSearchQuery("");
    setActiveSearchTerms([]);
    handleCategoryChange("전체");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleRecommendedTagClick(tag: RecommendedSearchTag) {
    setSearchQuery(tag.label);
    setActiveSearchTerms(tag.aliases);
  }

  const panelOpen = !!selectedId || isClosing;
  const isSearching = searchQuery.trim().length > 0;
  const countLabel = isSearching
    ? `검색 결과 ${filteredEntries.length}개 중 ${displayedEntries.length}개`
    : `총 ${filteredEntries.length}개 중 ${displayedEntries.length}개`;

  return (
    <div className="relative z-10 flex items-start">
      {/* Gallery */}
      <div
        className={`relative flex-1 min-w-0 ${
          !isDragging
            ? "transition-[padding-right] duration-[280ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
            : ""
        }`}
        style={{ paddingRight: !isMobile && panelOpen ? panelWidth : 0 }}
        onClick={instantClose}
      >
        {/* 공유 배경 영역: 히어로 타이틀+검색/필터 툴바와 카드 그리드가 영상/이미지 배경을 함께 사용 */}
        <div className="relative overflow-hidden">
          {hasHeroBg && (
            <div className="absolute inset-x-0 top-0 h-[50vh] w-full">
              {hasHeroBgPc && heroBgPcSrc && (
                <Image
                  src={heroBgPcSrc}
                  alt=""
                  fill
                  priority
                  className="hidden object-cover object-top md:block"
                />
              )}
              {hasHeroBgMobile && heroBgMobileSrc && (
                <Image
                  src={heroBgMobileSrc}
                  alt=""
                  fill
                  priority
                  className="object-cover object-top md:hidden"
                />
              )}
              {hasHeroVideo && (
                <video
                  ref={heroVideoRef}
                  aria-hidden="true"
                  autoPlay
                  muted
                  loop
                  playsInline
                  {...{ "webkit-playsinline": "true" }}
                  poster={heroBgPcSrc ?? undefined}
                  className="pointer-events-none absolute inset-0 hidden h-full w-full object-cover object-top opacity-80 md:block motion-reduce:hidden"
                >
                  {heroVideoWebmSrc && (
                    <source src={heroVideoWebmSrc} type="video/webm" />
                  )}
                  {heroVideoMp4Src && (
                    <source src={heroVideoMp4Src} type="video/mp4" />
                  )}
                </video>
              )}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 bottom-0 h-[12vh] w-full bg-gradient-to-b from-transparent to-canvas"
              />
            </div>
          )}
          <div className="relative mx-auto max-w-7xl px-lg pt-xxl">
            <div className="relative text-on-dark">
              <p className="text-caption font-medium text-subtle uppercase tracking-normal mb-3">
                V-Prompt Challenge
              </p>
              <h1
                onClick={(e) => {
                  e.stopPropagation();
                  handleHomeClick();
                }}
                className="text-display-md font-semibold leading-display-md tracking-display-md cursor-pointer"
              >
                수상작 갤러리
              </h1>
              <p className="mt-3 text-base leading-body text-subtle">
                챌린지를 통해 선발된 {entries.length}개의 우수 프롬프트 수상작을
                확인하세요.
              </p>
            </div>
            <div className="pt-xl">
              {/* 검색창 */}
              <div className="relative mb-xs max-w-full lg:max-w-2xl mx-auto">
                <Search
                  size={16}
                  className="absolute left-md top-1/2 z-10 -translate-y-1/2 text-on-dark pointer-events-none"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setActiveSearchTerms([]);
                  }}
                  onClick={(e) => e.stopPropagation()}
                  placeholder="내 업무에 바로 쓸 Prompt를 검색해보세요"
                  className="w-full h-[50px] pl-10 pr-10 py-sm bg-surface-search/80 border border-transparent rounded-md text-sm font-medium text-on-dark placeholder:text-muted focus:outline-none focus:border-accent/60 focus:ring-2 focus:ring-accent/15 transition-colors duration-200"
                />
                <div className="pointer-events-none absolute inset-y-0 left-10 right-10 z-10 flex items-center overflow-hidden">
                  <span
                    aria-hidden="true"
                    className="invisible whitespace-pre text-sm"
                  >
                    {searchQuery}
                  </span>
                  {isSearching && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSearchQuery("");
                        setActiveSearchTerms([]);
                      }}
                      className="pointer-events-auto ml-xs flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-on-dark/20 text-on-dark transition-colors duration-200 hover:bg-on-dark/30"
                      aria-label="검색 초기화"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>
              </div>

              {/* 추천 검색어 태그 */}
              <div className="mb-lg flex flex-wrap items-center justify-center gap-x-md gap-y-0 sm:gap-y-xxs">
                {recommendedSearchTags.map((tag) => (
                  <button
                    key={tag.label}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRecommendedTagClick(tag);
                    }}
                    aria-label={`${tag.label} 검색하기`}
                    className="text-caption text-muted underline underline-offset-4 decoration-transparent transition-colors duration-200 hover:text-on-dark hover:decoration-on-dark focus-visible:text-on-dark focus-visible:decoration-on-dark focus-visible:outline-none"
                  >
                    #{tag.label}
                  </button>
                ))}
              </div>

              {/* 1단: 카테고리 탭 */}
              <div className="border-b border-subtle/40 mb-xs">
                <HScrollRow isMobile={isMobile} className="gap-sm">
                  {CATEGORIES.map(({ value, label }) => (
                    <button
                      key={value}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCategoryChange(value);
                      }}
                      className={`flex-shrink-0 px-md py-sm text-base font-medium whitespace-nowrap border-b-2 transition-colors duration-200 -mb-px ${
                        activeCategory === value
                          ? "border-accent text-on-dark font-semibold"
                          : "border-transparent text-tab-default hover:text-muted hover:border-subtle/40"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </HScrollRow>
              </div>

              {/* 2단: 상세 필터 칩 */}
              <div
                className={`py-sm mb-lg ${
                  isMobile
                    ? "flex flex-col gap-xs"
                    : "flex flex-wrap items-center gap-xs"
                }`}
              >
                <HScrollRow isMobile={isMobile} className="items-center gap-xs">
                  {/* 수상 그룹 */}
                  <div className="flex items-center gap-2xs flex-shrink-0">
                    {AWARD_FILTERS.map((f) => (
                      <button
                        key={f}
                        onClick={(e) => {
                          e.stopPropagation();
                          setAwardFilter(f);
                          setAwardFilterTouched(true);
                        }}
                        className={`flex-shrink-0 h-xl flex items-center justify-center px-sm rounded-pill border text-xs font-medium whitespace-nowrap transition-colors duration-200 ${
                          awardFilter === f
                            ? "bg-accent text-on-dark border-transparent"
                            : "bg-surface-filter text-ink border-transparent hover:bg-surface-strong"
                        }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>

                  <span className="flex-shrink-0 w-px h-4 bg-hairline" />

                  {/* AI 그룹 */}
                  <div className="flex items-center gap-2xs flex-shrink-0">
                    {AI_FILTERS.map((f) => (
                      <button
                        key={f}
                        onClick={(e) => {
                          e.stopPropagation();
                          setAiFilter(f);
                        }}
                        className={`flex-shrink-0 h-xl flex items-center justify-center px-sm rounded-pill border text-xs font-medium whitespace-nowrap transition-colors duration-200 ${
                          aiFilter === f
                            ? "bg-accent text-on-dark border-transparent"
                            : "bg-surface-filter text-ink border-transparent hover:bg-surface-strong"
                        }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </HScrollRow>

                {!isMobile && (
                  <span className="flex-shrink-0 text-sm text-subtle whitespace-nowrap ml-auto pl-md">
                    {countLabel}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="relative mx-auto max-w-7xl px-lg pb-xl">
            {isMobile && (
              <p className="mb-xs text-sm text-subtle whitespace-nowrap">
                {countLabel}
              </p>
            )}
            {/* 카드 그리드 */}
            <div className="grid gap-x-md gap-y-lg-xl grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
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
      </div>

      {/* 위로가기 (브라우저 우측 고정, 패널 열림 시 숨김) */}
      {filteredEntries.length > INITIAL_VISIBLE_COUNT && !panelOpen && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="맨 위로 이동"
          className="fixed bottom-xl right-xl z-30 flex items-center justify-center w-[42px] h-[42px] rounded-full border border-hairline bg-surface-card text-muted hover:bg-surface-strong hover:border-accent/60 transition-colors duration-200"
        >
          <ArrowUp size={20} />
        </button>
      )}

      {/* 패널 래퍼 — 모바일: 풀스크린 오버레이 / 데스크톱: 드래그 리사이즈 사이드바 */}
      {isMobile ? (
        panelOpen && (
          <div className="fixed inset-0 z-40 overflow-hidden bg-surface-soft">
            {displayed && (
              <PromptDetailPanel
                entry={displayed}
                onClose={closePanel}
                isClosing={isClosing}
              />
            )}
          </div>
        )
      ) : (
        <div
          className={`fixed top-0 right-0 z-20 h-screen overflow-hidden bg-surface-soft ${
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
      )}
    </div>
  );
}
