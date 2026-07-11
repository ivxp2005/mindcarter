import { createFileRoute } from "@tanstack/react-router";
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  Area,
  AreaChart,
  Pie,
  PieChart,
  Cell,
} from "recharts";
import { CalendarCheck2, TrendingUp, Users2 } from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "../../components/ui/chart";
import { ScrollReveal, StaggerContainer, StaggerItem } from "../../components/scroll-reveal";
import { PATIENT_GROWTH, SESSION_TYPE_BREAKDOWN, WEEKLY_SESSIONS } from "../../lib/psychologist";

export const Route = createFileRoute("/psychologist/analytics")({
  component: AnalyticsPage,
});

const TYPE_PALETTE = ["var(--brand)", "#64748b", "#14b8a6", "#6366f1", "#f43f5e"];

function slug(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

const weeklyConfig: ChartConfig = {
  sessions: { label: "Sessions", color: "var(--brand)" },
};

const growthConfig: ChartConfig = {
  patients: { label: "Patients", color: "var(--brand)" },
};

const typeData = SESSION_TYPE_BREAKDOWN.map((s) => ({ ...s, key: slug(s.type) }));
const typeConfig: ChartConfig = Object.fromEntries(
  typeData.map((s, i) => [s.key, { label: s.type, color: TYPE_PALETTE[i % TYPE_PALETTE.length] }]),
);

function AnalyticsPage() {
  const avgSessions = Math.round(
    WEEKLY_SESSIONS.reduce((sum, w) => sum + w.sessions, 0) / WEEKLY_SESSIONS.length,
  );

  const kpis = [
    { icon: CalendarCheck2, value: String(avgSessions), label: "Avg sessions / week" },
    { icon: TrendingUp, value: "94%", label: "Completion rate" },
    { icon: Users2, value: "88%", label: "Patient retention" },
  ];

  return (
    <div className="space-y-4">
      <div>
        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-brand" />
          Insights
        </p>
        <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Analytics</h1>
      </div>

      <ScrollReveal>
        <div className="grid gap-4 sm:grid-cols-3">
          {kpis.map((k) => (
            <div key={k.label} className="rounded-2xl border border-border bg-background p-6">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand text-brand-foreground">
                <k.icon className="h-4 w-4" />
              </span>
              <p className="mt-6 text-3xl font-black tracking-tight">{k.value}</p>
              <p className="mt-1 text-sm text-muted-foreground">{k.label}</p>
            </div>
          ))}
        </div>
      </ScrollReveal>

      <StaggerContainer className="grid gap-4 lg:grid-cols-2" staggerDelay={0.1}>
        <StaggerItem>
          <section className="rounded-2xl border border-border bg-background p-6">
            <h2 className="text-lg font-semibold">Sessions per week</h2>
            <p className="text-sm text-muted-foreground">Last 8 weeks</p>
            <ChartContainer config={weeklyConfig} className="mt-4 aspect-auto h-64 w-full">
              <BarChart data={WEEKLY_SESSIONS}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="week" tickLine={false} axisLine={false} tickMargin={8} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="sessions" fill="var(--color-sessions)" radius={4} />
              </BarChart>
            </ChartContainer>
          </section>
        </StaggerItem>

        <StaggerItem>
          <section className="rounded-2xl border border-border bg-background p-6">
            <h2 className="text-lg font-semibold">Session type breakdown</h2>
            <p className="text-sm text-muted-foreground">Share of sessions by type</p>
            <ChartContainer config={typeConfig} className="mt-4 aspect-auto h-64 w-full">
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent nameKey="key" />} />
                <Pie
                  data={typeData}
                  dataKey="value"
                  nameKey="key"
                  innerRadius={55}
                  outerRadius={85}
                  strokeWidth={2}
                >
                  {typeData.map((entry) => (
                    <Cell key={entry.key} fill={`var(--color-${entry.key})`} />
                  ))}
                </Pie>
                <ChartLegend content={<ChartLegendContent nameKey="key" />} />
              </PieChart>
            </ChartContainer>
          </section>
        </StaggerItem>
      </StaggerContainer>

      <ScrollReveal>
        <section className="rounded-2xl border border-border bg-background p-6">
          <h2 className="text-lg font-semibold">Patient growth</h2>
          <p className="text-sm text-muted-foreground">Active patients over the last 9 months</p>
          <ChartContainer config={growthConfig} className="mt-4 aspect-auto h-64 w-full">
            <AreaChart data={PATIENT_GROWTH}>
              <defs>
                <linearGradient id="patientsFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-patients)" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="var(--color-patients)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area
                dataKey="patients"
                type="monotone"
                stroke="var(--color-patients)"
                fill="url(#patientsFill)"
                strokeWidth={2}
              />
            </AreaChart>
          </ChartContainer>
        </section>
      </ScrollReveal>
    </div>
  );
}
