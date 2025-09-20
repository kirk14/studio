
"use client";

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, Loader2, Sparkles, Camera, Image as ImageIcon, XCircle, CameraOff, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { estimateMealCalories } from '@/ai/flows/meal-image-calorie-estimation';
import { estimateMealCaloriesFromText } from '@/ai/flows/meal-text-calorie-estimation';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '../ui/textarea';

export function MealAnalyzer() {
    const [preview, setPreview] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<any | null>(null);
    const [inputMode, setInputMode] = useState<'upload' | 'camera' | 'manual'>('upload');
    const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
    const [manualMealDescription, setManualMealDescription] = useState('');
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { toast } = useToast();


    useEffect(() => {
        const getCameraPermission = async () => {
          if (inputMode === 'camera') {
            try {
              const stream = await navigator.mediaDevices.getUserMedia({video: true});
              setHasCameraPermission(true);
      
              if (videoRef.current) {
                videoRef.current.srcObject = stream;
              }
            } catch (error) {
              console.error('Error accessing camera:', error);
              setHasCameraPermission(false);
              toast({
                variant: 'destructive',
                title: 'Camera Access Denied',
                description: 'Please enable camera permissions in your browser settings to use this app.',
              });
            }
          } else {
            // Stop camera stream when switching away
            if (videoRef.current && videoRef.current.srcObject) {
                const stream = videoRef.current.srcObject as MediaStream;
                stream.getTracks().forEach(track => track.stop());
                videoRef.current.srcObject = null;
            }
          }
        };
      
        getCameraPermission();

        // Cleanup function to stop camera when component unmounts
        return () => {
            if (videoRef.current && videoRef.current.srcObject) {
                const stream = videoRef.current.srcObject as MediaStream;
                stream.getTracks().forEach(track => track.stop());
            }
        }
    }, [inputMode, toast]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
            setResult(null);

            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleAnalyze = async () => {
        if (inputMode === 'manual') {
            if (!manualMealDescription) {
                 toast({
                    variant: 'destructive',
                    title: 'No meal description',
                    description: 'Please describe your meal first.',
                });
                return;
            }
        } else if (!preview) {
            toast({
                variant: 'destructive',
                title: 'No image selected',
                description: 'Please upload or take a picture of your meal first.',
            });
            return;
        }

        setIsLoading(true);
        setResult(null);

        try {
            let analysisResult;
            if (inputMode === 'manual') {
                analysisResult = await estimateMealCaloriesFromText({ mealDescription: manualMealDescription });
            } else {
                analysisResult = await estimateMealCalories({ mealImageDataUri: preview! });
            }
            setResult(analysisResult);

            // Webhook integration
            try {
                await fetch('https://sattwik19.app.n8n.cloud/webhook-test/4dfbcdb8-9a48-439a-a97a-d48794c4da21', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        source: 'MealAnalyzer',
                        ...analysisResult
                    }),
                });
              } catch (webhookError) {
                  console.error("Error sending webhook: ", webhookError);
                  // Non-blocking, so we don't show an error to the user for this
              }

        } catch (error) {
            console.error(error);
            toast({
                variant: 'destructive',
                title: 'Analysis Failed',
                description: 'Could not analyze the meal. Please try again.',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleTakePicture = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const context = canvas.getContext('2d');
            if (context) {
                context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
                const dataUri = canvas.toDataURL('image/jpeg');
                setPreview(dataUri);
                setInputMode('upload'); // Switch back to show the preview
            }
        }
    }

    const clearPreview = () => {
        setPreview(null);
        setResult(null);
    }


    return (
        <Card>
            <CardHeader>
                <CardTitle>AI Meal Analyzer</CardTitle>
                <CardDescription>Get an instant calorie and macro estimate from an image or text description.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-2">
                    <Button variant={inputMode === 'upload' ? 'secondary' : 'outline'} onClick={() => setInputMode('upload')} className="w-full">
                        <Upload className="mr-2 h-4 w-4" /> Upload
                    </Button>
                    <Button variant={inputMode === 'camera' ? 'secondary' : 'outline'} onClick={() => setInputMode('camera')} className="w-full">
                        <Camera className="mr-2 h-4 w-4" /> Camera
                    </Button>
                     <Button variant={inputMode === 'manual' ? 'secondary' : 'outline'} onClick={() => setInputMode('manual')} className="w-full">
                        <FileText className="mr-2 h-4 w-4" /> Manual
                    </Button>
                </div>

                {inputMode === 'upload' && (
                    <>
                         <div className="grid gap-2">
                            <Input id="picture" type="file" accept="image/*" onChange={handleFileChange} />
                        </div>
                        {preview && (
                            <div className="relative p-2 border-2 border-dashed rounded-lg">
                                <Button variant="ghost" size="icon" className="absolute top-2 right-2 z-10 h-6 w-6 rounded-full bg-background/50 hover:bg-background" onClick={clearPreview}>
                                    <XCircle className="h-5 w-5 text-destructive" />
                                </Button>
                                <img src={preview} alt="Meal preview" className="w-full h-auto rounded-md" />
                            </div>
                        )}
                    </>
                )}

                {inputMode === 'camera' && (
                    <div className="space-y-4">
                        <div className="relative p-2 border-2 border-dashed rounded-lg">
                             <video ref={videoRef} className="w-full aspect-square rounded-md" autoPlay muted playsInline />
                             <canvas ref={canvasRef} className="hidden" />
                        </div>
                        {hasCameraPermission === false && (
                            <Alert variant="destructive">
                                <CameraOff className="h-4 w-4" />
                                <AlertTitle>Camera Access Denied</AlertTitle>
                                <AlertDescription>
                                    Please allow camera access in your browser to use this feature.
                                </AlertDescription>
                            </Alert>
                        )}
                         <Button onClick={handleTakePicture} disabled={isLoading || hasCameraPermission === false} className="w-full">
                            <Camera className="mr-2 h-4 w-4" />
                            Take Picture
                        </Button>
                    </div>
                )}

                {inputMode === 'manual' && (
                     <div className="space-y-4">
                        <Textarea 
                            placeholder="e.g., 2 slices of whole wheat toast with avocado and a fried egg"
                            value={manualMealDescription}
                            onChange={(e) => setManualMealDescription(e.target.value)}
                            rows={4}
                        />
                    </div>
                )}
                
                <Button onClick={handleAnalyze} disabled={isLoading || (inputMode !== 'manual' && !preview) || (inputMode === 'manual' && !manualMealDescription) } className="w-full [filter:drop-shadow(0_0_6px_hsl(var(--primary)/0.8))]">
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
