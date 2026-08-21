import { createFileRoute, Link } from "@tanstack/react-router";
import { EmptyState, ErrorState, PageHeader } from "@/components/AppShell";
import { SectionCard, StatCard } from "@/components/form";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import { useCampuses, useEvents, useFollowUps, usePeople, useRealtimeSync } from "@/lib/data";
import { FOLLOW_UP_STATUSES, describeDbError, statusLabel } from "@/lib/constants";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard | Harvesters Outreach" },
      {
        name: "description",
        content: "Live outreach statistics: people reached, follow-up progress and campus spread.",
      },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  useRealtimeSync();
  const { displayName, canViewAll } = useAuth();
  const people = usePeople({});
  const events = useEvents();
  const campuses = useCampuses();
  const followUps = useFollowUps();

  if (people.isError) {
    return (
      <ErrorState message={describeDbError(people.error as { message?: string })} onRetry={() => people.refetch()} />
    );
  }

  const rows = people.data ?? [];
  const activeEvent = (events.data ?? []).find((e) => !e.archived) ?? null;
  const eventRows = activeEvent ? rows.filter((p) => p.outreach_event_id === activeEvent.id) : rows;
  const target = activeEvent?.target_count ?? 0;
  const pct = target > 0 ? Math.min(100, Math.round((eventRows.length / target) * 100)) : 0;

  const today = new Date().toISOString().slice(0, 10);
  const todayCount = rows.filter((p) => p.registration_date.slice(0, 10) === today).length;
  const accepted = rows.filter((p) => p.accepted_christ).length;
  const wantsContact = rows.filter((p) => p.wants_contact).length;
  const pendingFollowUp = rows.filter((p) => p.follow_up_status === "new").length;

  const byStatus = FOLLOW_UP_STATUSES.map((s) => ({
    ...s,
    count: rows.filter((p) => p.follow_up_status === s.value).length,
  })).filter((s) => s.count > 0);

  const byCampus = (campuses.data ?? [])
    .map((c) => ({ name: c.name, count: rows.filter((p) => p.campus_id === c.id).length }))
    .filter((c) => c.count > 0)
    .sort((a, b) => b.count - a.count);

  const recent = rows.slice(0, 8);

  return (
    <>
      <PageHeader
        title={`Welcome, ${displayName}`}
        description={
          canViewAll
            ? "Live figures across the outreach team."
            : "Live figures for the records you registered or were assigned."
        }
        action={
          <Button asChild>
            <Link to="/register">Register person</Link>
          </Button>
        }
      />

      {activeEvent && (
        <div className="mb-6 rounded-md border border-border bg-card p-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <div>
              <p className="text-sm font-semibold text-foreground">{activeEvent.name}</p>
              <p className="text-xs text-muted-foreground">
                {new Date(activeEvent.date).toLocaleDateString("en-GB", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
                {activeEvent.location ? ` · ${activeEvent.location}` : ""}
              </p>
            </div>
            <p className="text-sm tabular-nums text-muted-foreground">
              <span className="font-semibold text-foreground">{eventRows.length}</span>
              {target > 0 ? ` of ${target} target` : " registered"}
            </p>
          </div>
          {target > 0 && (
            <>
              <Progress value={pct} className="mt-3 h-2" />
              <p className="mt-1.5 text-xs text-muted-foreground">{pct}% of target reached</p>
            </>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="People reached" value={rows.length} sub="All records visible to you" />
        <StatCard label="Registered today" value={todayCount} />
        <StatCard label="Accepted Christ" value={accepted} />
        <StatCard label="Want contact" value={wantsContact} />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <SectionCard title="Follow-up status">
          {rows.length === 0 ? (
            <EmptyState title="No records yet" description="Statistics appear once people are registered." />
          ) : (
            <ul className="space-y-2">
              {byStatus.map((s) => (
                <li key={s.value} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{s.label}</span>
                  <span className="font-medium tabular-nums text-foreground">{s.count}</span>
                </li>
              ))}
              <li className="flex items-center justify-between border-t border-border pt-2 text-sm">
                <span className="text-muted-foreground">Follow-up logs recorded</span>
                <span className="font-medium tabular-nums text-foreground">
                  {(followUps.data ?? []).length}
                </span>
              </li>
              <li className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Awaiting first contact</span>
                <span className="font-medium tabular-nums text-foreground">{pendingFollowUp}</span>
              </li>
            </ul>
          )}
        </SectionCard>

        <SectionCard title="By campus">
          {byCampus.length === 0 ? (
            <EmptyState title="No campus data yet" description="Campus figures appear once people are linked to a campus." />
          ) : (
            <ul className="space-y-2">
              {byCampus.map((c) => (
                <li key={c.name} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{c.name}</span>
                  <span className="font-medium tabular-nums text-foreground">{c.count}</span>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
      </div>

      <div className="mt-4">
        <SectionCard
          title="Recent registrations"
          action={
            <Button asChild variant="outline" size="sm">
              <Link to="/people">View all people</Link>
            </Button>
          }
        >
          {recent.length === 0 ? (
            <EmptyState
              title="Nothing registered yet"
              description="Start the outreach by registering the first person reached."
              action={
                <Button asChild>
                  <Link to="/register">Register person</Link>
                </Button>
              }
            />
          ) : (
            <ul className="divide-y divide-border">
              {recent.map((p) => (
                <li key={p.id}>
                  <Link
                    to="/people/$id"
                    params={{ id: p.id }}
                    className="flex items-center justify-between gap-3 py-2.5 text-sm hover:text-primary"
                  >
                    <span className="min-w-0">
                      <span className="block truncate font-medium text-foreground">{p.full_name}</span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {p.phone || "No phone"} · {p.location || "No location"}
                      </span>
                    </span>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {statusLabel(p.follow_up_status)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
      </div>
    </>
  );
}
