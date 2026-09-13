import { Card, Skeleton } from "@/components/ui/surface";

export default function Loading() {
  return (
    <div aria-busy="true" aria-label="Loading batches">
      <Skeleton className="mb-2 h-9 w-40" />
      <Skeleton className="mb-8 h-5 w-80 max-w-full" />
      <Skeleton className="mb-5 h-20 rounded-[var(--radius-card)]" />
      <Skeleton className="mb-4 h-11 w-full" />
      <Card className="divide-y divide-line">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="flex items-center gap-4 px-5 py-4">
            <Skeleton className="size-11 rounded-xl" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3.5 w-1/3" />
            </div>
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>
        ))}
      </Card>
    </div>
  );
}
