import { useState, type ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import {
  LayoutDashboard,
  UserPlus,
  Users,
  PhoneCall,
  CalendarDays,
  Building2,
  BarChart3,
  Shield,
  LogOut,
  Menu,
  X,
  WifiOff,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { roleLabel } from "@/lib/constants";
import { BrandWordmark } from "@/components/Brand";
import { Button } from "@/components/ui/button";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/register", label: "Register person", icon: UserPlus },
  { to: "/people", label: "People", icon: Users },
  { to: "/follow-ups", label: "Follow-up", icon: PhoneCall },
  { to: "/events", label: "Outreach events", icon: CalendarDays },
  { to: "/campuses", label: "Campuses", icon: Building2, adminOnly: true },
  { to: "/reports", label: "Reports", icon: BarChart3 },
  { to: "/team", label: "Team & roles", icon: Shield, adminOnly: true },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const { displayName, currentUser, roles, isAdmin } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const online = useOnlineStatus();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  async function handleSignOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  const items = NAV.filter((i) => !("adminOnly" in i && i.adminOnly) || isAdmin);

  const nav = (
    <nav className="flex flex-col gap-0.5">
      {items.map((item) => {
        const active = pathname === item.to || pathname.startsWith(item.to + "/");
        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={() => setOpen(false)}
            className={`flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors ${
              active
                ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                : "text-sidebar-foreground/75 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
            }`}
          >
            <item.icon className="h-4 w-4 shrink-0" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  const userBlock = (
    <div className="border-t border-sidebar-border pt-3">
      <p className="truncate text-sm font-medium text-sidebar-foreground">{displayName}</p>
      <p className="truncate text-xs text-sidebar-foreground/60">
        {roles.map(roleLabel).join(", ") || "No role assigned"}
      </p>
      <p className="truncate text-xs text-sidebar-foreground/60">
        {currentUser?.campusName ? `${currentUser.campusName} campus` : "No campus set"}
      </p>
      <button
        onClick={handleSignOut}
        className="mt-3 flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-sidebar-foreground/75 transition-colors hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
      >
        <LogOut className="h-4 w-4" /> Sign out
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile header */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-card px-4 lg:hidden">
        <BrandWordmark className="h-6" />
        <button
          aria-label="Open menu"
          onClick={() => setOpen(true)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-border"
        >
          <Menu className="h-5 w-5" />
        </button>
      </header>

      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col justify-between bg-sidebar px-4 py-5 lg:flex">
        <div>
          <BrandWordmark variant="light" className="h-7" />
          <p className="mt-2 text-[11px] leading-tight text-sidebar-foreground/55">
            Outreach management
          </p>
          <div className="mt-6">{nav}</div>
        </div>
        {userBlock}
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-foreground/40" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 flex w-72 flex-col justify-between bg-sidebar px-4 py-5">
            <div>
              <div className="flex items-center justify-between">
                <BrandWordmark variant="light" className="h-7" />
                <button
                  aria-label="Close menu"
                  onClick={() => setOpen(false)}
                  className="text-sidebar-foreground/70"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="mt-6">{nav}</div>
            </div>
            {userBlock}
          </div>
        </div>
      )}

      <main className="lg:pl-64">
        {!online && (
          <div className="flex items-center gap-2 border-b border-warning/40 bg-warning/15 px-4 py-2 text-sm text-warning-foreground">
            <WifiOff className="h-4 w-4" /> No internet connection. Saving is paused — your typed
            details will be kept.
          </div>
        )}
        <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:py-8">{children}</div>
      </main>
    </div>
  );
}

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string | undefined;
  action?: ReactNode | undefined;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className="text-xl font-semibold text-foreground sm:text-2xl">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string | undefined;
  action?: ReactNode | undefined;
}) {
  return (
    <div className="rounded-md border border-border bg-card px-6 py-12 text-center">
      <p className="text-sm font-medium text-foreground">{title}</p>
      {description && (
        <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
      )}
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  );
}

export function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: (() => void) | undefined;
}) {
  return (
    <div className="rounded-md border border-destructive/40 bg-destructive/5 px-6 py-8 text-center">
      <p className="text-sm font-medium text-destructive">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" className="mt-4" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}
