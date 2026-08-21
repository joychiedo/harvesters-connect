import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { EmptyState, ErrorState, PageHeader } from "@/components/AppShell";
import { Field, NativeSelect, SectionCard } from "@/components/form";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { useCampuses, useFollowUps, usePerson } from "@/lib/data";
import { FOLLOW_UP_STATUSES, describeDbError, statusLabel, type FollowUpStatus } from "@/lib/constants";

export const Route = createFileRoute("/_authenticated/people/$id")({
  head: () => ({
    meta: [{ title: "Person | Harvesters Outreach" }],
  }),
  component: PersonProfilePage,
});

function PersonProfilePage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { currentUser, displayName, canViewAll } = useAuth();
  const campuses = useCampuses();
  const person = usePerson(id);
  const followUps = useFollowUps(id);

  const [status, setStatus] = useState<FollowUpStatus>("contacted");
  const [notes, setNotes] = useState("");
  const [nextDate, setNextDate] = useState("");
  const [busy, setBusy] = useState(false);

  if (person.isError) {
    return (
      <ErrorState message={describeDbError(person.error as { message?: string })} onRetry={() => person.refetch()} />
    );
  }
  if (person.isLoading) {
    return <div className="py-12 text-center text-sm text-muted-foreground">Loading…</div>;
  }
  if (!person.data) {
    return <EmptyState title="Person not found" description="This record may have been removed." />;
  }

  const p = person.data;
  const campusName = (campuses.data ?? []).find((c) => c.id === p.campus_id)?.name ?? "—";

  async function submitFollowUp() {
    const userId = currentUser?.user.id;
    if (!userId) {
      toast.error("Your session has expired. Please sign in again.");
      return;
    }
    setBusy(true);
    try {
      const { error: fuError } = await supabase.from("follow_ups").insert({
        person_id: id,
        status,
        notes: notes.trim() || null,
        contact_date: new Date().toISOString().slice(0, 10),
        next_follow_up_date: nextDate || null,
        created_by: userId,
        created_by_name: displayName,
      });
      if (fuError) throw fuError;

      const { error: pError } = await supabase.from("people").update({ follow_up_status: status }).eq("id", id);
      if (pError) throw pError;

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["follow-ups", id] }),
        queryClient.invalidateQueries({ queryKey: ["person", id] }),
        queryClient.invalidateQueries({ queryKey: ["people"] }),
      ]);
      toast.success("Follow-up saved.");
      setNotes("");
      setNextDate("");
    } catch (err) {
      toast.error(describeDbError(err as { message?: string }));
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <PageHeader
        title={p.full_name}
        description={`Registered ${new Date(p.registration_date).toLocaleDateString("en-GB")}`}
        action={
          <Button variant="outline" size="sm" onClick={() => navigate({ to: "/people" })}>
            Back to directory
          </Button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <SectionCard title="Details">
            <dl className="space-y-3 text-sm">
              <Detail label="Phone" value={p.phone ?? "—"} />
              <Detail label="Alternate phone" value={p.alternate_phone ?? "—"} />
              <Detail label="Gender" value={p.gender ?? "—"} />
              <Detail label="Age group" value={p.age_group ?? "—"} />
              <Detail label="Location" value={p.location ?? "—"} />
              <Detail label="Campus" value={campusName} />
              <Detail label="Cell" value={p.cell ?? "—"} />
              <Detail label="Zone" value={p.zone ?? "—"} />
              <Detail label="Ministry interest" value={p.ministry_interest ?? "—"} />
              <Detail label="Preferred contact" value={p.preferred_contact_method ?? "—"} />
              <Detail label="Interested in church" value={p.interested_in_church ? "Yes" : "No"} />
              <Detail label="Wants contact" value={p.wants_contact ? "Yes" : "No"} />
              <Detail label="Accepted Christ" value={p.accepted_christ ? "Yes" : "No"} />
              {p.prayer_request && <Detail label="Prayer request" value={p.prayer_request} />}
              {p.notes && <Detail label="Notes" value={p.notes} />}
              <Detail label="Registered by" value={p.registered_by_name ?? "—"} />
            </dl>
          </SectionCard>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <SectionCard title="Log a follow-up">
            <div className="space-y-4">
              <Field label="Outcome" required>
                <NativeSelect value={status} onChange={(e) => setStatus(e.target.value as FollowUpStatus)}>
                  {FOLLOW_UP_STATUSES.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </NativeSelect>
              </Field>
              <Field label="Next follow-up date">
                <input
                  type="date"
                  value={nextDate}
                  onChange={(e) => setNextDate(e.target.value)}
                  className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </Field>
              <Field label="Notes">
                <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
              </Field>
              <Button onClick={submitFollowUp} disabled={busy}>
                {busy ? "Saving…" : "Save follow-up"}
              </Button>
            </div>
          </SectionCard>

          <SectionCard title="Follow-up history">
            {followUps.isLoading ? (
              <p className="text-sm text-muted-foreground">Loading…</p>
            ) : (followUps.data ?? []).length === 0 ? (
              <EmptyState title="No follow-ups logged yet" description="Entries you save above will appear here." />
            ) : (
              <ul className="space-y-3">
                {(followUps.data ?? []).map((f) => (
                  <li key={f.id} className="border-b border-border pb-3 text-sm last:border-0 last:pb-0">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-foreground">{statusLabel(f.status)}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(f.created_at).toLocaleDateString("en-GB")}
                      </span>
                    </div>
                    {f.notes && <p className="mt-1 text-muted-foreground">{f.notes}</p>}
                    <p className="mt-1 text-xs text-muted-foreground">
                      By {f.created_by_name ?? "—"}
                      {f.next_follow_up_date &&
                        ` · Next: ${new Date(f.next_follow_up_date).toLocaleDateString("en-GB")}`}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>
        </div>
      </div>
    </>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 text-foreground">{value}</dd>
    </div>
  );
}
