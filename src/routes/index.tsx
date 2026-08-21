import { useEffect } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { BrandWordmark } from "@/components/Brand";
import { Button } from "@/components/ui/button";
import { ORG_NAME } from "@/lib/constants";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Harvesters Outreach | Harvesters International Christian Centre" },
      {
        name: "description",
        content:
          "Internal outreach management tool for Harvesters International Christian Centre. Sign in to register people reached and coordinate follow-up.",
      },
      { property: "og:title", content: "Harvesters Outreach" },
      {
        property: "og:description",
        content: "Internal outreach management tool for Harvesters International Christian Centre.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    supabase.auth.getUser().then(({ data }) => {
      if (!cancelled && data.user) navigate({ to: "/dashboard", replace: true });
    });
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
          <BrandWordmark className="h-6 sm:h-7" />
          <Button asChild size="sm">
            <Link to="/auth">Sign in</Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Internal tool
        </p>
        <h1 className="mt-2 max-w-2xl text-2xl font-semibold leading-tight text-foreground sm:text-3xl">
          Outreach management for {ORG_NAME}
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          This workspace is used by outreach volunteers and leaders to record the people reached
          during an outreach, coordinate follow-up and track progress against the outreach target.
          Access is restricted to authorised members of the outreach team.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-md border border-border bg-card p-4">
            <p className="text-sm font-medium text-foreground">Current outreach</p>
            <p className="mt-1 text-sm text-muted-foreground">Feeding Outreach</p>
          </div>
          <div className="rounded-md border border-border bg-card p-4">
            <p className="text-sm font-medium text-foreground">Date</p>
            <p className="mt-1 text-sm text-muted-foreground">Saturday, 22 August 2026</p>
          </div>
          <div className="rounded-md border border-border bg-card p-4">
            <p className="text-sm font-medium text-foreground">Location</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Harbatuer, Odieran Market, Bariga
            </p>
          </div>
        </div>

        <section className="mt-10 max-w-2xl border-t border-border pt-8">
          <h2 className="text-base font-semibold text-foreground">About this initiative</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            The End Hunger Initiative is part of the missions and outreach work of {ORG_NAME}. It
            provides food directly to people in need in the communities where the church serves.
            This feeding outreach continues that work, and every person recorded here is someone the
            outreach team can follow up with and support.
          </p>
          <p className="mt-3 text-xs text-muted-foreground">
            Personal information recorded in this tool is confidential and must only be used for
            church follow-up and care.
          </p>
        </section>

        <div className="mt-10">
          <Button asChild>
            <Link to="/auth">Sign in to continue</Link>
          </Button>
        </div>
      </main>

      <footer className="border-t border-border py-6">
        <p className="mx-auto max-w-5xl px-4 text-xs text-muted-foreground sm:px-6">{ORG_NAME}</p>
      </footer>
    </div>
  );
}
