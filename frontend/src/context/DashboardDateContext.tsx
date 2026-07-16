import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import {
  formatDateRangeLabel,
  getTodayRange,
  getMonthRange,
  getWeekRange,
  type DashboardDatePreset,
  type DashboardDateRange,
} from "@/lib/dashboard/date-range";

interface DashboardDateContextValue {
  range: DashboardDateRange;
  preset: DashboardDatePreset;
  label: string;
  setPreset: (preset: DashboardDatePreset) => void;
  setCustomRange: (range: DashboardDateRange) => void;
}

const DashboardDateContext = createContext<DashboardDateContextValue | null>(null);

export function DashboardDateProvider({ children }: { children: ReactNode }) {
  const [preset, setPresetState] = useState<DashboardDatePreset>("today");
  const [range, setRange] = useState<DashboardDateRange>(getTodayRange());

  const setPreset = (nextPreset: DashboardDatePreset) => {
    setPresetState(nextPreset);
    if (nextPreset === "today") setRange(getTodayRange());
    if (nextPreset === "week") setRange(getWeekRange());
    if (nextPreset === "month") setRange(getMonthRange());
  };

  const setCustomRange = (nextRange: DashboardDateRange) => {
    setPresetState("custom");
    setRange(nextRange);
  };

  const value = useMemo(
    () => ({
      range,
      preset,
      label: formatDateRangeLabel(range),
      setPreset,
      setCustomRange,
    }),
    [preset, range],
  );

  return <DashboardDateContext.Provider value={value}>{children}</DashboardDateContext.Provider>;
}

export function useDashboardDate() {
  const context = useContext(DashboardDateContext);
  if (!context) {
    throw new Error("useDashboardDate must be used within DashboardDateProvider");
  }
  return context;
}
