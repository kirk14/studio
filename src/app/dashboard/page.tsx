import { ProgressStats } from "@/components/dashboard/progress-stats";
import { ActivityChart } from "@/components/dashboard/activity-chart";
import { DietPlan } from "@/components/dashboard/diet-plan";
import { MealAnalyzer } from "@/components/dashboard/meal-analyzer";
import { HydrationMeter } from "@/components/dashboard/hydration-meter";

export default function DashboardPage() {
  return (
    <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
        <div className="xl:col-span-3">
            <h1 className="text-3xl font-bold tracking-tight font-headline">
                Welcome Back, User!
            </h1>
            <p className="text-muted-foreground">
                Here's a snapshot of your health and progress.
            </p>
        </div>

        <div className="grid xl:col-span-3 gap-4 md:gap-8 sm:grid-cols-2 lg:grid-cols-5">
            <ProgressStats />
            <HydrationMeter />
        </div>
        
        <div className="grid gap-4 md:gap-8 xl:col-span-2">
            <ActivityChart />
            <MealAnalyzer />
        </div>

        <div className="row-start-3 lg:row-start-auto xl:col-span-1">
            <DietPlan />
        </div>
    </div>
  );
}
