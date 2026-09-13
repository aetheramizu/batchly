import { Card, Skeleton } from "@/components/ui/surface";

export default function Loading() {
  return (
    <div aria-busy="true" aria-label="Loading batch" className="flex flex-col gap-5">
      <Skeleton className="h-6 w-28" />
      <Card className="space-y-3 p-6">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="mt-5 h-2 w-full" />
      </Card>
      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <Skeleton className="h-72 rounded-[var(--radius-card)]" />
        <Skeleton className="h-56 rounded-[var(--radius-card)]" />
      </div>
    </div>
  );
}
