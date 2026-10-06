import { type ErrorComponentProps, Link } from "@tanstack/react-router";
import { Home, RefreshCw } from "lucide-react";

import { Button } from "@zo-stack/ui/components/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle
} from "@zo-stack/ui/components/empty";

import { CenteredLayout } from "@/widgets/layouts";

export function DefaultErrorPage({ reset }: ErrorComponentProps) {
  return (
    <CenteredLayout>
      <Empty>
        <EmptyHeader>
          <EmptyTitle className="mask-b-from-20% mask-b-to-80% text-9xl font-extrabold">
            500
          </EmptyTitle>
          <EmptyDescription className="-mt-8 text-nowrap text-foreground/80">
            Something went wrong on our end. <br />
            Please try again.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <div className="flex gap-2">
            <Button light="skeuomorphic" asChild>
              <Link to="/">
                <Home data-icon="inline-start" />
                Go home
              </Link>
            </Button>
            <Button onClick={reset} variant="outline">
              <RefreshCw data-icon="inline-start" />
              Try again
            </Button>
          </div>
        </EmptyContent>
      </Empty>
    </CenteredLayout>
  );
}
