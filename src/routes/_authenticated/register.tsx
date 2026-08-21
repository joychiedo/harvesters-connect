import { useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/AppShell";
import { Field, NativeSelect } from "@/components/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { useCampuses, useEvents } from "@/lib/data";
import {
  AGE_GROUPS,
  CONTACT_METHODS,
  GENDERS,
  MINISTRY_INTERESTS,
  describeDbError,
  isValidNigerianPhone,
  normalizePhone,
} from "@/lib/constants";

export const Route = createFileRoute("/_authenticated/register")({
  head: () => ({
    meta: [
      { title: "Register person | Harvesters Outreach" },
      {
        name: "description",
        content: "Quickly record a person reached during the outreach and capture follow-up details.",
      },
    ],
  }),
  component: RegisterPage,
});

type FormState = {
  full_name: string;
  phone: string;
  alternate_phone: string;
  gender: string;
  age_group: string;
  location: string;
  campus_id: string;
  outreach_event_id: string;
  cell: string;
  zone: string;
  preferred_contact_method: string;
  ministry_interest: string;
  prayer_request: string;
  notes: string;
  interested_in_church: boolean;
  wants_contact: boolean;
  accepted_christ: boolean;
};

const EMPTY: FormState = {
  full_name: "",
  phone: "",
  alternate_phone: "",
  gender: "",
  age_group: "",
  location: "",
  campus_id: "",
  outreach_event_id: "",
  cell: "",
  zone: "",
  preferred_contact_method: "",
  ministry_interest: "",
  prayer_request: "",
  notes: "",
  interested_in_church: false,
  wants_contact: false,
  accepted_christ: false,
};

function useDefaults() {
  const events = useEvents();
  const activeEventId = useMemo(
    () => (events.data ?? []).find((e) => !e.archived)?.id ?? "",
    [events.data],
  );
  return { events, activeEventId };
}

function RegisterPage() {
  const { currentUser, displayName } = useAuth();
  const campuses = useCampuses();
  const { events, activeEventId } = useDefaults();
  const queryClient = useQueryClient();

  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [busy, setBusy] = useState(false);
  const [savedCount, setSavedCount] = useState(0);
  const [lastSaved, setLastSaved] = useState<{ id: string; name: string } | null>(null);
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (activeEventId && !form.outreach_event_id) {
      setForm((f) => ({ ...f, outreach_event_id: activeEventId }));
    }
  }, [activeEventId, form.outreach_event_id]);

  useEffect(() => {
    const campusId = currentUser?.profile?.campus_id;
    if (campusId && !form.campus_id) setForm((f) => ({ ...f, campus_id: campusId }));
  }, [currentUser?.profile?.campus_id, form.campus_id]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  function validate(): boolean {
    const next: Partial<Record<keyof FormState, string>> = {};
    if (form.full_name.trim().length < 2) next.full_name = "Enter the person's full name";
    if (form.full_name.trim().length > 120) next.full_name = "Name is too long";
    if (form.phone && !isValidNigerianPhone(form.phone))
      next.phone = "Enter a valid Nigerian number, e.g. 08031234567";
    if (form.alternate_phone && !isValidNigerianPhone(form.alternate_phone))
      next.alternate_phone = "Enter a valid Nigerian number";
    if (form.wants_contact && !form.phone.trim())
      next.phone = "A phone number is required when the person wants to be contacted";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function save(addAnother: boolean) {
    if (!validate()) {
      toast.error("Please correct the highlighted fields.");
      return;
    }
    const userId = currentUser?.user.id;
    if (!userId) {
      toast.error("Your session has expired. Please sign in again.");
      return;
    }

    setBusy(true);
    try {
      const phone = form.phone.trim() ? normalizePhone(form.phone) : null;

      if (phone) {
        const { data: dupe, error: dupeError } = await supabase.rpc("check_duplicate_person", {
          p_phone: phone,
          p_outreach_event_id: form.outreach_event_id || activeEventId,
        });
        if (dupeError) throw dupeError;
        const existing = dupe?.[0];
        if (existing) {
          setErrors({ phone: `This phone number is already registered to ${existing.full_name}.` });
          toast.error("Duplicate phone number — this person is already registered.");
          return;
        }
      }

      const { data, error } = await supabase
        .from("people")
        .insert({
          full_name: form.full_name.trim(),
          phone,
          alternate_phone: form.alternate_phone.trim() ? normalizePhone(form.alternate_phone) : null,
          gender: form.gender || null,
          age_group: form.age_group || null,
          location: form.location.trim() || null,
          campus_id: form.campus_id || null,
          outreach_event_id: form.outreach_event_id || null,
          cell: form.cell.trim() || null,
          zone: form.zone.trim() || null,
          preferred_contact_method: form.preferred_contact_method || null,
          ministry_interest: form.ministry_interest || null,
          prayer_request: form.prayer_request.trim() || null,
          notes: form.notes.trim() || null,
          interested_in_church: form.interested_in_church,
          wants_contact: form.wants_contact,
          accepted_christ: form.accepted_christ,
          registered_by: userId,
          registered_by_name: displayName,
        })
        .select("id, full_name")
        .single();
      if (error) throw error;

      await queryClient.invalidateQueries({ queryKey: ["people"] });
      setSavedCount((c) => c + 1);
      setLastSaved({ id: data.id, name: data.full_name });
      toast.success(`${data.full_name} saved.`);

      if (addAnother) {
        setForm({
          ...EMPTY,
          outreach_event_id: form.outreach_event_id,
          campus_id: form.campus_id,
          location: form.location,
        });
        setErrors({});
        nameRef.current?.focus();
      } else {
        setForm({ ...EMPTY, outreach_event_id: form.outreach_event_id, campus_id: form.campus_id });
        setErrors({});
      }
    } catch (err) {
      const e = err as { message?: string; code?: string };
      if (e.code === "23505") {
        setErrors({ phone: "This phone number is already registered." });
        toast.error("Duplicate phone number.");
      } else {
        toast.error(describeDbError(e));
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <PageHeader
        title="Register person reached"
        description="Only the name is required. Capture a phone number when the person wants follow-up."
      />

      {savedCount > 0 && (
        <div className="mb-5 flex flex-wrap items-center justify-between gap-2 rounded-md border border-border bg-muted px-4 py-3 text-sm">
          <span className="text-muted-foreground">
            {savedCount} {savedCount === 1 ? "person" : "people"} saved in this session.
          </span>
          {lastSaved && (
            <Button asChild variant="outline" size="sm">
              <Link to="/people/$id" params={{ id: lastSaved.id }}>
                Open {lastSaved.name}
              </Link>
            </Button>
          )}
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void save(false);
        }}
        className="space-y-6"
      >
        <div className="rounded-md border border-border bg-card p-4 sm:p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Field label="Full name" htmlFor="full_name" required error={errors.full_name}>
                <Input
                  id="full_name"
                  ref={nameRef}
                  value={form.full_name}
                  onChange={(e) => set("full_name", e.target.value)}
                  autoComplete="off"
                  className="h-11"
                />
              </Field>
            </div>
            <Field
              label="Phone number"
              htmlFor="phone"
              error={errors.phone}
              hint="Used to check for duplicates"
            >
              <Input
                id="phone"
                type="tel"
                inputMode="tel"
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
                className="h-11"
              />
            </Field>
            <Field label="Alternate phone" htmlFor="alternate_phone" error={errors.alternate_phone}>
              <Input
                id="alternate_phone"
                type="tel"
                inputMode="tel"
                value={form.alternate_phone}
                onChange={(e) => set("alternate_phone", e.target.value)}
                className="h-11"
              />
            </Field>
            <Field label="Gender" htmlFor="gender">
              <NativeSelect
                id="gender"
                value={form.gender}
                onChange={(e) => set("gender", e.target.value)}
              >
                <option value="">Not stated</option>
                {GENDERS.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </NativeSelect>
            </Field>
            <Field label="Age group" htmlFor="age_group">
              <NativeSelect
                id="age_group"
                value={form.age_group}
                onChange={(e) => set("age_group", e.target.value)}
              >
                <option value="">Not stated</option>
                {AGE_GROUPS.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </NativeSelect>
            </Field>
            <Field label="Area / street" htmlFor="location">
              <Input
                id="location"
                value={form.location}
                onChange={(e) => set("location", e.target.value)}
                className="h-11"
              />
            </Field>
            <Field label="Nearest campus" htmlFor="campus_id">
              <NativeSelect
                id="campus_id"
                value={form.campus_id}
                onChange={(e) => set("campus_id", e.target.value)}
              >
                <option value="">Not decided</option>
                {(campuses.data ?? [])
                  .filter((c) => c.active)
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
              </NativeSelect>
            </Field>
            <div className="sm:col-span-2">
              <Field label="Outreach event" htmlFor="outreach_event_id">
                <NativeSelect
                  id="outreach_event_id"
                  value={form.outreach_event_id}
                  onChange={(e) => set("outreach_event_id", e.target.value)}
                >
                  <option value="">Not linked to an event</option>
                  {(events.data ?? []).map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name} — {new Date(e.date).toLocaleDateString("en-GB")}
                    </option>
                  ))}
                </NativeSelect>
              </Field>
            </div>
          </div>
        </div>

        <div className="rounded-md border border-border bg-card p-4 sm:p-5">
          <p className="text-sm font-semibold text-foreground">Response</p>
          <div className="mt-3 space-y-3">
            {(
              [
                ["accepted_christ", "Accepted Christ today"],
                ["interested_in_church", "Interested in attending church"],
                ["wants_contact", "Wants to be contacted"],
              ] as const
            ).map(([key, label]) => (
              <div key={key} className="flex items-center gap-3">
                <Checkbox
                  id={key}
                  checked={form[key]}
                  onCheckedChange={(v) => set(key, v === true)}
                />
                <Label htmlFor={key} className="text-sm font-normal">
                  {label}
                </Label>
              </div>
            ))}
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="Preferred contact method" htmlFor="preferred_contact_method">
              <NativeSelect
                id="preferred_contact_method"
                value={form.preferred_contact_method}
                onChange={(e) => set("preferred_contact_method", e.target.value)}
              >
                <option value="">Not stated</option>
                {CONTACT_METHODS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </NativeSelect>
            </Field>
            <Field label="Ministry interest" htmlFor="ministry_interest">
              <NativeSelect
                id="ministry_interest"
                value={form.ministry_interest}
                onChange={(e) => set("ministry_interest", e.target.value)}
              >
                <option value="">None stated</option>
                {MINISTRY_INTERESTS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </NativeSelect>
            </Field>
            <Field label="Cell" htmlFor="cell">
              <Input
                id="cell"
                value={form.cell}
                onChange={(e) => set("cell", e.target.value)}
                className="h-11"
              />
            </Field>
            <Field label="Zone" htmlFor="zone">
              <Input
                id="zone"
                value={form.zone}
                onChange={(e) => set("zone", e.target.value)}
                className="h-11"
              />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Prayer request" htmlFor="prayer_request">
                <Textarea
                  id="prayer_request"
                  rows={2}
                  value={form.prayer_request}
                  onChange={(e) => set("prayer_request", e.target.value)}
                />
              </Field>
            </div>
            <div className="sm:col-span-2">
              <Field label="Notes" htmlFor="notes">
                <Textarea
                  id="notes"
                  rows={2}
                  value={form.notes}
                  onChange={(e) => set("notes", e.target.value)}
                />
              </Field>
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 -mx-4 flex gap-3 border-t border-border bg-background/95 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-md sm:border sm:px-4">
          <Button type="submit" className="h-11 flex-1" disabled={busy}>
            {busy ? "Saving..." : "Save"}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="h-11 flex-1"
            disabled={busy}
            onClick={() => void save(true)}
          >
            Save &amp; add another
          </Button>
        </div>
      </form>
    </>
  );
}
