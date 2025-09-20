
"use client";

import { useState, useEffect, useCallback } from "react";
import { ProgressStats } from "@/components/dashboard/progress-stats";
import { ActivityChart } from "@/components/dashboard/activity-chart";
import { DietPlan } from "@/components/dashboard/diet-plan";
import { MealAnalyzer } from "@/components/dashboard/meal-analyzer";
import { HydrationMeter } from "@/components/dashboard/hydration-meter";
import type { ConsumedMacros, Meal } from "@/lib/types";
import { adjustDietPlan } from "@/ai/flows/dynamic-diet-adjustment";
import { onAuthStateChanged, type User as FirebaseAuthUser } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import type { PersonalizedDietPlanOutput } from "@/ai/flows/personalized-diet-plan-generation";

export default function DashboardPage() {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseAuthUser | null>(null);
  const { toast } = useToast();

  const [consumedMacros, setConsumedMacros] = useState<ConsumedMacros>({
    calories: 0,
    protein: 0,
    carbs: 0,
    fats: 0,
  });

  const [targetMacros, setTargetMacros] = useState({
    calories: 2400,
    protein: 140,
    carbs: 300,
    fats: 70,
  });

  const [originalDietPlan, setOriginalDietPlan] = useState<PersonalizedDietPlanOutput | null>(null);
  const [adjustedDietPlan, setAdjustedDietPlan] = useState<PersonalizedDietPlanOutput | null>(null);
  const [consumedMeals, setConsumedMeals] = useState<Meal[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
    });
    return () => unsubscribe();
  }, []);

  const handleMealAnalyzed = useCallback(async (mealData: { name: string; calories: number; protein: number; carbs: number; fats: number; }) => {
    const newConsumedMeal: Meal = {
      ...mealData,
      macros: {
        protein: mealData.protein,
        carbs: mealData.carbs,
        fats: mealData.fats,
      },
      recipe: 'Analyzed via Meal Analyzer',
      prepTime: 'N/A'
    };

    const newConsumedMeals = [...consumedMeals, newConsumedMeal];
    setConsumedMeals(newConsumedMeals);

    setConsumedMacros(prev => ({
      calories: prev.calories + mealData.calories,
      protein: prev.protein + mealData.protein,
      carbs: prev.carbs + mealData.carbs,
      fats: prev.fats + mealData.fats,
    }));

    if (!firebaseUser || !originalDietPlan) {
      return;
    }
    
    try {
      toast({ title: 'Adjusting Diet Plan...', description: 'AI is updating your plan based on your recent meal.' });
      
      const adjustmentInput = {
        userId: firebaseUser.uid,
        steps: 7500, // Placeholder
        caloriesBurned: 400, // Placeholder
        currentDietPlan: JSON.stringify(originalDietPlan),
        consumedMeals: newConsumedMeals.map(m => ({
          name: m.name,
          calories: m.calories,
          protein: m.macros.protein,
          carbs: m.macros.carbs,
          fats: m.macros.fats
        })),
      };

      const result = await adjustDietPlan(adjustmentInput);
      const newlyAdjustedPlan = JSON.parse(result.adjustedDietPlan) as PersonalizedDietPlanOutput;
      
      setAdjustedDietPlan(newlyAdjustedPlan);

      toast({ title: 'Diet Plan Updated!', description: result.reason });

    } catch (error) {
        console.error('Failed to adjust diet plan:', error);
        toast({ variant: 'destructive', title: 'Adjustment Failed', description: 'Could not update your diet plan.' });
    }

  }, [consumedMeals, firebaseUser, originalDietPlan, toast]);

  const handleInitialPlanGenerated = (plan: PersonalizedDietPlanOutput) => {
    setOriginalDietPlan(plan);
    setAdjustedDietPlan(plan); // Initially, adjusted is same as original
    
    // Calculate and set target macros from the initial plan
    const totalTargets = plan.dailyPlan.meals.reduce((acc, meal) => ({
      calories: acc.calories + meal.calories,
      protein: acc.protein + meal.macros.protein,
      carbs: acc.carbs + meal.macros.carbs,
      fats: acc.fats + meal.macros.fats,
    }), { calories: 0, protein: 0, carbs: 0, fats: 0 });

    setTargetMacros({
      calories: Math.round(totalTargets.calories),
      protein: Math.round(totalTargets.protein),
      carbs: Math.round(totalTargets.carbs),
      fats: Math.round(totalTargets.fats),
    });
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
            <DietPlan 
              dietPlan={adjustedDietPlan}
              onInitialPlanGenerated={handleInitialPlanGenerated}
            />
        </div>
    </div>
  );
}
