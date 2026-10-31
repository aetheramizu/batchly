import { Card, Skeleton } from "@/components/ui/surface";

export default function Loading() {
  return (
    <div aria-busy="true" aria-label="Loading batches">
      <Skeleton className="mb-2 h-9 w-40" />
      <Skeleton className="mb-8 h-5 w-80 max-w-full" />
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center">
        <Skeleton className="h-10 flex-1" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-24 sm:w-44" />
          <Skeleton className="h-10 w-24 sm:w-36" />
        </div>
      </div>
      <Card className="divide-y divide-line">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-3.5 sm:gap-4 sm:px-5">
            <Skeleton className="size-10 rounded-xl" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-3.5 w-40 max-w-full" />
            </div>
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
        ))}
      </Card>
    </div>
  );
}
