import { Card, Skeleton } from "@/components/ui/surface";

export default function Loading() {
  return (
    <div aria-busy="true" aria-label="Loading finance">
      <Skeleton className="mb-2 h-9 w-36" />
      <Skeleton className="mb-6 h-5 w-80 max-w-full" />
      <div className="flex flex-col gap-5">
        <div className="grid grid-cols-1 min-[340px]:grid-cols-2 lg:grid-cols-4 gap-px overflow-hidden rounded-[var(--radius-card)] border border-line bg-line">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="bg-surface p-3.5 sm:p-5 space-y-2">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-3 w-28" />
            </div>
          ))}
        </div>
        <div className="grid gap-5 lg:grid-cols-[1fr_380px]">
          <Card className="space-y-4 p-5">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-2.5 w-full rounded-full" />
            {Array.from({ length: 3 }, (_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </Card>
          <Skeleton className="h-72 rounded-[var(--radius-card)]" />
        </div>
      </div>
    </div>
  );
}
