import { createFileRoute } from "@tanstack/react-router";
import { EmptyState, ErrorState, PageHeader } from "@/components/AppShell";
import { SectionCard } from "@/components/form";
import { Button } from "@/components/ui/button";
import { usePeople, useFollowUps } from "@/lib/data";
import { describeDbError, statusLabel } from "@/lib/constants";
import { downloadCsv } from "@/lib/csv";

export const Route = createFileRoute("/_authenticated/reports")({
  head: () => ({
    meta: [
      { title: "Reports | Harvesters Outreach" },
      { name: "description", content: "Export outreach records for offline reporting." },
    ],
  }),
  component: ReportsPage,
});

function ReportsPage() {
  const people = usePeople({});
  const followUps = useFollowUps();

  if (people.isError) {
    return (
      <ErrorState message={describeDbError(people.error as { message?: string })} onRetry={() => people.refetch()} />
    );
  }

  const rows = people.data ?? [];

  function exportPeople() {
    downloadCsv(
      `harvesters-outreach-people-${new Date().toISOString().slice(0, 10)}.csv`,
      ["Full name", "Phone", "Gender", "Age group", "Location", "Status", "Accepted Christ", "Registered"],
      rows.map((p) => [
        p.full_name,
        p.phone ?? "",
        p.gender ?? "",
        p.age_group ?? "",
        p.location ?? "",
        statusLabel(p.follow_up_status),
        p.accepted_christ ? "Yes" : "No",
        new Date(p.registration_date).toISOString(),
      ]),
    );
  }

  function exportFollowUps() {
    const fu = followUps.data ?? [];
    downloadCsv(
      `harvesters-outreach-followups-${new Date().toISOString().slice(0, 10)}.csv`,
      ["Person ID", "Status", "Contact date", "Notes", "Next follow-up", "By"],
      fu.map((f) => [
        f.person_id,
        statusLabel(f.status),
        f.contact_date ?? "",
        f.notes ?? "",
        f.next_follow_up_date ?? "",
        f.created_by_name ?? "",
      ]),
    );
  }

  return (
    <>
      <PageHeader title="Reports" description="Export outreach records for offline reporting." />

      {rows.length === 0 ? (
        <EmptyState title="Nothing to export yet" description="Records appear here once people are registered." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          <SectionCard title="People">
            <p className="text-sm text-muted-foreground">{rows.length} records ready for export.</p>
            <Button className="mt-4" onClick={exportPeople}>
              Export people CSV
            </Button>
          </SectionCard>
          <SectionCard title="Follow-up log">
            <p className="text-sm text-muted-foreground">
              {(followUps.data ?? []).length} follow-up entries ready for export.
            </p>
            <Button className="mt-4" onClick={exportFollowUps}>
              Export follow-ups CSV
            </Button>
          </SectionCard>
        </div>
      )}
    </>
  );
}
