import { existsSync } from "fs";
import path from "path";
import { getPromptEntries } from "@/data/loader";
import { PromptGallery } from "@/components/prompt/PromptGallery";
import { withBasePath } from "@/lib/basePath";

const HERO_BG_PC_FILE = "/images/hero-bg.jpg";
const HERO_BG_MOBILE_FILE = "/images/hero-bg-mobile.jpg";
const HERO_VIDEO_WEBM_FILE = "/videos/hero-bg.webm";
const HERO_VIDEO_MP4_FILE = "/videos/hero-bg.mp4";
const HERO_BG_PC = withBasePath(HERO_BG_PC_FILE);
const HERO_BG_MOBILE = withBasePath(HERO_BG_MOBILE_FILE);
const HERO_VIDEO_WEBM = withBasePath(HERO_VIDEO_WEBM_FILE);
const HERO_VIDEO_MP4 = withBasePath(HERO_VIDEO_MP4_FILE);

function existsInPublic(assetPath: string): boolean {
  return existsSync(
    path.join(process.cwd(), "public", assetPath.replace(/^\//, "")),
  );
}

const hasHeroBgPc = existsInPublic(HERO_BG_PC_FILE);
const hasHeroBgMobile = existsInPublic(HERO_BG_MOBILE_FILE);
const hasHeroVideoWebm = existsInPublic(HERO_VIDEO_WEBM_FILE);
const hasHeroVideoMp4 = existsInPublic(HERO_VIDEO_MP4_FILE);

export default async function HomePage() {
  const entries = await getPromptEntries();

  return (
    <main className="min-h-screen bg-canvas">
      <PromptGallery
        entries={entries}
        heroBgPcSrc={hasHeroBgPc ? HERO_BG_PC : null}
        heroBgMobileSrc={hasHeroBgMobile ? HERO_BG_MOBILE : null}
        heroVideoWebmSrc={hasHeroVideoWebm ? HERO_VIDEO_WEBM : null}
        heroVideoMp4Src={hasHeroVideoMp4 ? HERO_VIDEO_MP4 : null}
      />
    </main>
  );
}
