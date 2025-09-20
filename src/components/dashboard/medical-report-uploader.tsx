"use client";

import { useState, useRef, useContext } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Loader2, Sparkles, XCircle, FileText, HeartPulse, Droplet, Activity, Wind } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { analyzeMedicalReport } from '@/ai/flows/medical-report-analysis';
import { UserContext } from '@/context/user-context';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Form, FormControl, FormField, FormItem, FormMessage } from '../ui/form';

const reportSchema = z.object({
  bloodPressure: z.string().optional(),
  bloodSugar: z.string().optional(),
  cholesterol: z.string().optional(),
  spO2: z.string().optional(),
});

type ReportFormValues = z.infer<typeof reportSchema>;

export function MedicalReportUploader() {
    const [preview, setPreview] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<ReportFormValues | null>(null);
    const [inputMode, setInputMode] = useState<'upload' | 'manual'>('upload');
    const { toast } = useToast();
    const userContext = useContext(UserContext);
    const firebaseUser = userContext?.firebaseUser;
    
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
            setResult(null);
            form.reset();

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

        setIsLoading(true);
        setResult(null);

        try {
            const analysisResult = await analyzeMedicalReport({ reportImage: preview });
            setResult(analysisResult);
            form.reset(analysisResult); // Populate form with AI results
            toast({ title: 'Analysis Complete', description: 'Review the extracted data below.' });
        } catch (error) {
            console.error(error);
            toast({
                variant: 'destructive',
                title: 'Analysis Failed',
                description: 'Could not analyze the report. Please try again or enter manually.',
            });
        } finally {
            setIsLoading(false);
        }
    };
    
    async function onSave(data: ReportFormValues) {
        if (!firebaseUser) {
            toast({ variant: 'destructive', title: 'Not signed in', description: 'You must be signed in to save data.' });
            return;
        }
        setIsLoading(true);
        try {
            const userDocRef = doc(db, 'users', firebaseUser.uid);
            await updateDoc(userDocRef, {
                medicalData: data,
            });
            toast({ title: 'Success!', description: 'Your medical data has been saved.' });
        } catch (error) {
            console.error('Error saving medical data: ', error);
            toast({ variant: 'destructive', title: 'Save failed', description: 'Could not save your medical data.' });
        } finally {
            setIsLoading(false);
        }
    }

    const clearPreview = () => {
        setPreview(null);
        setResult(null);
        form.reset();
    }

    return (
        <Card className="max-w-4xl mx-auto">
            <CardHeader>
                <CardTitle>Upload or Enter Medical Data</CardTitle>
                <CardDescription>Use our AI to extract info from a report, or enter it manually.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-2">
                    <Button variant={inputMode === 'upload' ? 'secondary' : 'outline'} onClick={() => setInputMode('upload')}>
                        <Upload className="mr-2 h-4 w-4" /> Upload Report
                    </Button>
                     <Button variant={inputMode === 'manual' ? 'secondary' : 'outline'} onClick={() => setInputMode('manual')}>
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
                                <Button variant="ghost" size="icon" className="absolute top-2 right-2 z-10 h-6 w-6 rounded-full bg-background/50 hover:bg-background" onClick={clearPreview}>
                                    <XCircle className="h-5 w-5 text-destructive" />
                                 </Button>
                                <img src={preview} alt="Report preview" className="w-full h-auto rounded-md" />
                            </div>
                        )}
                        <Button onClick={handleAnalyze} disabled={isLoading || !preview} className="w-full [filter:drop-shadow(0_0_6px_hsl(var(--primary)/0.8))]">
                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                            Analyze with AI
                        </Button>
                    </div>
                )}
                
                {(inputMode === 'manual' || result) && (
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSave)} className="space-y-4">
                        <CardTitle className='pt-4 border-t'>
                            {inputMode === 'manual' ? 'Manual Data Entry' : 'Extracted Medical Data'}
                        </CardTitle>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <FormField
                                control={form.control}
                                name="bloodPressure"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Blood Pressure</FormLabel>
                                        <FormControl><div className="relative"><HeartPulse className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="e.g., 120/80 mmHg" {...field} className="pl-10" /></div></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="bloodSugar"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Blood Sugar</FormLabel>
                                        <FormControl><div className="relative"><Droplet className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="e.g., 90 mg/dL" {...field} className="pl-10" /></div></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="cholesterol"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Total Cholesterol</FormLabel>
                                        <FormControl><div className="relative"><Activity className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="e.g., 180 mg/dL" {...field} className="pl-10" /></div></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="spO2"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>SpO2 (Oxygen Saturation)</FormLabel>
                                        <FormControl><div className="relative"><Wind className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="e.g., 98%" {...field} className="pl-10" /></div></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                         <Button type="submit" disabled={isLoading} className="w-full">
                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Save Medical Data'}
                        </Button>
                    </form>
                  </Form>
                )}

            </CardContent>
        </Card>
    );
}
