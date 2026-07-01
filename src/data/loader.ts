import { promises as fs } from "fs";
import path from "path";
import type { PromptEntry, AwardLabel, Category } from "@/types";

const dataDir = path.join(process.cwd(), "public", "data");

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
  thumbnail?: string | null;
  resultImage?: string | null;
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
    resultType: (raw.resultType as PromptEntry["resultType"]) ?? "docx",
    resultDesc: "",
    resultPreview: raw.resultPreview ?? "",
    thumbnail: raw.thumbnail ?? null,
    resultImage: raw.resultImage ?? null,
    resultFileUrl: raw.resultFileUrl ?? null,
    resultFileName: raw.resultFileName ?? null,
    tags: raw.tags ?? [],
    packCandidate: raw.packCandidate ?? false,
  };
}

export async function getPromptEntries(): Promise<PromptEntry[]> {
  const file = await fs.readFile(path.join(dataDir, "awards.json"), "utf-8");
  const raw: RawEntry[] = JSON.parse(file);
  return raw.map(mapEntry);
}
