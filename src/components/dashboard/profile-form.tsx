
"use client";

import { useContext, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "../ui/button";
import { UserContext } from "@/context/user-context";
import { Badge } from "../ui/badge";
import { cn } from "@/lib/utils";
import { classifyHealthMetrics, ClassifyHealthMetricsOutput } from "@/ai/flows/classify-health-metrics";
import { summarizeHealthRisks, SummarizeHealthRisksOutput } from "@/ai/flows/summarize-health-risks";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { AlertTriangle } from "lucide-react";

export function ProfileForm() {
    const userContext = useContext(UserContext);
    const [classifications, setClassifications] = useState<ClassifyHealthMetricsOutput | null>(null);
    const [riskSummary, setRiskSummary] = useState<SummarizeHealthRisksOutput | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const firebaseUser = userContext?.firebaseUser;
    const userProfile = userContext?.userProfile;
    const isLoading = userContext?.isLoading;

    useEffect(() => {
        if (userProfile?.medicalData) {
            const runAnalysis = async () => {
                setIsAnalyzing(true);
                try {
                    const [classificationResult, summaryResult] = await Promise.all([
                        classifyHealthMetrics(userProfile.medicalData!),
                        summarizeHealthRisks(userProfile.medicalData!)
                    ]);
                    setClassifications(classificationResult);
                    setRiskSummary(summaryResult);
                } catch (error) {
                    console.error("Failed to analyze health metrics:", error);
                    setClassifications(null);
                    setRiskSummary(null);
                } finally {
                    setIsAnalyzing(false);
                }
            };
            runAnalysis();
        }
    }, [userProfile?.medicalData]);

    const getInitials = (name: string | null | undefined) => {
        if (!name) return 'U';
        return name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase();
    };

    const getBadgeVariant = (classification: string | undefined): "default" | "secondary" | "destructive" | "outline" => {
        switch (classification) {
            case 'Normal':
                return 'default';
            case 'High':
            case 'Very High':
            case 'Low':
            case 'Very Low':
                return 'destructive';
            case 'Slightly High':
            case 'Slightly Low':
                return 'secondary';
            default:
                return 'outline';
        }
    }
    
    if (isLoading) {
        return (
            <Card className="max-w-4xl mx-auto">
                <CardHeader>
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-64" />
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center gap-6">
                        <Skeleton className="h-24 w-24 rounded-full" />
                        <div className="space-y-2">
                             <Skeleton className="h-4 w-32" />
                             <Skeleton className="h-4 w-48" />
                        </div>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                         <div className="space-y-2">
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                     </div>
                </CardContent>
            </Card>
        )
    }

    if (!firebaseUser) {
        return (
            <Card className="max-w-4xl mx-auto">
                <CardHeader>
                    <CardTitle>No User Found</CardTitle>
                    <CardDescription>Please log in to view your profile.</CardDescription>
                </CardHeader>
            </Card>
        )
    }
    
    // This can happen if the user is authenticated with Firebase Auth
    // but their profile document doesn't exist in Firestore yet.
    if (!userProfile) {
        return (
            <Card className="max-w-4xl mx-auto">
                <CardHeader>
                    <CardTitle>Welcome!</CardTitle>
                    <CardDescription>Your profile is not yet complete. Please finish the sign-up process.</CardDescription>
                </CardHeader>
            </Card>
        )
    }

    const MetricDisplay = ({ label, value, classification }: { label: string, value: string | undefined, classification: string | undefined }) => (
        <div>
            <div className="flex items-center justify-between mb-1">
                <Label htmlFor={label.toLowerCase()}>{label}</Label>
                {isAnalyzing ? (
                     <Skeleton className="h-5 w-16" />
                ) : (
                    classification && classification !== 'N/A' && (
                        <Badge variant={getBadgeVariant(classification)}>{classification}</Badge>
                    )
                )}
            </div>
            <Input id={label.toLowerCase()} value={value ?? 'N/A'} readOnly />
        </div>
    );

    return (
        <Card className="max-w-4xl mx-auto">
             <CardHeader>
                <div className="flex items-center gap-6">
                    <Avatar className="h-24 w-24">
                        <AvatarImage src={firebaseUser.photoURL ?? ''} alt={userProfile.name} />
                        <AvatarFallback className="text-3xl">{getInitials(userProfile.name)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <CardTitle className="text-3xl">{userProfile.name}</CardTitle>
                        <CardDescription className="text-lg">{userProfile.email}</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <Label htmlFor="height">Height</Label>
                        <Input id="height" value={`${userProfile.personalInfo?.height ?? 'N/A'} cm`} readOnly />
                    </div>
                    <div>
                        <Label htmlFor="weight">Weight</Label>
                        <Input id="weight" value={`${userProfile.personalInfo?.weight ?? 'N/A'} kg`} readOnly />
                    </div>
                    <div>
                        <Label htmlFor="bmi">BMI</Label>
                        <Input id="bmi" value={userProfile.personalInfo?.bmi ?? 'N/A'} readOnly />
                    </div>
                    <div>
                        <Label htmlFor="activityLevel">Activity Level</Label>
                        <Input id="activityLevel" value={userProfile.lifestyleHabits?.activityLevel ?? 'N/A'} readOnly className="capitalize"/>
                    </div>
                     <div>
                        <Label htmlFor="goal">Health Goal</Label>
                        <Input id="goal" value={userProfile.healthGoals?.goalType ?? 'N/A'} readOnly className="capitalize"/>
                    </div>
                    <div>
                        <Label htmlFor="targetWeight">Target Weight</Label>
                        <Input id="targetWeight" value={`${userProfile.healthGoals?.targetWeight ?? 'N/A'} kg`} readOnly />
                    </div>
                </div>

                {(userProfile.medicalData || isAnalyzing) && (
                    <>
                        <h3 className="text-xl font-semibold border-t pt-6">Medical Data</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <MetricDisplay 
                                label="Blood Pressure" 
                                value={userProfile.medicalData?.bloodPressure} 
                                classification={classifications?.bloodPressure}
                            />
                            <MetricDisplay 
                                label="Blood Sugar" 
                                value={userProfile.medicalData?.bloodSugar} 
                                classification={classifications?.bloodSugar}
                            />
                            <MetricDisplay 
                                label="Cholesterol" 
                                value={userProfile.medicalData?.cholesterol} 
                                classification={classifications?.cholesterol}
                            />
                            <MetricDisplay 
                                label="SpO2" 
                                value={userProfile.medicalData?.spO2} 
                                classification={classifications?.spO2}
                            />
                        </div>
                    </>
                )}

                {(isAnalyzing || riskSummary) && (
                     <div className="space-y-4 pt-6 border-t">
                        <h3 className="text-xl font-semibold">AI Health Risk Analysis</h3>
                        {isAnalyzing ? (
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-3/4" />
                            </div>
                        ) : riskSummary ? (
                            <Alert>
                                <AlertTriangle className="h-4 w-4" />
                                <AlertTitle>Analysis Summary</AlertTitle>
                                <AlertDescription>
                                    {riskSummary.summary}
                                </AlertDescription>
                            </Alert>
                        ) : null}
                     </div>
                )}


                 <div className="flex justify-end">
                    <Button disabled>Edit Profile</Button>
                </div>
            </CardContent>
        </Card>
    );
}
