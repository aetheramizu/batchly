import { SearchX } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { Card, EmptyState } from "@/components/ui/surface";

export default function NotFound() {
  return (
    <Card className="mt-4">
      <EmptyState
        icon={<SearchX />}
        title="We couldn't find that"
        description="It may have been removed, or the link is incorrect."
        action={<ButtonLink href="/purchases" variant="secondary">Go to purchases</ButtonLink>}
      />
    </Card>
  );
}
