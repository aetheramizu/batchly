import { Card, Skeleton } from "@/components/ui/surface";

export default function Loading() {
  return (
    <div aria-busy="true" aria-label="Loading purchase" className="flex flex-col gap-5">
      <Skeleton className="h-6 w-28" />
      <Card className="flex gap-5 p-6">
        <Skeleton className="size-32 rounded-xl" />
        <div className="flex-1 space-y-3">
          <Skeleton className="h-5 w-24 rounded-full" />
          <Skeleton className="h-7 w-2/3" />
          <Skeleton className="h-4 w-1/3" />
        </div>
      </Card>
      <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
        <Skeleton className="h-56 rounded-[var(--radius-card)]" />
        <Skeleton className="h-56 rounded-[var(--radius-card)]" />
      </div>
    </div>
  );
}
