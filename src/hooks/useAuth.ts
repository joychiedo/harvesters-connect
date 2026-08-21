import { useQuery } from "@tanstack/react-query";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import type { AppRole } from "@/lib/constants";

export type CurrentUser = {
  user: User;
  session: Session | null;
  profile: {
    id: string;
    full_name: string;
    phone: string | null;
    campus_id: string | null;
  } | null;
  campusName: string | null;
  roles: AppRole[];
};

async function loadCurrentUser(): Promise<CurrentUser | null> {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) return null;
  const user = userData.user;

  const [{ data: session }, profileRes, rolesRes] = await Promise.all([
    supabase.auth.getSession(),
    supabase.from("profiles").select("id, full_name, phone, campus_id").eq("id", user.id).maybeSingle(),
    supabase.from("user_roles").select("role").eq("user_id", user.id),
  ]);

  let campusName: string | null = null;
  if (profileRes.data?.campus_id) {
    const { data: campus } = await supabase
      .from("campuses")
      .select("name")
      .eq("id", profileRes.data.campus_id)
      .maybeSingle();
    campusName = campus?.name ?? null;
  }

  return {
    user,
    session: session.session ?? null,
    profile: profileRes.data ?? null,
    campusName,
    roles: (rolesRes.data ?? []).map((r) => r.role as AppRole),
  };
}

export function useAuth() {
  const query = useQuery({
    queryKey: ["current-user"],
    queryFn: loadCurrentUser,
    staleTime: 60_000,
  });

  const roles = query.data?.roles ?? [];
  const has = (...r: AppRole[]) => r.some((x) => roles.includes(x));

  return {
    ...query,
    currentUser: query.data ?? null,
    roles,
    isAdmin: has("administrator"),
    canViewAll: has("administrator", "zonal_leader", "followup_leader"),
    canAssign: has("administrator", "zonal_leader", "followup_leader"),
    displayName:
      query.data?.profile?.full_name?.trim() || query.data?.user.email?.split("@")[0] || "User",
  };
}
