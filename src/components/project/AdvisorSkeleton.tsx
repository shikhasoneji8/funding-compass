import { Skeleton } from "@/components/ui/skeleton";

interface AdvisorSkeletonProps {
  type: "smart_guidance" | "competitor_analysis" | "investor_matching" | "financial_model";
}

export function AdvisorSkeleton({ type }: AdvisorSkeletonProps) {
  if (type === "smart_guidance") {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-9 w-20" />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-card rounded-xl border border-border p-5">
              <div className="flex items-center gap-2 mb-3">
                <Skeleton className="w-5 h-5 rounded" />
                <Skeleton className="h-5 w-32" />
              </div>
              <Skeleton className="h-8 w-24 mb-2" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4 mt-1" />
            </div>
          ))}
        </div>

        <div className="bg-card rounded-xl border border-border p-5">
          <Skeleton className="h-5 w-48 mb-4" />
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="w-24 h-4" />
                <div className="flex-1">
                  <Skeleton className="h-3 w-full rounded-full" />
                </div>
                <Skeleton className="w-12 h-4" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (type === "competitor_analysis") {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-9 w-20" />
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Skeleton className="w-5 h-5 rounded" />
            <Skeleton className="h-5 w-36" />
          </div>
          {[1, 2].map((i) => (
            <div key={i} className="bg-card rounded-xl border border-border p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <Skeleton className="h-5 w-32 mb-1" />
                  <Skeleton className="h-4 w-48" />
                </div>
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                {[1, 2, 3].map((j) => (
                  <div key={j}>
                    <Skeleton className="h-4 w-20 mb-2" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-3/4 mt-1" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="bg-card rounded-xl border border-border p-5">
              <div className="flex items-center gap-2 mb-3">
                <Skeleton className="w-5 h-5 rounded" />
                <Skeleton className="h-5 w-28" />
              </div>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3 mt-1" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (type === "investor_matching") {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <Skeleton className="h-7 w-52" />
          <Skeleton className="h-9 w-20" />
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Skeleton className="w-5 h-5 rounded" />
            <Skeleton className="h-5 w-28" />
          </div>
          {[1, 2].map((i) => (
            <div key={i} className="bg-card rounded-xl border border-border p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <Skeleton className="h-5 w-36 mb-1" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-12 rounded-full" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
              </div>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4 mb-3" />
              <div className="flex gap-2">
                <Skeleton className="h-6 w-24 rounded" />
                <Skeleton className="h-6 w-24 rounded" />
              </div>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-card rounded-xl border border-border p-4">
              <Skeleton className="h-5 w-32 mb-1" />
              <Skeleton className="h-3 w-20 mb-2" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-8 w-full mt-3" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (type === "financial_model") {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-9 w-20" />
        </div>

        <div className="grid md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-card rounded-xl border border-border p-4 text-center">
              <Skeleton className="w-6 h-6 mx-auto mb-2 rounded" />
              <Skeleton className="h-4 w-20 mx-auto mb-1" />
              <Skeleton className="h-6 w-16 mx-auto" />
            </div>
          ))}
        </div>

        <div className="bg-card rounded-xl border border-border p-5">
          <Skeleton className="h-5 w-48 mb-4" />
          <div className="flex items-end justify-between gap-4">
            {[60, 80, 100, 120].map((h, i) => (
              <div key={i} className="flex-1 text-center">
                <Skeleton className="mx-auto mb-2 rounded-lg" style={{ height: `${h}px`, width: '60px' }} />
                <Skeleton className="h-5 w-12 mx-auto mb-1" />
                <Skeleton className="h-3 w-16 mx-auto" />
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-5">
          <Skeleton className="h-5 w-40 mb-4" />
          <div className="grid md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-muted/50 rounded-lg p-4">
                <Skeleton className="h-4 w-16 mb-2" />
                <Skeleton className="h-7 w-24 mb-1" />
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-3 w-full" />
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-5">
          <Skeleton className="h-5 w-32 mb-4" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="w-32 h-4" />
                <div className="flex-1">
                  <Skeleton className="h-3 w-full rounded-full" />
                </div>
                <Skeleton className="w-12 h-4" />
                <Skeleton className="w-16 h-4" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return null;
}