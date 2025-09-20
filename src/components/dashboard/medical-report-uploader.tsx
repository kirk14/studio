
"use client";

import { useState, useContext } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Loader2, Sparkles, XCircle, FileText, HeartPulse, Droplet, Activity, Wind, AlertTriangle, RefreshCw, ChefHat } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { analyzeMedicalReport, AnalyzeMedicalReportOutput } from '@/ai/flows/medical-report-analysis';
import { UserContext } from '@/context/user-context';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Form, FormControl, FormField, FormItem, FormMessage, FormLabel } from '../ui/form';
import { classifyHealthMetrics, ClassifyHealthMetricsOutput } from '@/ai/flows/classify-health-metrics';
import { summarizeHealthRisks, SummarizeHealthRisksOutput } from '@/ai/flows/summarize-health-risks';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';
import { Alert, AlertTitle, AlertDescription } from '../ui/alert';
import { Skeleton } from '../ui/skeleton';
import { generatePersonalizedDietPlan, PersonalizedDietPlanOutput } from '@/ai/flows/personalized-diet-plan-generation';
import { RecipeCard } from './recipe-card';
import { ScrollArea } from '../ui/scroll-area';

const reportSchema = z.object({
  bloodPressure: z.string().optional(),
  bloodSugar: z.string().optional(),
  cholesterol: z.string().optional(),
  spO2: z.string().optional(),
});

type ReportFormValues = z.infer<typeof reportSchema>;

export function MedicalReportUploader() {
    const [preview, setPreview] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<AnalyzeMedicalReportOutput | null>(null);
    const [classifications, setClassifications] = useState<ClassifyHealthMetricsOutput | null>(null);
    const [riskSummary, setRiskSummary] = useState<SummarizeHealthRisksOutput | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [dataSaved, setDataSaved] = useState(false);
    const [inputMode, setInputMode] = useState<'upload' | 'manual'>('upload');
    const [dietPlan, setDietPlan] = useState<PersonalizedDietPlanOutput | null>(null);
    const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
    const [planError, setPlanError] = useState<string | null>(null);

    const { toast } = useToast();
    const userContext = useContext(UserContext);
    const firebaseUser = userContext?.firebaseUser;
    const userProfile = userContext?.userProfile;
    
    const form = useForm<ReportFormValues>({
        resolver: zodResolver(reportSchema),
        defaultValues: {
            bloodPressure: '',
            bloodSugar: '',
            cholesterol: '',
            spO2: '',
        },
    });
    
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
            clearAll();
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleAnalyze = async () => {
        if (!preview) {
            toast({
                variant: 'destructive',
                title: 'No image selected',
                description: 'Please upload an image of your medical report.',
            });
            return;
        }

        setIsAnalyzing(true);
        setAnalysisResult(null);
        setClassifications(null);
        setRiskSummary(null);

        try {
            const extractedData = await analyzeMedicalReport({ reportImage: preview });
            setAnalysisResult(extractedData);
            form.reset(extractedData); 
            toast({ title: 'Extraction Complete', description: 'AI analysis is now running...' });

            const [classificationResult, summaryResult] = await Promise.all([
                classifyHealthMetrics(extractedData),
                summarizeHealthRisks(extractedData)
            ]);
            
            setClassifications(classificationResult);
            setRiskSummary(summaryResult);
            toast({ title: 'Analysis Complete', description: 'Review the extracted data and AI summary below.' });

        } catch (error) {
            console.error(error);
            toast({
                variant: 'destructive',
                title: 'Analysis Failed',
                description: 'Could not analyze the report. Please try again or enter manually.',
            });
        } finally {
            setIsAnalyzing(false);
        }
    };
    
    async function onSave(data: ReportFormValues) {
        if (!firebaseUser) {
            toast({ variant: 'destructive', title: 'Not signed in', description: 'You must be signed in to save data.' });
            return;
        }
        setIsSaving(true);
        try {
            const userDocRef = doc(db, 'users', firebaseUser.uid);
            await updateDoc(userDocRef, { medicalData: data });
            setDataSaved(true);
            toast({ title: 'Success!', description: 'Your medical data has been saved.' });
        } catch (error) {
            console.error('Error saving medical data: ', error);
            toast({ variant: 'destructive', title: 'Save failed', description: 'Could not save your medical data.' });
        } finally {
            setIsSaving(false);
        }
    }

    const handleGeneratePlan = async () => {
        if (!firebaseUser || !userProfile) {
          toast({ variant: 'destructive', title: 'User data not found.' });
          return;
        };

        setIsGeneratingPlan(true);
        setPlanError(null);
        setDietPlan(null);
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
                // Use the newly saved data from the form
                medicalData: form.getValues(),
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
            setDietPlan(plan);
        } catch (err) {
            console.error("Error generating diet plan:", err);
            setPlanError("Failed to generate a diet plan. Please try again later.");
        } finally {
            setIsGeneratingPlan(false);
        }
    };

    const clearAll = () => {
        setPreview(null);
        setAnalysisResult(null);
        setClassifications(null);
        setRiskSummary(null);
        setDataSaved(false);
        setDietPlan(null);
        setPlanError(null);
        form.reset();
    }
    
    const getBadgeVariant = (classification: string | undefined): "default" | "secondary" | "destructive" | "outline" => {
        switch (classification) {
            case 'Normal': return 'default';
            case 'High': case 'Very High': case 'Low': case 'Very Low': return 'destructive';
            case 'Slightly High': case 'Slightly Low': return 'secondary';
            default: return 'outline';
        }
    }

    const renderDietPlan = () => {
        if (isGeneratingPlan) {
            return (
                <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    <p className="mt-4 text-muted-foreground">Generating your new diet plan...</p>
                </div>
            );
        }

        if (planError) {
             return (
                 <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
                    <Alert variant="destructive" className="max-w-sm">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Generation Failed</AlertTitle>
                        <AlertDescription>{planError}</AlertDescription>
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
        return null;
    }


    return (
        <div className="grid gap-8 md:grid-cols-2 max-w-7xl mx-auto">
            <Card className="md:col-span-1">
                <CardHeader>
                    <CardTitle>Upload or Enter Medical Data</CardTitle>
                    <CardDescription>Use our AI to extract info from a report, or enter it manually. This data will be used to generate a tailored diet plan.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-2">
                        <Button variant={inputMode === 'upload' ? 'secondary' : 'outline'} onClick={() => { setInputMode('upload'); clearAll(); }}>
                            <Upload className="mr-2 h-4 w-4" /> Upload Report
                        </Button>
                        <Button variant={inputMode === 'manual' ? 'secondary' : 'outline'} onClick={() => { setInputMode('manual'); clearAll(); }}>
                            <FileText className="mr-2 h-4 w-4" /> Enter Manually
                        </Button>
                    </div>

                    {inputMode === 'upload' && (
                        <div className='space-y-4'>
                            <div className="grid gap-2">
                                <Label htmlFor="report-file">Upload Report Image</Label>
                                <Input id="report-file" type="file" accept="image/*" onChange={handleFileChange} />
                            </div>
                            {preview && (
                                <div className="relative p-2 border-2 border-dashed rounded-lg">
                                    <Button variant="ghost" size="icon" className="absolute top-2 right-2 z-10 h-6 w-6 rounded-full bg-background/50 hover:bg-background" onClick={clearAll}>
                                        <XCircle className="h-5 w-5 text-destructive" />
                                    </Button>
                                    <img src={preview} alt="Report preview" className="w-full h-auto rounded-md" />
                                </div>
                            )}
                            <Button onClick={handleAnalyze} disabled={isAnalyzing || !preview} className="w-full [filter:drop-shadow(0_0_6px_hsl(var(--primary)/0.8))]">
                                {isAnalyzing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                                Analyze with AI
                            </Button>
                        </div>
                    )}
                    
                    {(inputMode === 'manual' || analysisResult) && (
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSave)} className="space-y-4">
                            <CardTitle className='pt-4 border-t'>
                                {inputMode === 'manual' ? 'Manual Data Entry' : 'Extracted & Analyzed Medical Data'}
                            </CardTitle>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="bloodPressure"
                                    render={({ field }) => (
                                        <FormItem>
                                            <div className="flex items-center justify-between mb-1">
                                                <FormLabel>Blood Pressure</FormLabel>
                                                {classifications?.bloodPressure && classifications.bloodPressure !== 'N/A' && <Badge variant={getBadgeVariant(classifications.bloodPressure)}>{classifications.bloodPressure}</Badge>}
                                            </div>
                                            <FormControl><div className="relative"><HeartPulse className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="e.g., 120/80 mmHg" {...field} className="pl-10" readOnly={inputMode !== 'manual'}/></div></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="bloodSugar"
                                    render={({ field }) => (
                                        <FormItem>
                                            <div className="flex items-center justify-between mb-1">
                                                <FormLabel>Blood Sugar</FormLabel>
                                                {classifications?.bloodSugar && classifications.bloodSugar !== 'N/A' && <Badge variant={getBadgeVariant(classifications.bloodSugar)}>{classifications.bloodSugar}</Badge>}
                                            </div>
                                            <FormControl><div className="relative"><Droplet className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="e.g., 90 mg/dL" {...field} className="pl-10" readOnly={inputMode !== 'manual'}/></div></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="cholesterol"
                                    render={({ field }) => (
                                        <FormItem>
                                            <div className="flex items-center justify-between mb-1">
                                                <FormLabel>Total Cholesterol</FormLabel>
                                                {classifications?.cholesterol && classifications.cholesterol !== 'N/A' && <Badge variant={getBadgeVariant(classifications.cholesterol)}>{classifications.cholesterol}</Badge>}
                                            </div>
                                            <FormControl><div className="relative"><Activity className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="e.g., 180 mg/dL" {...field} className="pl-10" readOnly={inputMode !== 'manual'}/></div></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="spO2"
                                    render={({ field }) => (
                                        <FormItem>
                                            <div className="flex items-center justify-between mb-1">
                                                <FormLabel>SpO2 (Oxygen Saturation)</FormLabel>
                                                {classifications?.spO2 && classifications.spO2 !== 'N/A' && <Badge variant={getBadgeVariant(classifications.spO2)}>{classifications.spO2}</Badge>}
                                            </div>
                                            <FormControl><div className="relative"><Wind className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="e.g., 98%" {...field} className="pl-10" readOnly={inputMode !== 'manual'}/></div></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {(isAnalyzing || riskSummary) && (
                                <div className="space-y-2 pt-4">
                                    <h3 className="text-lg font-semibold">AI Health Risk Analysis</h3>
                                    {isAnalyzing && !riskSummary ? (
                                        <div className="space-y-2 p-4 border rounded-lg">
                                            <Skeleton className="h-4 w-1/3" />
                                            <Skeleton className="h-4 w-full" />
                                            <Skeleton className="h-4 w-3/4" />
                                        </div>
                                    ) : riskSummary ? (
                                        <Alert>
                                            <AlertTriangle className="h-4 w-4" />
                                            <AlertTitle>Analysis Summary</AlertTitle>
                                            <AlertDescription>{riskSummary.summary}</AlertDescription>
                                        </Alert>
                                    ) : null}
                                </div>
                            )}

                            <Button type="submit" disabled={isSaving || dataSaved} className="w-full">
                                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Save Medical Data'}
                            </Button>

                        </form>
                    </Form>
                    )}
                </CardContent>
            </Card>

            <Card className="md:col-span-1">
                 <CardHeader>
                    <CardTitle>Your New Diet Plan</CardTitle>
                    <CardDescription>Based on your latest medical data.</CardDescription>
                </CardHeader>
                <CardContent>
                    {!dataSaved && !dietPlan && (
                        <div className="flex flex-col items-center justify-center text-center text-muted-foreground min-h-[400px]">
                            <ChefHat className="h-12 w-12 mb-4"/>
                            <p>Your personalized diet plan will appear here after you save your medical data.</p>
                        </div>
                    )}
                    {dataSaved && !dietPlan && (
                        <div className="flex flex-col items-center justify-center text-center min-h-[400px]">
                            <Button onClick={handleGeneratePlan} disabled={isGeneratingPlan}>
                                {isGeneratingPlan ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                                Generate Diet Plan
                            </Button>
                        </div>
                    )}
                    {renderDietPlan()}
                </CardContent>
            </Card>

        </div>
    );
}
