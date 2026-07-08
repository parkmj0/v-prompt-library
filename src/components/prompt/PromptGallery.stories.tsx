import type { Meta, StoryObj } from "@storybook/nextjs";
import { expect, userEvent, waitFor, within } from "storybook/test";
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
const MANY_ENTRIES = Array.from({ length: 30 }, (_, i) => createEntry(i + 1));

const meta = {
  title: "Prompt/PromptGallery",
  component: PromptGallery,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
  args: {
    entries: SAMPLE_ENTRIES,
  },
} satisfies Meta<typeof PromptGallery>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Empty: Story = {
  args: { entries: [] },
};

export const ManyEntriesWithLoadMore: Story = {
  args: { entries: MANY_ENTRIES },
};

export const SearchInteraction: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByPlaceholderText(
      "제목, 업무 상황, 활용 AI, 키워드로 검색",
    );
    await userEvent.type(input, "콘텐츠");
    await waitFor(() =>
      expect(canvas.getByText(/검색 결과/)).toBeInTheDocument(),
    );
  },
};

export const CardClickOpensDetailPanel: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const firstTitle = canvas.getByRole("heading", {
      name: SAMPLE_ENTRIES[0].title,
    });
    await userEvent.click(firstTitle);
    await waitFor(() =>
      expect(canvas.getByLabelText("패널 닫기")).toBeInTheDocument(),
    );
  },
};
