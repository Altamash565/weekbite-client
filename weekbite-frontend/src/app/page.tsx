import {
  ArrowRight,
  Bell,
  CalendarDays,
  ChefHat,
  Clock3,
  Leaf,
  Sparkles,
  TrendingUp,
  UtensilsCrossed,
} from "lucide-react";

const stats = [
  { label: "Meals planned", value: "24", detail: "+6 this week" },
  { label: "Prep time saved", value: "7h", detail: "Average saved" },
  { label: "Budget kept", value: "$142", detail: "Under target" },
  { label: "Healthy streak", value: "9 days", detail: "Consistency" },
];

const planItems = [
  { day: "Mon", meal: "Mediterranean bowl", time: "6:30 PM", tag: "Fresh" },
  { day: "Tue", meal: "Sheet pan salmon", time: "7:00 PM", tag: "Quick" },
  { day: "Wed", meal: "Miso veggie noodles", time: "6:45 PM", tag: "Cozy" },
];

const pantryItems = [
  { item: "Avocados", note: "2 ready for lunches" },
  { item: "Quinoa", note: "Packed for dinner bowls" },
  { item: "Spinach", note: "Use in tonight's stir-fry" },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(251,191,36,0.16),transparent_30%),linear-gradient(135deg,#fffaf2_0%,#f8fafc_55%,#fef3c7_100%)] px-4 py-6 text-slate-900 sm:px-6 lg:px-8 dark:bg-[radial-gradient(circle_at_top_left,rgba(245,158,11,0.16),transparent_30%),linear-gradient(135deg,#020617_0%,#111827_55%,#1f2937_100%)] dark:text-slate-50">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="flex flex-wrap items-center justify-between rounded-[28px] border border-white/70 bg-white/70 px-5 py-4 shadow-[0_20px_60px_-24px_rgba(15,23,42,0.35)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/70">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-linear-to-br from-amber-400 via-orange-500 to-rose-500 text-white shadow-lg shadow-orange-200 dark:shadow-orange-950/40">
              <ChefHat className="size-5" />
            </div>
            <div>
              <p className="text-lg font-semibold">WeekBite</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Your calm weekly meal compass</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700">
              <Bell className="size-4" />
              Updates
            </button>
            <button className="flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200">
              <Sparkles className="size-4" />
              New plan
            </button>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[1.5fr_0.9fr]">
          <div className="rounded-[32px] border border-white/70 bg-white/80 p-6 shadow-[0_30px_80px_-30px_rgba(15,23,42,0.3)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/70 sm:p-8">
            <div className="flex items-center gap-2 text-sm font-medium text-amber-600 dark:text-amber-400">
              <Sparkles className="size-4" />
              Weekly overview
            </div>
            <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-xl">
                <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                  A beautiful dashboard for planning your week with less friction.
                </h1>
                <p className="mt-3 text-base leading-7 text-slate-600 dark:text-slate-300">
                  Organize meals, track progress, and stay on top of groceries in a space designed to feel calm, helpful, and inspiring.
                </p>
              </div>
              <div className="rounded-3xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/40 dark:text-amber-100">
                <p className="font-semibold">Tonight’s focus</p>
                <p className="mt-1">Balanced dinner • 28 min • 4 servings</p>
              </div>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {stats.map((item) => (
                <div key={item.label} className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-800/70">
                  <p className="text-sm text-slate-500 dark:text-slate-400">{item.label}</p>
                  <p className="mt-2 text-2xl font-semibold">{item.value}</p>
                  <p className="mt-1 text-sm text-emerald-600 dark:text-emerald-400">{item.detail}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[32px] border border-white/70 bg-slate-950 p-6 text-white shadow-[0_30px_80px_-30px_rgba(15,23,42,0.8)] dark:border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Today</p>
                <p className="mt-1 text-2xl font-semibold">Thursday</p>
              </div>
              <div className="rounded-2xl bg-white/10 p-3">
                <CalendarDays className="size-5" />
              </div>
            </div>

            <div className="mt-6 rounded-3xl bg-white/10 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Next meal</p>
                  <p className="mt-1 text-xl font-semibold">Lemon herb chicken</p>
                </div>
                <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-sm text-emerald-300">On track</span>
              </div>
              <div className="mt-4 flex items-center gap-2 text-sm text-slate-300">
                <Clock3 className="size-4" />
                25 min prep • 4 portions
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <div className="flex items-center justify-between rounded-2xl bg-white/10 px-4 py-3">
                <span className="text-sm text-slate-300">Protein goal</span>
                <span className="font-semibold">82%</span>
              </div>
              <div className="h-2 rounded-full bg-white/10">
                <div className="h-2 w-[82%] rounded-full bg-linear-to-r from-amber-400 to-emerald-400" />
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
          <div className="rounded-[32px] border border-white/70 bg-white/80 p-6 shadow-[0_30px_80px_-30px_rgba(15,23,42,0.25)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/70">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">This week</p>
                <h2 className="text-xl font-semibold">Meal plan at a glance</h2>
              </div>
              <button className="flex items-center gap-2 text-sm font-medium text-amber-600 dark:text-amber-400">
                View full planner
                <ArrowRight className="size-4" />
              </button>
            </div>

            <div className="mt-6 space-y-3">
              {planItems.map((item) => (
                <div key={item.day} className="flex flex-wrap items-center justify-between rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 dark:border-slate-800 dark:bg-slate-800/70">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-2xl bg-linear-to-r from-orange-100 to-amber-100 text-sm font-semibold text-orange-700 dark:from-orange-500/20 dark:to-amber-500/20 dark:text-amber-300">
                      {item.day}
                    </div>
                    <div>
                      <p className="font-medium">{item.meal}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{item.time}</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300">
                    {item.tag}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[32px] border border-white/70 bg-white/80 p-6 shadow-[0_30px_80px_-30px_rgba(15,23,42,0.25)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/70">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                <Leaf className="size-4" />
                Pantry pulse
              </div>
              <div className="mt-4 space-y-3">
                {pantryItems.map((item) => (
                  <div key={item.item} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-800/70">
                    <p className="font-medium">{item.item}</p>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{item.note}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[32px] border border-white/70 bg-linear-to-br from-orange-500 to-amber-400 p-6 text-white shadow-[0_30px_80px_-30px_rgba(249,115,22,0.45)]">
              <div className="flex items-center gap-2">
                <TrendingUp className="size-4" />
                Smart insights
              </div>
              <p className="mt-3 text-xl font-semibold">Your most efficient night is Wednesday — perfect for batch cooking.</p>
              <div className="mt-4 flex items-center gap-2 text-sm text-orange-50">
                <UtensilsCrossed className="size-4" />
                3 recipes matched to your routine
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
