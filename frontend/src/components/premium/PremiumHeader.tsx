import { useEffect, useMemo, useState } from "react";
import {
  Bell,
  Building2,
  ChevronDown,
  Command,
  LogOut,
  MessageSquare,
  Plus,
  Search,
  Settings,
  UserRound,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { usePermissions } from "@/hooks/usePermissions";
import { useNotifications, type AppNotification } from "@/hooks/useNotifications";
import { useShell } from "@/context/ShellContext";
import { paths } from "@/routes/paths";
import { Input } from "@/components/ui/input";
import { MegaSearch } from "@/components/premium/MegaSearch";
import { CommandPalette } from "@/components/premium/CommandPalette";
import { DashboardDateRangePicker } from "@/components/premium/DashboardDateRangePicker";
import { isWhatsAppConfigured, openWhatsAppConversation } from "@/lib/whatsapp";
import { getQuickAddItemsForRole } from "@/lib/rbac/quick-add";
import { ROLE_CODES } from "@/lib/rbac/roles";

function formatHeaderDate() {
  return new Date().toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
      <path d="M12 2C6.486 2 2 6.486 2 12c0 1.846.504 3.573 1.378 5.066L2 22l5.067-1.377A9.956 9.956 0 0012 22c5.514 0 10-4.486 10-10S17.514 2 12 2zm0 18.154a8.13 8.13 0 01-4.127-1.127l-.295-.175-3.005.814.802-2.928-.193-.302A8.13 8.13 0 014.846 12c0-4.487 3.667-8.154 8.154-8.154S21.154 7.513 21.154 12 16.487 20.154 12 20.154z" />
    </svg>
  );
}

function NotificationMenuItem({
  notification,
  unread,
  onSelect,
  onMarkRead,
}: {
  notification: AppNotification;
  unread: boolean;
  onSelect: () => void;
  onMarkRead: () => void;
}) {
  return (
    <DropdownMenuItem onClick={onSelect} className="whitespace-normal">
      <div className="w-full">
        <div className="flex items-center justify-between gap-2">
          <p className="font-medium">{notification.title}</p>
          {unread ? <span className="h-2 w-2 rounded-full bg-[#2563EB]" /> : null}
        </div>
        <p className="text-xs text-muted-foreground">{notification.description}</p>
        {!unread ? null : (
          <button
            type="button"
            className="mt-1 text-xs text-[#2563EB] hover:underline"
            onClick={(event) => {
              event.stopPropagation();
              onMarkRead();
            }}
          >
            Mark as read
          </button>
        )}
      </div>
    </DropdownMenuItem>
  );
}

export function PremiumHeader() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { setCommandOpen, setSearchOpen, searchQuery, setSearchQuery } = useShell();
  const { hasPermission } = usePermissions();
  const { notifications, unreadCount, markAsRead, markAllAsRead, isRead } = useNotifications();
  const [whatsappDialogOpen, setWhatsappDialogOpen] = useState(false);

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

  const quickAddItems = useMemo(
    () => getQuickAddItemsForRole(user?.role.code, hasPermission),
    [hasPermission, user?.role.code],
  );

  const showDashboardDatePicker = user?.role.code !== ROLE_CODES.PLATFORM_SUPER_ADMIN;

  const handleWhatsAppClick = () => {
    if (isWhatsAppConfigured() && user?.user.mobile) {
      openWhatsAppConversation(user.user.mobile);
      return;
    }
    setWhatsappDialogOpen(true);
  };

  return (
    <>
      <header className="premium-header z-20 flex h-16 shrink-0 items-center gap-3 px-4 md:px-6">
        <div className="hidden min-w-0 lg:block">
          <p className="truncate text-sm font-semibold">{user?.company.name}</p>
          <p className="text-xs text-muted-foreground">{formatHeaderDate()}</p>
        </div>

        <div className="relative hidden max-w-md flex-1 md:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(event) => {
              setSearchQuery(event.target.value);
              setSearchOpen(true);
            }}
            onFocus={() => setSearchOpen(true)}
            placeholder="Search leads, customers, bookings, properties..."
            className="rounded-[18px] border-[#E2E8F0] bg-white pl-9 shadow-sm dark:bg-card"
          />
        </div>

        <Button
          variant="outline"
          size="icon"
          className="rounded-[14px] md:hidden"
          onClick={() => setSearchOpen(true)}
          aria-label="Search"
        >
          <Search className="h-4 w-4" />
        </Button>

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
              <DropdownMenuContent align="end" className="rounded-[18px]">
                {quickAddItems.map((item) => (
                  <DropdownMenuItem key={item.label} onClick={() => navigate(item.href)}>
                    {item.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}

          {showDashboardDatePicker ? <DashboardDateRangePicker /> : null}

          <Button
            variant="outline"
            size="icon"
            className="rounded-[14px] text-[#25D366]"
            onClick={handleWhatsAppClick}
            aria-label="WhatsApp"
          >
            <WhatsAppIcon className="h-4 w-4" />
          </Button>

          <Button variant="outline" size="icon" className="rounded-[14px]" onClick={() => navigate(paths.messages.list)} aria-label="Messages">
            <MessageSquare className="h-4 w-4" />
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
                {unreadCount > 0 ? (
                  <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#EF4444] px-1 text-[10px] text-white">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                ) : null}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="max-h-96 w-80 overflow-y-auto rounded-[18px]">
              <DropdownMenuLabel className="flex items-center justify-between gap-2">
                Notifications
                {unreadCount > 0 ? (
                  <button type="button" className="text-xs font-normal text-[#2563EB] hover:underline" onClick={markAllAsRead}>
                    Mark all read
                  </button>
                ) : null}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {notifications.length === 0 ? (
                <DropdownMenuItem disabled>No notifications</DropdownMenuItem>
              ) : (
                notifications.slice(0, 10).map((notification) => (
                  <NotificationMenuItem
                    key={notification.id}
                    notification={notification}
                    unread={!isRead(notification.id)}
                    onSelect={() => {
                      markAsRead(notification.id);
                      navigate(notification.href);
                    }}
                    onMarkRead={() => markAsRead(notification.id)}
                  />
                ))
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate(paths.notifications.list)}>
                View all notifications
              </DropdownMenuItem>
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
              <DropdownMenuItem onClick={() => navigate(`${paths.settings}?tab=profile`)}>
                <UserRound className="mr-2 h-4 w-4" />
                My Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate(`${paths.settings}?tab=company`)}>
                <Building2 className="mr-2 h-4 w-4" />
                Company
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate(paths.settings)}>
                <Settings className="mr-2 h-4 w-4" />
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

      <Dialog open={whatsappDialogOpen} onOpenChange={setWhatsappDialogOpen}>
        <DialogContent className="rounded-[18px] sm:max-w-md">
          <DialogHeader>
            <DialogTitle>WhatsApp Not Configured</DialogTitle>
            <DialogDescription>WhatsApp integration not configured.</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      <CommandPalette />
      <MegaSearch />
    </>
  );
}

