import { useState } from "react";
import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { EmptyState, ErrorState, PageHeader } from "@/components/AppShell";
import { NativeSelect } from "@/components/form";
import { useAuth } from "@/hooks/useAuth";
import { useCampuses } from "@/lib/data";
import { ROLES, describeDbError, roleLabel, type AppRole } from "@/lib/constants";

export const Route = createFileRoute("/_authenticated/team")({
  head: () => ({
    meta: [
      { title: "Team & roles | Harvesters Outreach" },
      { name: "description", content: "Staff, volunteers, and their assigned roles." },
    ],
  }),
  component: TeamPage,
});

type StaffRow = {
  id: string;
  full_name: string;
  phone: string | null;
  campus_id: string | null;
  roles: AppRole[];
};

function useStaff() {
  return useQuery({
    queryKey: ["team-staff"],
    queryFn: async (): Promise<StaffRow[]> => {
      const [{ data: profiles, error: pErr }, { data: roles, error: rErr }] = await Promise.all([
        supabase.from("profiles").select("id, full_name, phone, campus_id").order("full_name"),
        supabase.from("user_roles").select("user_id, role"),
      ]);
      if (pErr) throw pErr;
      if (rErr) throw rErr;
      return (profiles ?? []).map((p) => ({
        ...p,
        roles: (roles ?? []).filter((r) => r.user_id === p.id).map((r) => r.role as AppRole),
      }));
    },
  });
}

function TeamPage() {
  const { isAdmin, isLoading } = useAuth();
  const staff = useStaff();
  const campuses = useCampuses();
  const queryClient = useQueryClient();
  const [busyId, setBusyId] = useState<string | null>(null);

  if (isLoading) return null;
  if (!isAdmin) return <Navigate to="/dashboard" />;

  if (staff.isError) {
    return (
      <ErrorState message={describeDbError(staff.error as { message?: string })} onRetry={() => staff.refetch()} />
    );
  }

  const rows = staff.data ?? [];

  async function addRole(userId: string, role: AppRole) {
    setBusyId(userId);
    try {
      const { error } = await supabase.from("user_roles").insert({ user_id: userId, role });
      if (error) throw error;
      await queryClient.invalidateQueries({ queryKey: ["team-staff"] });
      toast.success("Role added.");
    } catch (err) {
      toast.error(describeDbError(err as { message?: string }));
    } finally {
      setBusyId(null);
    }
  }

  async function removeRole(userId: string, role: AppRole) {
    setBusyId(userId);
    try {
      const { error } = await supabase.from("user_roles").delete().eq("user_id", userId).eq("role", role);
      if (error) throw error;
      await queryClient.invalidateQueries({ queryKey: ["team-staff"] });
      toast.success("Role removed.");
    } catch (err) {
      toast.error(describeDbError(err as { message?: string }));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <>
      <PageHeader title="Team & roles" description="Staff and volunteers with system access." />

      {staff.isLoading ? (
        <div className="py-12 text-center text-sm text-muted-foreground">Loading…</div>
      ) : rows.length === 0 ? (
        <EmptyState title="No team members yet" />
      ) : (
        <div className="divide-y divide-border rounded-md border border-border bg-card">
          {rows.map((s) => {
            const campusName = (campuses.data ?? []).find((c) => c.id === s.campus_id)?.name;
            return (
              <div key={s.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm">
                <div>
                  <p className="font-medium text-foreground">{s.full_name || "Unnamed"}</p>
                  <p className="text-xs text-muted-foreground">
                    {s.phone || "No phone"}
                    {campusName ? ` · ${campusName}` : ""}
                  </p>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {s.roles.length === 0 ? (
                      <span className="text-xs text-muted-foreground">No role assigned</span>
                    ) : (
                      s.roles.map((r) => (
                        <span
                          key={r}
                          className="flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs text-foreground"
                        >
                          {roleLabel(r)}
                          <button
                            onClick={() => removeRole(s.id, r)}
                            disabled={busyId === s.id}
                            className="text-muted-foreground hover:text-destructive"
                            aria-label={`Remove ${roleLabel(r)}`}
                          >
                            ×
                          </button>
                        </span>
                      ))
                    )}
                  </div>
                </div>
                <NativeSelect
                  disabled={busyId === s.id}
                  value=""
                  onChange={(e) => {
                    if (e.target.value) addRole(s.id, e.target.value as AppRole);
                  }}
                  className="w-44"
                >
                  <option value="">Add role…</option>
                  {ROLES.filter((r) => !s.roles.includes(r.value)).map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </NativeSelect>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
