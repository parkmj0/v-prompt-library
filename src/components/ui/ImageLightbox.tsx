"use client";

import Image from "next/image";
import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface ImageLightboxProps {
  images: string[];
  initialIndex: number;
  isOpen: boolean;
  onClose: () => void;
  alt?: string;
}

const OVERLAY_BUTTON_CLASS =
  "flex h-11 w-11 items-center justify-center rounded-full border border-hairline-soft bg-canvas/60 text-on-dark backdrop-blur-sm transition-colors duration-200 hover:bg-canvas/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40";

export function ImageLightbox({
  images,
  initialIndex,
  isOpen,
  onClose,
  alt = "",
}: ImageLightboxProps) {
  const [index, setIndex] = useState(initialIndex);
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);

  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) setIndex(initialIndex);
  }

  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") setIndex((i) => (i + 1) % images.length);
      if (e.key === "ArrowLeft")
        setIndex((i) => (i - 1 + images.length) % images.length);
    }

    document.addEventListener("keydown", handleKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, images.length, onClose]);

  if (!isOpen || images.length === 0) return null;

  const hasMultiple = images.length > 1;

  function goTo(i: number) {
    setIndex((i + images.length) % images.length);
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-canvas/80 backdrop-blur-sm sm:p-xl"
      onClick={onClose}
    >
      <button
        type="button"
        aria-label="닫기"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        className={`absolute top-md right-md z-10 ${OVERLAY_BUTTON_CLASS}`}
      >
        <X size={20} />
      </button>

      {hasMultiple && (
        <div className="absolute top-md left-1/2 z-10 -translate-x-1/2 rounded-pill bg-canvas/60 px-sm py-xxs text-xs text-on-dark backdrop-blur-sm">
          {index + 1} / {images.length}
        </div>
      )}

      <div
        className={`relative h-full sm:h-[80vh] sm:w-[min(90vw,48rem)] ${
          hasMultiple ? "w-[calc(100%-112px)]" : "w-full"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative h-full w-full overflow-hidden sm:rounded-lg">
          <Image
            key={images[index]}
            src={images[index]}
            alt={alt}
            fill
            className="object-contain"
          />
        </div>

        {hasMultiple && (
          <button
            type="button"
            aria-label="이전 이미지"
            onClick={(e) => {
              e.stopPropagation();
              goTo(index - 1);
            }}
            className={`absolute right-full top-1/2 z-10 mr-3 -translate-y-1/2 sm:mr-[60px] ${OVERLAY_BUTTON_CLASS}`}
          >
            <ChevronLeft size={20} />
          </button>
        )}

        {hasMultiple && (
          <button
            type="button"
            aria-label="다음 이미지"
            onClick={(e) => {
              e.stopPropagation();
              goTo(index + 1);
            }}
            className={`absolute left-full top-1/2 z-10 ml-3 -translate-y-1/2 sm:ml-[60px] ${OVERLAY_BUTTON_CLASS}`}
          >
            <ChevronRight size={20} />
          </button>
        )}
      </div>

      {hasMultiple && (
        <div
          className="absolute bottom-md left-1/2 z-10 flex -translate-x-1/2 gap-xxs"
          onClick={(e) => e.stopPropagation()}
        >
          {images.map((img, i) => (
            <button
              key={img}
              type="button"
              aria-label={`${i + 1}번째 이미지`}
              onClick={() => goTo(i)}
              className={`relative h-lg w-lg flex-shrink-0 overflow-hidden rounded-md ring-1 transition-opacity ${
                i === index
                  ? "ring-on-dark/60 opacity-100"
                  : "ring-on-dark/30 opacity-60 hover:opacity-90"
              }`}
            >
              <Image src={img} alt="" fill className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>,
    document.body,
  );
}
