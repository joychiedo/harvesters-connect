import { createFileRoute, Navigate } from "@tanstack/react-router";
import { EmptyState, ErrorState, PageHeader } from "@/components/AppShell";
import { useAuth } from "@/hooks/useAuth";
import { useCampuses, usePeople } from "@/lib/data";
import { describeDbError } from "@/lib/constants";

export const Route = createFileRoute("/_authenticated/campuses")({
  head: () => ({
    meta: [
      { title: "Campuses | Harvesters Outreach" },
      { name: "description", content: "Official Harvesters International Christian Centre campuses." },
    ],
  }),
  component: CampusesPage,
});

function CampusesPage() {
  const { isAdmin, isLoading } = useAuth();
  const campuses = useCampuses();
  const people = usePeople({});

  if (isLoading) return null;
  if (!isAdmin) return <Navigate to="/dashboard" />;

  if (campuses.isError) {
    return (
      <ErrorState
        message={describeDbError(campuses.error as { message?: string })}
        onRetry={() => campuses.refetch()}
      />
    );
  }

  const rows = campuses.data ?? [];
  const counts = new Map<string, number>();
  for (const p of people.data ?? []) {
    if (p.campus_id) counts.set(p.campus_id, (counts.get(p.campus_id) ?? 0) + 1);
  }

  return (
    <>
      <PageHeader title="Campuses" description="Official Harvesters International Christian Centre campuses." />

      {campuses.isLoading ? (
        <div className="py-12 text-center text-sm text-muted-foreground">Loading…</div>
      ) : rows.length === 0 ? (
        <EmptyState title="No campuses in the database yet" />
      ) : (
        <div className="divide-y divide-border rounded-md border border-border bg-card">
          {rows.map((c) => (
            <div key={c.id} className="flex items-center justify-between px-4 py-3 text-sm">
              <div>
                <p className="font-medium text-foreground">{c.name}</p>
                <p className="text-xs text-muted-foreground">{c.location}</p>
              </div>
              <span className="text-xs text-muted-foreground">{counts.get(c.id) ?? 0} registered</span>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
