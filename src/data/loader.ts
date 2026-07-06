import { promises as fs, existsSync } from "fs";
import path from "path";
import type { PromptEntry, AwardLabel, Category } from "@/types";

const dataDir = path.join(process.cwd(), "public", "data");
const resultsDir = path.join(process.cwd(), "public", "results");

const RESULT_EXTENSION: Record<string, string> = {
  pdf: "pdf",
  docx: "docx",
  pptx: "pptx",
  xlsx: "xlsx",
  video: "mp4",
  image: "png",
};

const PREVIEW_IMAGE_FILES = [
  "thumbnail.png",
  "thumbnail2.png",
  "thumbnail3.png",
  "thumbnail4.png",
];

function localAssetPath(id: string, filename: string): string | null {
  const absPath = path.join(resultsDir, id, filename);
  return existsSync(absPath) ? `/results/${id}/${filename}` : null;
}

function getPreviewImages(id: string): string[] {
  return PREVIEW_IMAGE_FILES.map((file) => localAssetPath(id, file)).filter(
    (src): src is string => src !== null,
  );
}

interface RawEntry {
  id: string;
  no: number;
  category: string;
  sourceCategory: string;
  title: string;
  description: string;
  finalPrompt: string;
  aiTool: string;
  usage: string;
  repeatability: string;
  tags: string[];
  award?: AwardLabel;
  cell?: string;
  submitter?: string;
  effect?: string;
  promptText?: string;
  resultType?: string;
  resultPreview?: string;
  resultFileUrl?: string | null;
  resultFileName?: string | null;
  packCandidate?: boolean;
}

function deriveAward(no: number): AwardLabel {
  if (no === 1) return "대상";
  if (no <= 3) return "Best";
  if (no <= 5) return "참신상";
  if (no <= 7) return "운영특별상";
  return "추천작";
}

function mapEntry(raw: RawEntry): PromptEntry {
  const resultType: PromptEntry["resultType"] =
    (raw.resultType as PromptEntry["resultType"]) ?? "docx";
  const previewImages = getPreviewImages(raw.id);

  // resultType이 image면 미리보기 이미지 자체가 결과물이므로 별도 파일 없이 재사용.
  // 그 외 타입은 result.{ext} 로컬 파일이 있으면 우선 사용, 없으면 기존 외부 링크로 fallback.
  const localResultFile =
    resultType === "image"
      ? (previewImages[0] ?? null)
      : localAssetPath(raw.id, `result.${RESULT_EXTENSION[resultType]}`);
  const resultFileUrl = localResultFile ?? raw.resultFileUrl ?? null;
  const resultFileName = localResultFile
    ? resultType === "image"
      ? "thumbnail.png"
      : `result.${RESULT_EXTENSION[resultType]}`
    : (raw.resultFileName ?? null);

  return {
    id: raw.id,
    award: raw.award ?? deriveAward(raw.no),
    title: raw.title,
    category: raw.category as Category,
    core: raw.sourceCategory ?? "",
    cell: raw.cell ?? "",
    submitter: raw.submitter ?? "",
    aiTools: [raw.aiTool].filter(Boolean),
    repeatType: raw.repeatability ?? "",
    reuseType: (raw.repeatability ?? "").includes("활용 가능"),
    purpose: raw.description ?? "",
    usage: raw.usage ?? "",
    effect: raw.effect ?? "",
    promptSummary: raw.description ?? "",
    promptText: raw.promptText ?? raw.finalPrompt ?? "",
    resultType,
    resultDesc: "",
    resultPreview: raw.resultPreview ?? "",
    previewImages,
    resultFileUrl,
    resultFileName,
    tags: raw.tags ?? [],
    packCandidate: raw.packCandidate ?? false,
  };
}

export async function getPromptEntries(): Promise<PromptEntry[]> {
  const file = await fs.readFile(path.join(dataDir, "awards.json"), "utf-8");
  const raw: RawEntry[] = JSON.parse(file);
  return raw.map(mapEntry);
}
