import type { Meta, StoryObj } from "@storybook/nextjs";
import { expect, within } from "storybook/test";
import { Badge } from "./Badge";

const meta = {
  title: "UI/Badge",
  component: Badge,
  tags: ["autodocs"],
  args: {
    variant: "tag",
    bordered: true,
    children: "Tag",
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["award", "category", "tool", "tag"],
    },
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Tag: Story = {
  args: { variant: "tag", children: "업무 관리" },
};

export const Category: Story = {
  args: { variant: "category", children: "개발/자동화" },
};

export const Tool: Story = {
  args: { variant: "tool", children: "Claude" },
};

export const AwardDaesang: Story = {
  args: { variant: "award", value: "대상", children: "대상" },
};

export const AwardBest: Story = {
  args: { variant: "award", value: "Best", children: "Best" },
};

export const AwardCommend: Story = {
  args: { variant: "award", value: "참신상", children: "참신상" },
};

export const AwardBronze: Story = {
  args: { variant: "award", value: "운영특별상", children: "운영특별상" },
};

export const Unbordered: Story = {
  args: { variant: "tag", bordered: false, children: "No Border" },
};

export const RendersLabel: Story = {
  args: { variant: "tool", children: "Claude" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Claude")).toBeInTheDocument();
  },
};
