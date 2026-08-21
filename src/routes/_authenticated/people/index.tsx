import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { EmptyState, ErrorState, PageHeader } from "@/components/AppShell";
import { NativeSelect } from "@/components/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { useCampuses, useEvents, usePeople, useRealtimeSync } from "@/lib/data";
import { AGE_GROUPS, FOLLOW_UP_STATUSES, GENDERS, describeDbError, statusLabel } from "@/lib/constants";

export const Route = createFileRoute("/_authenticated/people/")({
  head: () => ({
    meta: [
      { title: "People | Harvesters Outreach" },
      { name: "description", content: "Search and filter everyone reached during outreach." },
    ],
  }),
  component: PeopleIndexPage,
});

const PAGE_SIZE = 25;

function PeopleIndexPage() {
  useRealtimeSync();
  const { canViewAll } = useAuth();
  const campuses = useCampuses();
  const events = useEvents();

  const [search, setSearch] = useState("");
  const [campusId, setCampusId] = useState("");
  const [eventId, setEventId] = useState("");
  const [ageGroup, setAgeGroup] = useState("");
  const [gender, setGender] = useState("");
  const [status, setStatus] = useState("");
  const [sort, setSort] = useState<"newest" | "oldest" | "name" | "priority">("newest");
  const [page, setPage] = useState(0);

  const people = usePeople({ search, campusId, eventId, ageGroup, gender, status, sort });

  const rows = people.data ?? [];
  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const pageRows = useMemo(
    () => rows.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE),
    [rows, page],
  );

  function resetPage<T>(setter: (v: T) => void) {
    return (v: T) => {
      setter(v);
      setPage(0);
    };
  }

  if (people.isError) {
    return (
      <ErrorState message={describeDbError(people.error as { message?: string })} onRetry={() => people.refetch()} />
    );
  }

  return (
    <>
      <PageHeader
        title="People"
        description={
          canViewAll
            ? `${rows.length} ${rows.length === 1 ? "record" : "records"} visible to you`
            : `${rows.length} ${rows.length === 1 ? "record" : "records"} you registered or were assigned`
        }
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <Input
          placeholder="Search name, phone, location"
          value={search}
          onChange={(e) => resetPage(setSearch)(e.target.value)}
          className="sm:max-w-xs"
        />
        <NativeSelect
          value={campusId}
          onChange={(e) => resetPage(setCampusId)(e.target.value)}
          className="sm:w-44"
        >
          <option value="">All campuses</option>
          {(campuses.data ?? []).map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </NativeSelect>
        <NativeSelect value={eventId} onChange={(e) => resetPage(setEventId)(e.target.value)} className="sm:w-44">
          <option value="">All events</option>
          {(events.data ?? []).map((e) => (
            <option key={e.id} value={e.id}>
              {e.name}
            </option>
          ))}
        </NativeSelect>
        <NativeSelect value={status} onChange={(e) => resetPage(setStatus)(e.target.value)} className="sm:w-44">
          <option value="">Any status</option>
          {FOLLOW_UP_STATUSES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </NativeSelect>
        <NativeSelect value={ageGroup} onChange={(e) => resetPage(setAgeGroup)(e.target.value)} className="sm:w-36">
          <option value="">Any age</option>
          {AGE_GROUPS.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </NativeSelect>
        <NativeSelect value={gender} onChange={(e) => resetPage(setGender)(e.target.value)} className="sm:w-32">
          <option value="">Any gender</option>
          {GENDERS.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </NativeSelect>
        <NativeSelect
          value={sort}
          onChange={(e) => setSort(e.target.value as typeof sort)}
          className="sm:w-40"
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="name">Name</option>
          <option value="priority">Priority</option>
        </NativeSelect>
      </div>

      {people.isLoading ? (
        <div className="py-12 text-center text-sm text-muted-foreground">Loading…</div>
      ) : rows.length === 0 ? (
        <EmptyState
          title="No records found"
          description="Try a different search, or check your filters."
        />
      ) : (
        <>
          <div className="divide-y divide-border rounded-md border border-border bg-card">
            {pageRows.map((p) => (
              <Link
                key={p.id}
                to="/people/$id"
                params={{ id: p.id }}
                className="flex items-center justify-between gap-3 px-4 py-3 text-sm hover:bg-muted/50"
              >
                <span className="min-w-0">
                  <span className="block truncate font-medium text-foreground">{p.full_name}</span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {p.phone || "No phone"} · {p.location || "No location"}
                  </span>
                </span>
                <span className="shrink-0 text-xs text-muted-foreground">{statusLabel(p.follow_up_status)}</span>
              </Link>
            ))}
          </div>

          <div className="mt-4 flex items-center justify-between text-sm">
            <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
              Previous
            </Button>
            <span className="text-muted-foreground">
              Page {page + 1} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page + 1 >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </>
      )}
    </>
  );
}
