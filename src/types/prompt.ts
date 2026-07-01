export type AwardLabel = "대상" | "Best" | "참신상" | "운영특별상" | "추천작";
export type ResultType = "image" | "pdf" | "docx" | "pptx" | "xlsx" | "video";
export type Category =
  | "개발/자동화"
  | "콘텐츠 제작"
  | "업무 운영"
  | "고객관리"
  | "기획/검토";

export interface PromptEntry {
  id: string;
  award: AwardLabel;
  title: string;
  category: Category;
  core: string;
  cell: string;
  submitter: string;
  aiTools: string[];
  repeatType: string;
  reuseType: boolean;
  purpose: string;
  usage: string;
  effect: string;
  promptSummary: string;
  promptText: string;
  resultType: ResultType;
  resultDesc: string;
  resultPreview: string;
  thumbnail: string | null;
  resultImage: string | null;
  resultFileUrl: string | null;
  resultFileName: string | null;
  tags: string[];
  packCandidate: boolean;
}
