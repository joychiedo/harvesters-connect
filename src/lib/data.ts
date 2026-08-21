import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { FollowUpStatus } from "@/lib/constants";

export type Campus = {
  id: string;
  name: string;
  location: string | null;
  country: string;
  active: boolean;
};

export type OutreachEvent = {
  id: string;
  name: string;
  date: string;
  location: string | null;
  target_count: number;
  description: string | null;
  archived: boolean;
};

export type Person = {
  id: string;
  full_name: string;
  phone: string | null;
  alternate_phone: string | null;
  gender: string | null;
  age_group: string | null;
  location: string | null;
  campus_id: string | null;
  outreach_event_id: string | null;
  registered_by: string | null;
  registered_by_name: string | null;
  registration_date: string;
  follow_up_status: FollowUpStatus;
  assigned_leader: string | null;
  cell: string | null;
  zone: string | null;
  interested_in_church: boolean;
  wants_contact: boolean;
  accepted_christ: boolean;
  prayer_request: string | null;
  ministry_interest: string | null;
  preferred_contact_method: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type FollowUp = {
  id: string;
  person_id: string;
  assigned_to: string | null;
  status: FollowUpStatus;
  contact_date: string | null;
  contact_method: string | null;
  outcome: string | null;
  next_action: string | null;
  next_follow_up_date: string | null;
  notes: string | null;
  created_by: string | null;
  created_by_name: string | null;
  created_at: string;
};

export type TeamMember = {
  id: string;
  full_name: string;
  phone: string | null;
  campus_id: string | null;
};

function unwrap<T>({ data, error }: { data: T | null; error: unknown }): T {
  if (error) throw error;
  return data as T;
}

export function useCampuses() {
  return useQuery({
    queryKey: ["campuses"],
    queryFn: async () =>
      unwrap<Campus[]>(
        await supabase.from("campuses").select("id, name, location, country, active").order("name"),
      ),
  });
}

export function useEvents() {
  return useQuery({
    queryKey: ["events"],
    queryFn: async () =>
      unwrap<OutreachEvent[]>(
        await supabase
          .from("outreach_events")
          .select("id, name, date, location, target_count, description, archived")
          .order("date", { ascending: false }),
      ),
  });
}

export function useTeam() {
  return useQuery({
    queryKey: ["team"],
    queryFn: async () =>
      unwrap<TeamMember[]>(
        await supabase.from("profiles").select("id, full_name, phone, campus_id").order("full_name"),
      ),
  });
}

export type PeopleFilters = {
  search?: string;
  eventId?: string;
  campusId?: string;
  ageGroup?: string;
  gender?: string;
  status?: string;
  assignedTo?: string;
  fromDate?: string;
  sort?: "newest" | "oldest" | "name" | "priority";
};

export function usePeople(filters: PeopleFilters) {
  return useQuery({
    queryKey: ["people", filters],
    queryFn: async () => {
      let q = supabase.from("people").select("*");
      const search = filters.search?.trim();
      if (search) {
        const safe = search.replace(/[,%()]/g, " ").trim();
        q = q.or(`full_name.ilike.%${safe}%,phone.ilike.%${safe}%,location.ilike.%${safe}%`);
      }
      if (filters.eventId) q = q.eq("outreach_event_id", filters.eventId);
      if (filters.campusId)
        q = filters.campusId === "unassigned" ? q.is("campus_id", null) : q.eq("campus_id", filters.campusId);
      if (filters.ageGroup) q = q.eq("age_group", filters.ageGroup);
      if (filters.gender) q = q.eq("gender", filters.gender);
      if (filters.status) q = q.eq("follow_up_status", filters.status as FollowUpStatus);
      if (filters.assignedTo)
        q =
          filters.assignedTo === "unassigned"
            ? q.is("assigned_leader", null)
            : q.eq("assigned_leader", filters.assignedTo);
      if (filters.fromDate) q = q.gte("registration_date", filters.fromDate);

      if (filters.sort === "oldest") q = q.order("registration_date", { ascending: true });
      else if (filters.sort === "name") q = q.order("full_name", { ascending: true });
      else if (filters.sort === "priority")
        q = q.order("follow_up_status", { ascending: true }).order("registration_date", { ascending: true });
      else q = q.order("registration_date", { ascending: false });

      return unwrap<Person[]>(await q.limit(1000));
    },
  });
}

export function usePerson(id: string) {
  return useQuery({
    queryKey: ["person", id],
    queryFn: async () =>
      unwrap<Person>(await supabase.from("people").select("*").eq("id", id).single()),
  });
}

export function useFollowUps(personId?: string) {
  return useQuery({
    queryKey: ["follow-ups", personId ?? "all"],
    queryFn: async () => {
      let q = supabase.from("follow_ups").select("*").order("created_at", { ascending: false });
      if (personId) q = q.eq("person_id", personId);
      return unwrap<FollowUp[]>(await q.limit(1000));
    },
  });
}

/** Live updates: invalidate people/follow-up caches on any remote change. */
export function useRealtimeSync() {
  const queryClient = useQueryClient();
  useEffect(() => {
    const channel = supabase
      .channel("outreach-sync")
      .on("postgres_changes", { event: "*", schema: "public", table: "people" }, () => {
        queryClient.invalidateQueries({ queryKey: ["people"] });
        queryClient.invalidateQueries({ queryKey: ["person"] });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "follow_ups" }, () => {
        queryClient.invalidateQueries({ queryKey: ["follow-ups"] });
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
}
