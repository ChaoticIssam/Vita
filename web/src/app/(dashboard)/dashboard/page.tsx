const metrics = [
  { label: "Focus time", value: "4h 18m", detail: "+18% from yesterday" },
  { label: "Tracked sessions", value: "12", detail: "4 completed deep work blocks" },
  { label: "Distraction rate", value: "9%", detail: "Down 3 points this week" },
  { label: "Goals on track", value: "3/4", detail: "One goal needs attention" },
];

const activity = [
  { name: "Browser research", time: "2h 12m", trend: "Most active" },
  { name: "Design work", time: "1h 44m", trend: "Strong focus" },
  { name: "Messaging", time: "48m", trend: "Needs trimming" },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <article key={metric.label} className="glass-panel rounded-[24px] p-5">
            <p className="text-sm font-medium text-slate-500">{metric.label}</p>
            <p className="mt-4 text-4xl font-semibold tracking-tight text-slate-950">{metric.value}</p>
            <p className="mt-3 text-sm text-slate-600">{metric.detail}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <article className="glass-panel rounded-[28px] p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-slate-500">Weekly pattern</p>
              <h2 className="text-2xl font-semibold tracking-tight text-slate-950">Where your time is concentrating</h2>
            </div>
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">
              Live
            </span>
          </div>

          <div className="dashboard-grid mt-6 rounded-[24px] border border-slate-200 bg-slate-950 p-5 text-white">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl bg-white/10 p-4">
                <p className="text-sm text-slate-300">Mon</p>
                <p className="mt-3 text-2xl font-semibold">78%</p>
              </div>
              <div className="rounded-2xl bg-white/10 p-4">
                <p className="text-sm text-slate-300">Wed</p>
                <p className="mt-3 text-2xl font-semibold">84%</p>
              </div>
              <div className="rounded-2xl bg-white/10 p-4">
                <p className="text-sm text-slate-300">Fri</p>
                <p className="mt-3 text-2xl font-semibold">69%</p>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
              Your best working window this week was 9:30 AM to 11:00 AM. Block that slot again tomorrow.
            </div>
          </div>
        </article>

        <article id="goals" className="glass-panel rounded-[28px] p-6">
          <p className="text-sm font-medium text-slate-500">Goals</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Current targets</h2>
          <div className="mt-6 space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between">
                <p className="font-medium text-slate-950">Limit social apps to 45m</p>
                <span className="text-sm text-emerald-600">On track</span>
              </div>
              <p className="mt-2 text-sm text-slate-600">Currently at 27 minutes for the week.</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between">
                <p className="font-medium text-slate-950">Complete 3 focused sessions</p>
                <span className="text-sm text-amber-600">Needs one more</span>
              </div>
              <p className="mt-2 text-sm text-slate-600">Two sessions completed, one pending today.</p>
            </div>
          </div>
        </article>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <article id="privacy" className="glass-panel rounded-[28px] p-6">
          <p className="text-sm font-medium text-slate-500">Privacy</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Control what gets collected</h2>
          <div className="mt-5 space-y-3 text-sm text-slate-600">
            <div className="rounded-2xl border border-slate-200 bg-white p-4">Pause tracking when you need a break.</div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4">Export your data before switching devices.</div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4">Delete raw activity history anytime.</div>
          </div>
        </article>

        <article id="settings" className="glass-panel rounded-[28px] p-6">
          <p className="text-sm font-medium text-slate-500">Recent activity</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Top app usage</h2>
          <div className="mt-6 space-y-4">
            {activity.map((item) => (
              <div key={item.name} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-4">
                <div>
                  <p className="font-medium text-slate-950">{item.name}</p>
                  <p className="text-sm text-slate-500">{item.trend}</p>
                </div>
                <p className="text-sm font-semibold text-slate-900">{item.time}</p>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}
