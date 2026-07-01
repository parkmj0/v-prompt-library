interface BadgeProps {
  variant?: "award" | "category" | "tool" | "tag";
  value?: string;
  children: React.ReactNode;
}

const AWARD_STYLE: Record<string, string> = {
  대상: "bg-award-special-bg text-award-special-text border-award-special-border",
  Best: "bg-award-gold-bg text-award-gold-text border-award-gold-border",
  참신상:
    "bg-award-silver-bg text-award-silver-text border-award-silver-border",
  운영특별상:
    "bg-award-bronze-bg text-award-bronze-text border-award-bronze-border",
  추천작:
    "bg-award-commend-bg text-award-commend-text border-award-commend-border",
};

const VARIANT_STYLE: Record<string, string> = {
  category: "bg-surface-card text-muted border-hairline",
  tool: "bg-tool-bg text-tool-text border-tool-border",
  tag: "bg-surface-soft text-subtle border-hairline",
};

export function Badge({ variant = "tag", value, children }: BadgeProps) {
  const cls =
    variant === "award"
      ? (AWARD_STYLE[value ?? ""] ??
        "bg-surface-card text-muted border-hairline")
      : (VARIANT_STYLE[variant] ?? VARIANT_STYLE.tag);

  return (
    <span
      className={`inline-flex items-center rounded-pill border px-2 py-0.5 text-badge font-medium ${cls}`}
    >
      {children}
    </span>
  );
}
