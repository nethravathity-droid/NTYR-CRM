import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

interface ShellContextValue {
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;
  commandOpen: boolean;
  setCommandOpen: (open: boolean) => void;
  searchOpen: boolean;
  setSearchOpen: (open: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const ShellContext = createContext<ShellContextValue | null>(null);

export function ShellProvider({ children }: { children: ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const value = useMemo<ShellContextValue>(
    () => ({
      sidebarCollapsed,
      setSidebarCollapsed,
      toggleSidebar: () => setSidebarCollapsed((prev) => !prev),
      commandOpen,
      setCommandOpen,
      searchOpen,
      setSearchOpen,
      searchQuery,
      setSearchQuery,
    }),
    [sidebarCollapsed, commandOpen, searchOpen, searchQuery],
  );

  return <ShellContext.Provider value={value}>{children}</ShellContext.Provider>;
}

export function useShell() {
  const context = useContext(ShellContext);
  if (!context) {
    throw new Error("useShell must be used within ShellProvider");
  }
  return context;
}
