"use client";

import { CircleAlert, RotateCw } from "lucide-react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, EmptyState } from "@/components/ui/surface";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[batchly] page error:", error);
  }, [error]);

  return (
    <Card className="mt-4">
      <EmptyState
        icon={<CircleAlert />}
        title="Something went wrong"
        description="We couldn't load this page. Check your connection and try again."
        action={
          <Button onClick={reset}>
            <RotateCw aria-hidden="true" />
            Try again
          </Button>
        }
      />
    </Card>
  );
}
