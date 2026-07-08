import type { Meta, StoryObj } from "@storybook/nextjs";
import { expect, fn, userEvent, within } from "storybook/test";
import type { PromptEntry } from "@/types";
import { PromptDetailPanel } from "./PromptDetailPanel";

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
  title: "Prompt/PromptDetailPanel",
  component: PromptDetailPanel,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
  args: {
    entry: createEntry(),
    onClose: fn(),
    isClosing: false,
  },
  decorators: [
    (Story) => (
      <div style={{ height: "100vh", width: "480px" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof PromptDetailPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const MultipleImages: Story = {
  args: {
    entry: createEntry({
      previewImages: [
        "/results/award-014/thumbnail1.png",
        "/results/award-014/thumbnail2.png",
        "/results/award-014/thumbnail3.png",
      ],
    }),
  },
};

export const NoImage: Story = {
  args: {
    entry: createEntry({ previewImages: [] }),
  },
};

export const WithResultFileUrl: Story = {
  args: {
    entry: createEntry({
      resultFileUrl: "https://example.com/result",
      resultFileName: "result.pptx",
    }),
  },
};

export const PackCandidate: Story = {
  args: {
    entry: createEntry({ packCandidate: true }),
  },
};

export const RecommendedNoAwardBadge: Story = {
  args: {
    entry: createEntry({ award: "추천작" }),
  },
};

export const CloseInteraction: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const closeButton = await canvas.findByLabelText("패널 닫기");
    await userEvent.click(closeButton);
    await expect(args.onClose).toHaveBeenCalledTimes(1);
  },
};

export const CopyPromptInteraction: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const promptBlock = canvas.getByText(/다음 항목을 정리해줘/);
    await expect(promptBlock).toBeInTheDocument();
  },
};
