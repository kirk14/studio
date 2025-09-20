"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, Loader2, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { estimateMealCalories } from '@/ai/flows/meal-image-calorie-estimation';

export function MealAnalyzer() {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<any | null>(null);
    const { toast } = useToast();

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
            setSelectedFile(file);
            setResult(null);

            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAnalyze = async () => {
        if (!selectedFile || !preview) {
            toast({
                variant: 'destructive',
                title: 'No file selected',
                description: 'Please upload an image of your meal first.',
            });
            return;
        }

        setIsLoading(true);
        setResult(null);

        try {
            const analysisResult = await estimateMealCalories({ mealImageDataUri: preview });
            setResult(analysisResult);
        } catch (error) {
            console.error(error);
            toast({
                variant: 'destructive',
                title: 'Analysis Failed',
                description: 'Could not analyze the meal image. Please try again.',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>AI Meal Analyzer</CardTitle>
                <CardDescription>Upload a picture of your meal to get an instant calorie and macro estimate.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid gap-2">
                    <Input id="picture" type="file" accept="image/*" onChange={handleFileChange} />
                </div>
                {preview && (
                    <div className="relative p-2 border-2 border-dashed rounded-lg">
                        <img src={preview} alt="Meal preview" className="w-full h-auto rounded-md" />
                    </div>
                )}
                <Button onClick={handleAnalyze} disabled={isLoading || !selectedFile} className="w-full [filter:drop-shadow(0_0_6px_hsl(var(--primary)/0.8))]">
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                    Analyze Meal
                </Button>
                {result && (
                    <div className="p-4 rounded-lg bg-muted/50 text-center space-y-2">
                        <h4 className="font-bold text-primary">Analysis Result</h4>
                        <p className="text-xl font-bold">{result.estimatedCalories} kcal</p>
                        <div className="flex justify-around text-sm">
                            <span>Protein: {result.estimatedMacros.protein}g</span>
                            <span>Carbs: {result.estimatedMacros.carbs}g</span>
                            <span>Fats: {result.estimatedMacros.fats}g</span>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
