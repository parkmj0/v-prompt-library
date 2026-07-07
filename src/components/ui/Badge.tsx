import { Bot, Crown, Trophy, Sparkles, Medal } from "lucide-react";

interface BadgeProps {
  variant?: "award" | "category" | "tool" | "tag";
  value?: string;
  bordered?: boolean;
  className?: string;
  children: React.ReactNode;
}

const AWARD_STYLE: Record<string, string> = {
  대상: "bg-award-special-bg text-award-special-text border-award-special-border/60",
  Best: "bg-award-gold-bg text-award-gold-text border-award-gold-border/60",
  참신상:
    "bg-award-commend-bg text-award-commend-text border-award-commend-border/60",
  운영특별상:
    "bg-award-bronze-bg text-award-bronze-text border-award-bronze-border/60",
};

const AWARD_ICON: Record<string, typeof Crown> = {
  대상: Crown,
  Best: Trophy,
  참신상: Sparkles,
  운영특별상: Medal,
};

const VARIANT_STYLE: Record<string, string> = {
  category: "bg-surface-card text-muted border-hairline",
  tool: "bg-tool-bg text-tool-text border-tool-border/70",
  tag: "bg-surface-soft text-subtle border-hairline",
};

export function Badge({
  variant = "tag",
  value,
  bordered = true,
  className = "",
  children,
}: BadgeProps) {
  const cls =
    variant === "award"
      ? (AWARD_STYLE[value ?? ""] ??
        "bg-surface-card text-muted border-hairline")
      : (VARIANT_STYLE[variant] ?? VARIANT_STYLE.tag);
  const AwardIcon = variant === "award" ? AWARD_ICON[value ?? ""] : undefined;

  return (
    <span
      className={`inline-flex h-lg items-center justify-center gap-xxs rounded-pill ${bordered ? "border" : "border-0"} px-2 py-0.5 text-badge font-medium leading-none ${cls} ${className}`}
    >
      {variant === "tool" && <Bot size={11} />}
      {AwardIcon && <AwardIcon size={11} />}
      {children}
    </span>
  );
}
