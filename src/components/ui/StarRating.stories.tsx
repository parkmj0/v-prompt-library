import type { Meta, StoryObj } from "@storybook/nextjs";
import { expect } from "storybook/test";
import { StarRating } from "./StarRating";

const meta = {
  title: "UI/StarRating",
  component: StarRating,
  tags: ["autodocs"],
  args: {
    filled: 3,
    size: 14,
  },
  argTypes: {
    filled: { control: { type: "range", min: 0, max: 5, step: 1 } },
    size: { control: { type: "number" } },
  },
} satisfies Meta<typeof StarRating>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  args: { filled: 0 },
};

export const Partial: Story = {
  args: { filled: 3 },
};

export const Full: Story = {
  args: { filled: 5 },
};

export const Large: Story = {
  args: { filled: 4, size: 24 },
};

export const RendersFiveStars: Story = {
  args: { filled: 3 },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelectorAll("svg").length).toBe(5);
  },
};
