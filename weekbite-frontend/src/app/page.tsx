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
];

const planItems = [
  { day: "Mon", meal: "Mediterranean bowl", time: "6:30 PM", tag: "Fresh" },
  { day: "Tue", meal: "Sheet pan salmon", time: "7:00 PM", tag: "Quick" },
  { day: "Wed", meal: "Miso veggie noodles", time: "6:45 PM", tone: "Cozy" },
];

const pantryItems = [
  { item: "Avocados", note: "2 ready for lunches" },
  { item: "Quinoa", note: "Packed for dinner bowls" },
  { item: "Spinach", note: "Use in tonight's stir-fry" },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground transition-colors duration-300 font-sans">
      <div className="mx-auto flex max-w-7xl flex-col gap-12 px-6 py-10 sm:px-8 lg:px-12">
        
        {/* Editorial Header */}
        <header className="flex items-center justify-between border-b border-stone-200/60 pb-8 dark:border-stone-800">
          <div className="flex items-center gap-3.5">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <ChefHat className="size-4.5" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-foreground font-sans">WeekBite</h1>
              <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium">Calm Weekly Meal Compass</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="flex size-9 items-center justify-center rounded-lg border border-stone-200 bg-card text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground dark:border-stone-800">
              <Bell className="size-4" />
            </button>
            <button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground tracking-wide transition-colors hover:opacity-90">
              <Sparkles className="size-3.5" />
              New plan
            </button>
          </div>
        </header>

        {/* Magazine-style Hero Opener */}
        <section className="grid gap-8 lg:grid-cols-2 lg:items-start border-b border-stone-200/60 pb-12 dark:border-stone-800">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded bg-accent px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-accent-foreground">
              <Sparkles className="size-2.5" />
              Weekly Compass
            </div>
            <h2 className="mt-4 text-5xl font-light italic leading-tight text-foreground font-serif sm:text-6xl lg:text-7xl">
              A lighter week begins in the kitchen.
            </h2>
          </div>
          <div className="flex flex-col gap-6 lg:mt-8">
            <p className="text-base leading-relaxed text-muted-foreground font-light max-w-xl">
              Organize your meals, priority grocery lists, and daily rhythms in a quiet, distraction-free environment. Designed to help you cook with ease, minimize food waste, and keep to your budget.
            </p>
            <div className="flex items-center gap-4 rounded-lg bg-card border border-stone-200/60 p-4 max-w-md dark:border-stone-800">
              <div className="flex size-8 shrink-0 items-center justify-center rounded bg-primary/10 text-primary">
                <ChefHat className="size-4" />
              </div>
              <div className="text-xs">
                <p className="font-semibold text-foreground uppercase tracking-wider">Tonight&apos;s focus</p>
                <p className="mt-0.5 text-muted-foreground">Mediterranean Bowl • 28 min prep • 4 portions</p>
              </div>
            </div>
          </div>
        </section>

        {/* Asymmetric Content Grid */}
        <div className="grid gap-12 lg:grid-cols-3">
          
          {/* Main Content Areas */}
          <div className="lg:col-span-2 space-y-12">
            
            {/* Table of Contents style Index Stats */}
            <div className="space-y-6">
              <h3 className="text-xs font-bold uppercase tracking-widest text-primary">Overview & Indicators</h3>
              <div className="divide-y divide-stone-200/60 border-t border-b border-stone-200/60 dark:divide-stone-800 dark:border-stone-800">
                
                <div className="flex items-center justify-between py-4 gap-4">
                  <span className="text-sm font-medium text-foreground">Meals planned for this week</span>
                  <span className="h-[1px] grow border-b border-dashed border-stone-300 dark:border-stone-700" />
                  <div className="flex items-baseline gap-2 shrink-0">
                    <span className="text-xl font-bold text-foreground">24</span>
                    <span className="text-xs font-semibold text-accent-foreground bg-accent px-1.5 py-0.5 rounded">+6 new</span>
                  </div>
                </div>

                <div className="flex items-center justify-between py-4 gap-4">
                  <span className="text-sm font-medium text-foreground">Total prep-time saved</span>
                  <span className="h-[1px] grow border-b border-dashed border-stone-300 dark:border-stone-700" />
                  <div className="flex items-baseline gap-2 shrink-0">
                    <span className="text-xl font-bold text-foreground">7h</span>
                    <span className="text-xs text-muted-foreground">Average</span>
                  </div>
                </div>

                <div className="flex items-center justify-between py-4 gap-4">
                  <span className="text-sm font-medium text-foreground">Weekly budget remaining</span>
                  <span className="h-[1px] grow border-b border-dashed border-stone-300 dark:border-stone-700" />
                  <div className="flex items-baseline gap-2 shrink-0">
                    <span className="text-xl font-bold text-foreground">$142</span>
                    <span className="text-xs font-semibold text-accent-foreground bg-accent px-1.5 py-0.5 rounded">Under target</span>
                  </div>
                </div>

              </div>
            </div>

            {/* Weekly Meal Journal */}
            <div className="space-y-6">
              <div className="flex items-baseline justify-between border-b border-stone-200/60 pb-3 dark:border-stone-800">
                <h3 className="text-xs font-bold uppercase tracking-widest text-primary">Meal Journal</h3>
                <button className="flex items-center gap-1 text-xs font-semibold text-foreground hover:opacity-85">
                  Open Planner
                  <ArrowRight className="size-3.5" />
                </button>
              </div>

              {/* Journal Menu Style */}
              <div className="space-y-6 pt-2">
                {planItems.map((item) => (
                  <div key={item.day} className="grid grid-cols-[80px_1fr_auto] items-start gap-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-primary pt-1">{item.day}</span>
                    <div className="space-y-0.5">
                      <p className="text-lg font-light text-foreground font-serif">{item.meal}</p>
                      <p className="text-xs text-muted-foreground">{item.time}</p>
                    </div>
                    <span className="rounded border border-stone-200 px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider text-muted-foreground dark:border-stone-800">
                      {item.tag || "Cozy"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Sidebar Area */}
          <div className="space-y-10 lg:border-l lg:border-stone-200/60 lg:pl-10 dark:border-stone-800">
            
            {/* Today's Focus */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-primary">Today&apos;s Entry</h3>
              <div className="rounded-xl border border-stone-200/60 bg-card p-6 dark:border-stone-800">
                <div className="flex items-baseline justify-between">
                  <h4 className="text-2xl font-light italic font-serif text-foreground">Thursday</h4>
                  <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">May 14</span>
                </div>

                <div className="mt-4 border-t border-stone-100 pt-4 dark:border-stone-800/60">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Next up</p>
                    <span className="rounded bg-accent px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-accent-foreground">
                      On Track
                    </span>
                  </div>
                  <p className="mt-1 text-base font-light text-foreground font-serif">Lemon herb chicken breast</p>
                  <p className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
                    <Clock3 className="size-3" />
                    25 min prep • 4 portions
                  </p>
                </div>

                <div className="mt-6 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Daily protein goal</span>
                    <span className="font-semibold text-foreground">82%</span>
                  </div>
                  <div className="h-[3px] w-full rounded-full bg-stone-100 dark:bg-stone-800 overflow-hidden">
                    <div className="h-full rounded-full bg-primary" style={{ width: "82%" }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Pantry Pulse */}
            <div className="space-y-4">
              <div className="flex items-center gap-1.5">
                <Leaf className="size-3.5 text-primary" />
                <h3 className="text-xs font-bold uppercase tracking-widest text-primary">Pantry Pulse</h3>
              </div>

              <div className="divide-y divide-stone-200/40 border-t border-b border-stone-200/40 dark:divide-stone-800/40 dark:border-stone-800/40">
                {pantryItems.map((item) => (
                  <div key={item.item} className="flex items-start gap-3 py-3">
                    <div className="mt-1 flex size-1.5 shrink-0 rounded-full bg-accent" />
                    <div className="space-y-0.5">
                      <p className="text-xs font-medium text-foreground">{item.item}</p>
                      <p className="text-[10px] text-muted-foreground font-light leading-relaxed">{item.note}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Smart Insights */}
            <div className="space-y-4">
              <div className="flex items-center gap-1.5">
                <TrendingUp className="size-3.5 text-primary" />
                <h3 className="text-xs font-bold uppercase tracking-widest text-primary">Smart Insights</h3>
              </div>
              <div className="rounded-xl border border-stone-200/60 bg-card p-6 dark:border-stone-800">
                <p className="text-xl font-light italic font-serif leading-snug text-foreground">
                  &ldquo;Your most efficient night is Wednesday — perfect for batch cooking.&rdquo;
                </p>
                <div className="mt-4 flex items-center gap-2 border-t border-stone-100 pt-3 text-[11px] text-muted-foreground dark:border-stone-800/60">
                  <UtensilsCrossed className="size-3.5 text-primary" />
                  3 recipes matched to your routine
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </main>
  );
}
