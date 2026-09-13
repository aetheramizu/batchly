import { Card, Skeleton } from "@/components/ui/surface";

export default function Loading() {
  return (
    <div aria-busy="true" aria-label="Loading finance">
      <Skeleton className="mb-2 h-9 w-36" />
      <Skeleton className="mb-8 h-5 w-96 max-w-full" />
      <div className="flex flex-col gap-5">
        <Skeleton className="h-28 rounded-[var(--radius-card)]" />
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
