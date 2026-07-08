import { existsSync } from "fs";
import path from "path";
import Image from "next/image";
import { getPromptEntries } from "@/data/loader";
import { PromptGallery } from "@/components/prompt/PromptGallery";
import { withBasePath } from "@/lib/basePath";

const HERO_BG_PC_FILE = "/images/hero-bg.jpg";
const HERO_BG_MOBILE_FILE = "/images/hero-bg-mobile.jpg";
const HERO_BG_PC = withBasePath(HERO_BG_PC_FILE);
const HERO_BG_MOBILE = withBasePath(HERO_BG_MOBILE_FILE);
const hasHeroBgPc = existsSync(
  path.join(process.cwd(), "public", HERO_BG_PC_FILE.replace(/^\//, "")),
);
const hasHeroBgMobile = existsSync(
  path.join(process.cwd(), "public", HERO_BG_MOBILE_FILE.replace(/^\//, "")),
);
const hasHeroBg = hasHeroBgPc || hasHeroBgMobile;

export default async function HomePage() {
  const entries = await getPromptEntries();

  return (
    <main className="min-h-screen bg-canvas">
      {/* Hero */}
      <section className="relative overflow-hidden bg-surface-dark text-on-dark px-lg py-xxl">
        {hasHeroBgPc && (
          <Image
            src={HERO_BG_PC}
            alt=""
            fill
            priority
            className="hidden object-cover sm:block"
          />
        )}
        {hasHeroBgMobile && (
          <Image
            src={HERO_BG_MOBILE}
            alt=""
            fill
            priority
            className="object-cover sm:hidden"
          />
        )}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_20%_15%,var(--color-accent)_0%,transparent_55%),radial-gradient(circle_at_80%_0%,var(--color-badge-violet)_0%,transparent_50%)]"
        />
        {hasHeroBg && (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-surface-dark/70"
          />
        )}
        <div className="relative mx-auto max-w-7xl">
          <p className="text-caption font-medium text-subtle uppercase tracking-normal mb-3">
            V-Prompt Challenge · 1차 Beta
          </p>
          <h1 className="text-display-md font-semibold leading-display-md tracking-display-md">
            수상작 갤러리
          </h1>
          <p className="mt-3 text-base leading-body text-subtle">
            챌린지를 통해 선발된 {entries.length}개의 우수 프롬프트 수상작을
            확인하세요.
          </p>
        </div>
      </section>

      {/* Gallery + Detail Panel */}
      <PromptGallery entries={entries} />
    </main>
  );
}
