import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
} from "recharts";
import type { BreakdownItem, ChartData } from "@/features/reports/types/report.types";

const COLORS = ["#2563EB", "#14B8A6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#6366F1"];

export function BreakdownBarChart({ title, data }: { title: string; data: BreakdownItem[] }) {
  return (
    <Card>
      <CardHeader><CardTitle>{title}</CardTitle></CardHeader>
      <CardContent className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="label" tick={{ fontSize: 12 }} />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="value" fill="#2563EB" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function BreakdownPieChart({ title, data }: { title: string; data: BreakdownItem[] }) {
  return (
    <Card>
      <CardHeader><CardTitle>{title}</CardTitle></CardHeader>
      <CardContent className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="label" cx="50%" cy="50%" outerRadius={90} label>
              {data.map((_, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function TrendLineChart({ title, chart }: { title: string; chart: ChartData }) {
  const data = chart.labels.map((label, index) => {
    const point: Record<string, string | number> = { label };
    chart.datasets.forEach((dataset) => {
      point[dataset.label] = dataset.data[index] ?? 0;
    });
    return point;
  });

  return (
    <Card>
      <CardHeader><CardTitle>{title}</CardTitle></CardHeader>
      <CardContent className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="label" tick={{ fontSize: 11 }} />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Legend />
            {chart.datasets.map((dataset, index) => (
              <Line key={dataset.label} type="monotone" dataKey={dataset.label} stroke={COLORS[index % COLORS.length]} strokeWidth={2} dot={false} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function ReportDataTable({ title, rows }: { title: string; rows: Array<Record<string, string | number | null>> }) {
  if (rows.length === 0) {
    return <Card><CardContent className="py-8 text-center text-muted-foreground">No records for selected filters.</CardContent></Card>;
  }

  const columns = Object.keys(rows[0]!);

  return (
    <Card>
      <CardHeader><CardTitle>{title}</CardTitle></CardHeader>
      <CardContent className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left">
              {columns.map((column) => <th key={column} className="px-3 py-2 font-medium capitalize">{column.replaceAll("_", " ")}</th>)}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={index} className="border-b">
                {columns.map((column) => <td key={column} className="px-3 py-2">{row[column] ?? "—"}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
