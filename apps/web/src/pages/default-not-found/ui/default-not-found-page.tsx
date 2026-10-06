import { Link } from "@tanstack/react-router";
import { Home } from "lucide-react";

import { Button } from "@zo-stack/ui/components/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle
} from "@zo-stack/ui/components/empty";

import { CenteredLayout } from "@/widgets/layouts";

export function DefaultNotFoundPage() {
  return (
    <CenteredLayout>
      {/* Keep 404s out of search results. */}
      <meta name="robots" content="noindex" />
      <Empty>
        <EmptyHeader>
          <EmptyTitle className="mask-b-from-20% mask-b-to-80% text-9xl font-extrabold">
            404
          </EmptyTitle>
          <EmptyDescription className="-mt-8 text-nowrap text-foreground/80">
            This page doesn't exist. <br />
            It may have moved or been removed.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button light="skeuomorphic" size="lg" asChild>
            <Link to="/">
              <Home data-icon="inline-start" />
              Go home
            </Link>
          </Button>
        </EmptyContent>
      </Empty>
    </CenteredLayout>
  );
}
