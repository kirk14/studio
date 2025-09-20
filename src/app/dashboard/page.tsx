
"use client";

import { useState } from "react";
import { ProgressStats } from "@/components/dashboard/progress-stats";
import { ActivityChart } from "@/components/dashboard/activity-chart";
import { DietPlan } from "@/components/dashboard/diet-plan";
import { MealAnalyzer } from "@/components/dashboard/meal-analyzer";
import { HydrationMeter } from "@/components/dashboard/hydration-meter";
import type { ConsumedMacros } from "@/lib/types";

export default function DashboardPage() {
  const [consumedMacros, setConsumedMacros] = useState<ConsumedMacros>({
    calories: 1800,
    protein: 120,
    carbs: 180,
    fats: 63,
  });

  const targetMacros = {
    calories: 2400,
    protein: 140,
    carbs: 300,
    fats: 70,
  };

  const handleMealAnalyzed = (macros: { protein: number; carbs: number; fats: number; calories: number; }) => {
    setConsumedMacros(prev => ({
      calories: prev.calories + macros.calories,
      protein: prev.protein + macros.protein,
      carbs: prev.carbs + macros.carbs,
      fats: prev.fats + macros.fats,
    }));
  };

  return (
    <div className="grid gap-4 md:gap-8 lg:grid-cols-5">
        <div className="lg:col-span-5">
            <h1 className="text-3xl font-bold tracking-tight font-headline">
                Welcome Back, User!
            </h1>
            <p className="text-muted-foreground">
                Here's a snapshot of your health and progress.
            </p>
        </div>

        <div className="grid lg:col-span-5 gap-4 md:gap-8 sm:grid-cols-2 lg:grid-cols-5">
            <ProgressStats consumed={consumedMacros} targets={targetMacros} />
            <HydrationMeter />
        </div>
        
        <div className="lg:col-span-3 grid gap-4 md:gap-8">
            <ActivityChart />
            <MealAnalyzer onMealAnalyzed={handleMealAnalyzed} />
        </div>

        <div className="lg:col-span-2">
            <DietPlan />
        </div>
    </div>
  );
}
