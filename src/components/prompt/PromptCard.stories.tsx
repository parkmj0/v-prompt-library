import type { Meta, StoryObj } from "@storybook/nextjs";
import { expect, fn, userEvent, within } from "storybook/test";
import type { PromptEntry } from "@/types";
import { PromptCard } from "./PromptCard";

function createEntry(overrides: Partial<PromptEntry> = {}): PromptEntry {
  return {
    id: "award-008",
    award: "Best",
    title: "버그 최소화 개발 Prompt",
    category: "개발/자동화",
    core: "업무 관리",
    cell: "DX추진3 Cell",
    submitter: "홍길동",
    aiTools: ["Claude"],
    repeatType: "바로 복붙",
    reuseType: true,
    purpose: "버그 최소화",
    usage: "동일 업무를 하는 구성원에게 활용 가능",
    effect: "실제 개발중 신규 기능 개발 및 버그 수정",
    promptSummary:
      "대상 파일, 변경 위치, 변경 이유를 정리해 버그를 최소화합니다.",
    promptText: "다음 항목을 정리해줘: 1) 변경 파일 2) 변경 위치 3) 변경 이유",
    resultType: "image",
    resultDesc: "결과 이미지",
    resultPreview: "/results/award-008/result.png",
    previewImages: ["/results/award-008/result.png"],
    resultFileUrl: null,
    resultFileName: null,
    tags: ["업무 관리", "개발/자동화"],
    packCandidate: false,
    ...overrides,
  };
}

const meta = {
  title: "Prompt/PromptCard",
  component: PromptCard,
  tags: ["autodocs"],
  args: {
    entry: createEntry(),
    isSelected: false,
    onClick: fn(),
  },
} satisfies Meta<typeof PromptCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Selected: Story = {
  args: { isSelected: true },
};

export const NoImage: Story = {
  args: {
    entry: createEntry({ previewImages: [] }),
  },
};

export const RecommendedNoBadge: Story = {
  args: {
    entry: createEntry({ award: "추천작" }),
  },
};

export const LongTitleManyTags: Story = {
  args: {
    entry: createEntry({
      title:
        "아주 긴 제목의 프롬프트 예시로 두 줄 이상 넘어갔을 때 line-clamp가 잘 동작하는지 확인합니다",
      tags: ["업무 관리", "개발/자동화", "리팩토링", "코드리뷰"],
      aiTools: ["Claude", "ChatGPT"],
    }),
  },
};

export const StructureRequired: Story = {
  args: {
    entry: createEntry({
      repeatType: "구조이해 필요",
      usage: "다른 팀 업무에도 응용 가능",
    }),
  },
};

export const ClickInteraction: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const card = canvas.getByRole("heading", { name: args.entry.title });
    await userEvent.click(card);
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};
