import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { EmptyState, ErrorState, PageHeader } from "@/components/AppShell";
import { NativeSelect } from "@/components/form";
import { useAuth } from "@/hooks/useAuth";
import { usePeople, useRealtimeSync } from "@/lib/data";
import { FOLLOW_UP_STATUSES, describeDbError, statusLabel } from "@/lib/constants";

export const Route = createFileRoute("/_authenticated/follow-ups")({
  head: () => ({
    meta: [
      { title: "Follow-up | Harvesters Outreach" },
      { name: "description", content: "People awaiting or receiving follow-up." },
    ],
  }),
  component: FollowUpsPage,
});

function FollowUpsPage() {
  useRealtimeSync();
  const { canViewAll } = useAuth();
  const [status, setStatus] = useState("");
  const people = usePeople({ status, sort: "priority" });

  if (people.isError) {
    return (
      <ErrorState message={describeDbError(people.error as { message?: string })} onRetry={() => people.refetch()} />
    );
  }

  const rows = people.data ?? [];

  return (
    <>
      <PageHeader
        title="Follow-up"
        description={
          canViewAll
            ? "People awaiting or receiving follow-up across the team."
            : "People assigned to you or that you registered."
        }
      />

      <div className="mb-4 sm:w-56">
        <NativeSelect value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          {FOLLOW_UP_STATUSES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </NativeSelect>
      </div>

      {people.isLoading ? (
        <div className="py-12 text-center text-sm text-muted-foreground">Loading…</div>
      ) : rows.length === 0 ? (
        <EmptyState title="No follow-ups yet" description="They'll appear once people are registered." />
      ) : (
        <div className="divide-y divide-border rounded-md border border-border bg-card">
          {rows.map((p) => (
            <Link
              key={p.id}
              to="/people/$id"
              params={{ id: p.id }}
              className="flex items-center justify-between gap-3 px-4 py-3 text-sm hover:bg-muted/50"
            >
              <span className="min-w-0">
                <span className="block truncate font-medium text-foreground">{p.full_name}</span>
                <span className="block truncate text-xs text-muted-foreground">
                  {p.phone || "No phone"}
                </span>
              </span>
              <span className="shrink-0 rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground">
                {statusLabel(p.follow_up_status)}
              </span>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
