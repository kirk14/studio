"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { RecipeCard } from "./recipe-card";
import type { Meal, User as AppUser } from "@/lib/types";
import { ScrollArea } from "../ui/scroll-area";
import { generatePersonalizedDietPlan, PersonalizedDietPlanOutput } from "@/ai/flows/personalized-diet-plan-generation";
import { onAuthStateChanged, type User as FirebaseAuthUser } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { Loader2, ServerCrash } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "../ui/alert";

interface DietPlanProps {
  dietPlan: PersonalizedDietPlanOutput | null;
  onInitialPlanGenerated: (plan: PersonalizedDietPlanOutput) => void;
}

export function DietPlan({ dietPlan, onInitialPlanGenerated }: DietPlanProps) {
    const [firebaseUser, setFirebaseUser] = useState<FirebaseAuthUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setFirebaseUser(user);
            } else {
                setFirebaseUser(null);
                setIsLoading(false);
            }
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (!firebaseUser || dietPlan) {
          setIsLoading(false);
          return;
        };

        const fetchAndGeneratePlan = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const userDocRef = doc(db, "users", firebaseUser.uid);
                const userDoc = await getDoc(userDocRef);

                if (userDoc.exists()) {
                    const userData = userDoc.data() as AppUser;
                    
                    const plan = await generatePersonalizedDietPlan({
                        userID: firebaseUser.uid,
                        name: userData.name,
                        role: userData.role,
                        personalInfo: {
                            height: userData.personalInfo.height,
                            weight: userData.personalInfo.weight,
                            bmi: userData.personalInfo.bmi,
                        },
                        medicalCondition: userData.medicalCondition || "None",
                        lifestyleHabits: {
                            activityLevel: userData.lifestyleHabits.activityLevel,
                            sleepPattern: userData.lifestyleHabits.sleepPattern || "Not specified",
                            workShift: userData.lifestyleHabits.workShift || "Not specified",
                        },
                        dietaryPreferences: {
                            vegOrNonVeg: userData.dietaryPreferences.vegOrNonVeg,
                            cuisine: userData.dietaryPreferences.cuisine,
                            restrictions: userData.dietaryPreferences.restrictions || "None",
                        },
                        healthGoals: {
                            goalType: userData.healthGoals.goalType,
                            targetWeight: userData.healthGoals.targetWeight,
                            targetDate: userData.healthGoals.targetDate,
                        },
                    });
                    onInitialPlanGenerated(plan);
                } else {
                    setError("User profile not found. Please complete your profile.");
                }
            } catch (err) {
                console.error("Error generating diet plan:", err);
                setError("Failed to generate a diet plan. Please try again later.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchAndGeneratePlan();
    }, [firebaseUser, dietPlan, onInitialPlanGenerated]);

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
