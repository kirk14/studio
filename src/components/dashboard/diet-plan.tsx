"use client";

import { useState, useEffect, useContext } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { RecipeCard } from "./recipe-card";
import { ScrollArea } from "../ui/scroll-area";
import { generatePersonalizedDietPlan, PersonalizedDietPlanOutput } from "@/ai/flows/personalized-diet-plan-generation";
import { Loader2, ServerCrash } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "../ui/alert";
import { UserContext } from "@/context/user-context";

interface DietPlanProps {
  dietPlan: PersonalizedDietPlanOutput | null;
  onInitialPlanGenerated: (plan: PersonalizedDietPlanOutput) => void;
}

export function DietPlan({ dietPlan, onInitialPlanGenerated }: DietPlanProps) {
    const userContext = useContext(UserContext);
    const firebaseUser = userContext?.firebaseUser;
    const userProfile = userContext?.userProfile;
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!firebaseUser || !userProfile || dietPlan) {
          setIsLoading(false);
          return;
        };

        const fetchAndGeneratePlan = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const plan = await generatePersonalizedDietPlan({
                    userID: firebaseUser.uid,
                    name: userProfile.name,
                    role: userProfile.role,
                    personalInfo: {
                        height: userProfile.personalInfo.height,
                        weight: userProfile.personalInfo.weight,
                        bmi: userProfile.personalInfo.bmi,
                    },
                    medicalCondition: userProfile.medicalCondition || "None",
                    lifestyleHabits: {
                        activityLevel: userProfile.lifestyleHabits.activityLevel,
                        sleepPattern: userProfile.lifestyleHabits.sleepPattern || "Not specified",
                        workShift: userProfile.lifestyleHabits.workShift || "Not specified",
                    },
                    dietaryPreferences: {
                        vegOrNonVeg: userProfile.dietaryPreferences.vegOrNonVeg,
                        cuisine: userProfile.dietaryPreferences.cuisine,
                        restrictions: userProfile.dietaryPreferences.restrictions || "None",
                    },
                    healthGoals: {
                        goalType: userProfile.healthGoals.goalType,
                        targetWeight: userProfile.healthGoals.targetWeight,
                        targetDate: userProfile.healthGoals.targetDate,
                    },
                });
                onInitialPlanGenerated(plan);
            } catch (err) {
                console.error("Error generating diet plan:", err);
                setError("Failed to generate a diet plan. Please try again later.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchAndGeneratePlan();
    }, [firebaseUser, userProfile, dietPlan, onInitialPlanGenerated]);

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    <p className="mt-4 text-muted-foreground">Generating your personalized plan...</p>
                </div>
            );
        }

        if (error) {
            return (
                 <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
                    <Alert variant="destructive" className="max-w-sm">
                        <ServerCrash className="h-4 w-4" />
                        <AlertTitle>Generation Failed</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                </div>
            );
        }

        if (dietPlan && dietPlan.dailyPlan.meals.length > 0) {
            return (
                <ScrollArea className="h-[550px] pr-4">
                    <div className="space-y-4">
                        {dietPlan.dailyPlan.meals.map((meal, index) => (
                            <RecipeCard key={index} meal={meal} />
                        ))}
                    </div>
                </ScrollArea>
            );
        }

        return <p className="text-center text-muted-foreground">No diet plan available.</p>;
    }


    return (
        <Card className="h-full flex flex-col">
            <CardHeader>
                <CardTitle>Today's Diet Plan</CardTitle>
                <CardDescription>Your personalized meals for the day.</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
                {renderContent()}
            </CardContent>
        </Card>
    );
}
