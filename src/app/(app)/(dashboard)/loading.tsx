import { Card, Skeleton } from "@/components/ui/surface";

export default function Loading() {
  return (
    <div aria-busy="true" aria-label="Loading dashboard">
      <Skeleton className="mb-2 h-9 w-44" />
      <Skeleton className="mb-8 h-5 w-80 max-w-full" />
      <div className="flex flex-col gap-5">
        <Skeleton className="h-28 rounded-[var(--radius-card)]" />
        <Skeleton className="h-24 rounded-[var(--radius-card)]" />
        <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
          <Card className="space-y-4 p-5">
            {Array.from({ length: 6 }, (_, i) => (
              <Skeleton key={i} className="h-6 w-full" />
            ))}
          </Card>
          <Skeleton className="h-64 rounded-[var(--radius-card)]" />
        </div>
      </div>
    </div>
  );
}
