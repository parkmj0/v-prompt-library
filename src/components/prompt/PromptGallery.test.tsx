import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { AwardLabel, Category, PromptEntry } from "@/types";
import { PromptGallery } from "./PromptGallery";

const CATEGORIES: Category[] = [
  "개발/자동화",
  "콘텐츠 제작",
  "업무 운영",
  "고객관리",
  "기획/검토",
];
const AWARDS: AwardLabel[] = ["Best", "참신상", "운영특별상", "추천작"];
const AI_TOOLS = ["ChatGPT", "Claude", "Gemini"];

function createEntry(i: number): PromptEntry {
  const category = CATEGORIES[i % CATEGORIES.length];
  const award = AWARDS[i % AWARDS.length];
  const aiTool = AI_TOOLS[i % AI_TOOLS.length];

  return {
    id: `award-${String(i).padStart(3, "0")}`,
    award,
    title: `${category} 샘플 Prompt #${i}`,
    category,
    core: "업무 관리",
    cell: "DX추진3 Cell",
    submitter: "홍길동",
    aiTools: [aiTool],
    repeatType: i % 3 === 0 ? "구조이해 필요" : "바로 복붙",
    reuseType: true,
    purpose: "샘플 목적",
    usage:
      i % 2 === 0
        ? "동일 업무를 하는 구성원에게 활용 가능"
        : "다른 팀 업무에도 응용 가능",
    effect: "샘플 활용 효과",
    promptSummary: `${category} 관련 ${i}번째 샘플 요약입니다.`,
    promptText: "샘플 프롬프트 텍스트",
    resultType: "image",
    resultDesc: "결과 이미지",
    resultPreview: "/results/award-008/result.png",
    previewImages: ["/results/award-008/result.png"],
    resultFileUrl: null,
    resultFileName: null,
    tags: [category],
    packCandidate: false,
  };
}

const SAMPLE_ENTRIES = Array.from({ length: 8 }, (_, i) => createEntry(i + 1));

// PromptGallery는 window.matchMedia로 모바일 여부를 판단한다.
beforeEach(() => {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  });
  localStorage.clear();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("PromptGallery", () => {
  it("entries 전체를 카드로 렌더링한다", () => {
    render(<PromptGallery entries={SAMPLE_ENTRIES} />);
    expect(screen.getByText("총 8개 중 8개")).toBeInTheDocument();
  });

  it("entries가 비어있으면 빈 상태 메시지를 보여준다", () => {
    render(<PromptGallery entries={[]} />);
    expect(
      screen.getByText("해당 조건에 맞는 수상작이 없습니다."),
    ).toBeInTheDocument();
  });

  it("검색어를 입력하면 결과가 필터링된다", async () => {
    const user = userEvent.setup();
    render(<PromptGallery entries={SAMPLE_ENTRIES} />);

    const input = screen.getByPlaceholderText(
      "제목, 업무 상황, 활용 AI, 키워드로 검색",
    );
    await user.type(input, "콘텐츠 제작");

    await waitFor(() => {
      expect(screen.getByText(/검색 결과/)).toBeInTheDocument();
    });
  });

  it("카테고리 탭 클릭 시 해당 카테고리만 표시된다", async () => {
    const user = userEvent.setup();
    render(<PromptGallery entries={SAMPLE_ENTRIES} />);

    await user.click(screen.getByRole("button", { name: "개발/자동화" }));

    const expectedCount = SAMPLE_ENTRIES.filter(
      (e) => e.category === "개발/자동화",
    ).length;
    expect(
      screen.getByText(`총 ${expectedCount}개 중 ${expectedCount}개`),
    ).toBeInTheDocument();
  });

  it("카드를 클릭하면 상세 패널이 열린다", async () => {
    const user = userEvent.setup();
    render(<PromptGallery entries={SAMPLE_ENTRIES} />);

    await user.click(
      screen.getByRole("heading", { name: SAMPLE_ENTRIES[0].title }),
    );

    expect(await screen.findByLabelText("패널 닫기")).toBeInTheDocument();
  });

  it("같은 카드를 다시 클릭하면 상세 패널이 닫힌다", async () => {
    const user = userEvent.setup();
    render(<PromptGallery entries={SAMPLE_ENTRIES} />);

    const heading = screen.getByRole("heading", {
      name: SAMPLE_ENTRIES[0].title,
    });
    await user.click(heading);
    expect(await screen.findByLabelText("패널 닫기")).toBeInTheDocument();

    await user.click(heading);

    await waitFor(
      () => {
        expect(screen.queryByLabelText("패널 닫기")).not.toBeInTheDocument();
      },
      { timeout: 1000 },
    );
  });
});
