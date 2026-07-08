import type { Meta, StoryObj } from "@storybook/nextjs";
import { useState } from "react";
import { expect, userEvent, within } from "storybook/test";
import { ImageLightbox } from "./ImageLightbox";

function LightboxDemo({
  images,
  initialIndex = 0,
}: {
  images: string[];
  initialIndex?: number;
}) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div>
      <button type="button" onClick={() => setIsOpen(true)}>
        이미지 크게 보기
      </button>
      <ImageLightbox
        images={images}
        initialIndex={initialIndex}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        alt="샘플 이미지"
      />
    </div>
  );
}

const meta = {
  title: "UI/ImageLightbox",
  component: LightboxDemo,
  tags: ["autodocs"],
  args: {
    images: ["/results/award-008/result.png"],
  },
} satisfies Meta<typeof LightboxDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SingleImage: Story = {
  args: {
    images: ["/results/award-008/result.png"],
  },
};

export const MultipleImages: Story = {
  args: {
    images: [
      "/results/award-014/thumbnail1.png",
      "/results/award-014/thumbnail2.png",
      "/results/award-014/thumbnail3.png",
      "/results/award-014/thumbnail4.png",
      "/results/award-014/thumbnail5.png",
    ],
  },
};

export const CloseInteraction: Story = {
  args: {
    images: ["/results/award-008/result.png"],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.ownerDocument.body);
    const closeButton = await canvas.findByLabelText("닫기");
    await userEvent.click(closeButton);
    await expect(canvas.queryByLabelText("닫기")).not.toBeInTheDocument();
  },
};
