import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { EmptyState, ErrorState, PageHeader } from "@/components/AppShell";
import { Field, SectionCard } from "@/components/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { useEvents } from "@/lib/data";
import { describeDbError } from "@/lib/constants";

export const Route = createFileRoute("/_authenticated/events")({
  head: () => ({
    meta: [
      { title: "Outreach events | Harvesters Outreach" },
      { name: "description", content: "Current and past outreach events." },
    ],
  }),
  component: EventsPage,
});

const EMPTY = { name: "", date: "", location: "", target_count: "", description: "" };

function EventsPage() {
  const { isAdmin } = useAuth();
  const events = useEvents();
  const queryClient = useQueryClient();
  const [form, setForm] = useState(EMPTY);
  const [busy, setBusy] = useState(false);

  async function createEvent() {
    if (!form.name.trim() || !form.date) {
      toast.error("Name and date are required.");
      return;
    }
    setBusy(true);
    try {
      const { error } = await supabase.from("outreach_events").insert({
        name: form.name.trim(),
        date: form.date,
        location: form.location.trim() || null,
        target_count: form.target_count ? Number(form.target_count) : 0,
        description: form.description.trim() || null,
      });
      if (error) throw error;
      await queryClient.invalidateQueries({ queryKey: ["events"] });
      toast.success("Event created.");
      setForm(EMPTY);
    } catch (err) {
      toast.error(describeDbError(err as { message?: string }));
    } finally {
      setBusy(false);
    }
  }

  if (events.isError) {
    return (
      <ErrorState message={describeDbError(events.error as { message?: string })} onRetry={() => events.refetch()} />
    );
  }

  const rows = events.data ?? [];

  return (
    <>
      <PageHeader title="Outreach events" description="Current and historical outreach events." />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-3">
          {events.isLoading ? (
            <div className="py-12 text-center text-sm text-muted-foreground">Loading…</div>
          ) : rows.length === 0 ? (
            <EmptyState title="No events yet" description="Create the first outreach event." />
          ) : (
            rows.map((ev) => (
              <div key={ev.id} className="rounded-md border border-border bg-card p-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="text-sm font-semibold text-foreground">{ev.name}</p>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      ev.archived ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary"
                    }`}
                  >
                    {ev.archived ? "Archived" : "Active"}
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {new Date(ev.date).toLocaleDateString("en-GB", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                  {ev.location ? ` · ${ev.location}` : ""}
                  {ev.target_count ? ` · Target ${ev.target_count}` : ""}
                </p>
                {ev.description && <p className="mt-2 text-sm text-foreground">{ev.description}</p>}
              </div>
            ))
          )}
        </div>

        {isAdmin && (
          <div>
            <SectionCard title="New event">
              <div className="space-y-4">
                <Field label="Name" required>
                  <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
                </Field>
                <Field label="Date" required>
                  <Input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                  />
                </Field>
                <Field label="Location">
                  <Input
                    value={form.location}
                    onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                  />
                </Field>
                <Field label="Target count">
                  <Input
                    type="number"
                    min="0"
                    value={form.target_count}
                    onChange={(e) => setForm((f) => ({ ...f, target_count: e.target.value }))}
                  />
                </Field>
                <Field label="Description">
                  <Textarea
                    rows={3}
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  />
                </Field>
                <Button onClick={createEvent} disabled={busy} className="w-full">
                  {busy ? "Saving…" : "Create event"}
                </Button>
              </div>
            </SectionCard>
          </div>
        )}
      </div>
    </>
  );
}
