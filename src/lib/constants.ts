export const ORG_NAME = "Harvesters International Christian Centre";
export const APP_NAME = "Harvesters Outreach";

export const GENDERS = ["Male", "Female"] as const;

export const AGE_GROUPS = ["Child (0-12)", "Teen (13-19)", "20-29", "30-39", "40-59", "60+"] as const;

export const CONTACT_METHODS = ["Phone call", "WhatsApp", "SMS", "Visit", "No contact"] as const;

export const MINISTRY_INTERESTS = [
  "Ushering",
  "Choir / Music",
  "Media",
  "Children",
  "Evangelism",
  "Hospitality",
  "Prayer",
  "Other",
] as const;

export type FollowUpStatus =
  | "new"
  | "contacted"
  | "follow_up_scheduled"
  | "connected"
  | "unable_to_reach"
  | "not_interested"
  | "completed";

export const FOLLOW_UP_STATUSES: { value: FollowUpStatus; label: string }[] = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "follow_up_scheduled", label: "Follow-up scheduled" },
  { value: "connected", label: "Connected" },
  { value: "unable_to_reach", label: "Unable to reach" },
  { value: "not_interested", label: "Not interested" },
  { value: "completed", label: "Completed" },
];

export const statusLabel = (value: string | null | undefined) =>
  FOLLOW_UP_STATUSES.find((s) => s.value === value)?.label ?? "—";

export type AppRole =
  | "administrator"
  | "zonal_leader"
  | "cell_leader"
  | "followup_leader"
  | "volunteer";

export const ROLES: { value: AppRole; label: string }[] = [
  { value: "administrator", label: "Administrator" },
  { value: "zonal_leader", label: "Zonal Leader" },
  { value: "cell_leader", label: "Cell Leader" },
  { value: "followup_leader", label: "Follow-up Leader" },
  { value: "volunteer", label: "Volunteer" },
];

export const roleLabel = (value: string) => ROLES.find((r) => r.value === value)?.label ?? value;

export const UNASSIGNED = "__none__";

export function describeDbError(
  error: { message?: string | undefined; code?: string | undefined } | null | undefined,
): string {
  if (!error) return "Something went wrong. Please try again.";
  const msg = error.message ?? "";
  if (error.code === "42501" || /row-level security|permission denied/i.test(msg))
    return "Permission denied. Your role does not allow this action.";
  if (error.code === "23505" || /duplicate key/i.test(msg))
    return "This record already exists in the database.";
  if (/JWT|token|session/i.test(msg))
    return "Your session has expired. Please sign in again.";
  if (/Failed to fetch|NetworkError|network/i.test(msg))
    return "Unable to reach the database. Please check your connection and try again.";
  return msg || "Something went wrong. Please try again.";
}

export function normalizePhone(phone: string): string {
  return phone.replace(/[^\d+]/g, "");
}

export function isValidNigerianPhone(phone: string): boolean {
  const p = normalizePhone(phone);
  if (!p) return true; // optional
  return /^(\+?234\d{10}|0\d{10}|\d{10})$/.test(p);
}
