import { useEffect, useMemo } from "react";
import {
  Bell,
  CalendarDays,
  ChevronDown,
  Command,
  LogOut,
  MessageSquare,
  Plus,
  Search,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useRecentActivities } from "@/features/dashboard/hooks/useDashboard";
import { useOverdueFollowups, useTodayFollowups } from "@/features/followups/hooks/useFollowups";
import { usePermissions } from "@/hooks/usePermissions";
import { useShell } from "@/context/ShellContext";
import { paths } from "@/routes/paths";
import { CommandPalette } from "@/components/premium/CommandPalette";
import { MegaSearch } from "@/components/premium/MegaSearch";

function formatHeaderDate() {
  return new Date().toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function PremiumHeader() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { setCommandOpen, setSearchOpen } = useShell();
  const { hasPermission } = usePermissions();
  const canViewFollowups = hasPermission("leads.view");

  const { data: activities = [] } = useRecentActivities(8);
  const { data: todayFollowups = [] } = useTodayFollowups({ enabled: canViewFollowups });
  const { data: overdueFollowups = [] } = useOverdueFollowups({ enabled: canViewFollowups });

  const notificationCount = useMemo(
    () => (canViewFollowups ? todayFollowups.length + overdueFollowups.length : 0) + Math.min(activities.length, 3),
    [activities.length, canViewFollowups, overdueFollowups.length, todayFollowups.length],
  );

  const displayName =
    user?.user.displayName ??
    `${user?.user.firstName ?? ""} ${user?.user.lastName ?? ""}`.trim();

  const initials = displayName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setCommandOpen(true);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [setCommandOpen]);

  const handleLogout = async () => {
    await logout();
    navigate(paths.login, { replace: true });
  };

  const quickAddItems = [
    hasPermission("leads.create") ? { label: "Add Lead", href: paths.leads.create } : null,
    hasPermission("visits.create") ? { label: "Schedule Visit", href: paths.visits.create } : null,
    hasPermission("bookings.create") ? { label: "Create Booking", href: paths.bookings.create } : null,
    hasPermission("payments.create") ? { label: "Receive Payment", href: paths.payments.create } : null,
    hasPermission("calls.create") ? { label: "Log Call", href: paths.calls.create } : null,
    hasPermission("users.create") ? { label: "Add Employee", href: paths.employees.create } : null,
  ].filter(Boolean) as Array<{ label: string; href: string }>;

  return (
    <>
      <header className="premium-header z-20 flex h-16 shrink-0 items-center gap-3 px-4 md:px-6">
        <div className="hidden min-w-0 lg:block">
          <p className="truncate text-sm font-semibold">{user?.company.name}</p>
          <p className="text-xs text-muted-foreground">{formatHeaderDate()}</p>
        </div>

        <button
          type="button"
          onClick={() => setSearchOpen(true)}
          className="hidden max-w-md flex-1 items-center gap-3 rounded-[18px] border border-[#E2E8F0] bg-white px-4 py-2.5 text-left text-sm text-muted-foreground shadow-sm transition hover:border-[#2563EB]/30 md:flex dark:bg-card"
        >
          <Search className="h-4 w-4" />
          <span>Search leads, bookings, employees...</span>
          <span className="ml-auto rounded-md border px-2 py-0.5 text-xs">Ctrl K</span>
        </button>

        <div className="ml-auto flex items-center gap-1.5 md:gap-2">
          {quickAddItems.length > 0 ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" className="rounded-[14px] bg-[#2563EB] hover:bg-[#2563EB]/90">
                  <Plus className="mr-1.5 h-4 w-4" />
                  Quick Add
                  <ChevronDown className="ml-1 h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {quickAddItems.map((item) => (
                  <DropdownMenuItem key={item.label} onClick={() => navigate(item.href)}>
                    {item.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}

          <Button variant="outline" size="icon" className="rounded-[14px]" asChild>
            <Link to={paths.followups.calendar} aria-label="Calendar">
              <CalendarDays className="h-4 w-4" />
            </Link>
          </Button>

          <Button variant="outline" size="icon" className="rounded-[14px]" asChild>
            <Link to={paths.calls.list} aria-label="Messages">
              <MessageSquare className="h-4 w-4" />
            </Link>
          </Button>

          <Button variant="outline" size="sm" className="hidden rounded-[14px] sm:inline-flex" onClick={() => setCommandOpen(true)}>
            <Command className="mr-2 h-4 w-4" />
            Command
          </Button>

          <ThemeToggle />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="relative rounded-[14px]">
                <Bell className="h-4 w-4" />
                {notificationCount > 0 ? (
                  <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#EF4444] px-1 text-[10px] text-white">
                    {notificationCount > 9 ? "9+" : notificationCount}
                  </span>
                ) : null}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 rounded-[18px]">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {canViewFollowups && overdueFollowups.length > 0 ? (
                <DropdownMenuItem onClick={() => navigate(paths.followups.list)}>
                  {overdueFollowups.length} overdue follow-ups
                </DropdownMenuItem>
              ) : null}
              {canViewFollowups && todayFollowups.length > 0 ? (
                <DropdownMenuItem onClick={() => navigate(paths.followups.today)}>
                  {todayFollowups.length} follow-ups due today
                </DropdownMenuItem>
              ) : null}
              {activities.slice(0, 4).map((activity) => (
                <DropdownMenuItem key={activity.id} className="whitespace-normal">
                  <div>
                    <p className="font-medium">{activity.title}</p>
                    <p className="text-xs text-muted-foreground">{activity.description}</p>
                  </div>
                </DropdownMenuItem>
              ))}
              {notificationCount === 0 ? (
                <DropdownMenuItem disabled>No new notifications</DropdownMenuItem>
              ) : null}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10 ring-2 ring-[#2563EB]/15">
                  <AvatarImage src={user?.user.profilePhotoUrl ?? undefined} alt={displayName} />
                  <AvatarFallback>{initials || "U"}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-[18px]">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{displayName}</p>
                  <p className="text-xs text-muted-foreground">{user?.role.name}</p>
                  <p className="text-xs text-muted-foreground">{user?.company.name}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate(paths.settings)}>
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => void handleLogout()}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <CommandPalette />
      <MegaSearch />
    </>
  );
}
