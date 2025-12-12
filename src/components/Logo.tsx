import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: "sm" | "md" | "lg";
}

export function Logo({ className, showText = true, size = "md" }: LogoProps) {
  const sizes = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-14 h-14",
  };

  const textSizes = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className={cn("relative", sizes[size])}>
        {/* Fish icon - stylized clownfish/Nemo */}
        <svg
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* Body */}
          <ellipse
            cx="20"
            cy="20"
            rx="14"
            ry="10"
            className="fill-accent"
          />
          {/* White stripes */}
          <path
            d="M12 14 Q12 20 12 26"
            stroke="white"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            d="M20 12 Q20 20 20 28"
            stroke="white"
            strokeWidth="3"
            strokeLinecap="round"
          />
          {/* Tail */}
          <path
            d="M32 20 L38 14 L38 26 Z"
            className="fill-primary"
          />
          {/* Eye */}
          <circle cx="9" cy="18" r="3" fill="white" />
          <circle cx="9" cy="18" r="1.5" className="fill-foreground" />
          {/* Top fin */}
          <path
            d="M16 10 Q20 4 24 10"
            className="fill-primary"
          />
        </svg>
      </div>
      {showText && (
        <span className={cn("font-display font-semibold tracking-tight", textSizes[size])}>
          Funding<span className="text-accent">NEMO</span>
        </span>
      )}
    </div>
  );
}
