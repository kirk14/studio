"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Apple, ArrowRight, ArrowLeft, User, Phone, Mail, KeyRound, Weight, Ruler, HeartPulse, Beef, ChefHat, Salad, Goal, Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Progress } from "@/components/ui/progress";
import { signupSchema, type SignupFormValues } from "@/lib/schemas";
import { auth, db } from '@/lib/firebase';
import { createUserWithEmailAndPassword, onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px" {...props}>
        <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
        <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
        <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
        <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C42.012,35.24,44,30.025,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
    </svg>
);

const steps = [
    { id: 'Step 1', name: 'Account & Role', fields: ['name', 'email', 'password', 'phone', 'role'] },
    { id: 'Step 2', name: 'Basic Health', fields: ['height', 'weight', 'medicalCondition', 'activityLevel'] },
    { id: 'Step 3', name: 'Preferences & Goals', fields: ['vegOrNonVeg', 'cuisine', 'restrictions', 'goalType', 'targetWeight', 'targetDate'] },
];

export function SignupForm() {
    const router = useRouter();
    const { toast } = useToast();
    const [currentStep, setCurrentStep] = useState(0);
    const [bmi, setBmi] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);

    const form = useForm<SignupFormValues>({
        resolver: zodResolver(signupSchema),
        defaultValues: {
            name: '', email: '', password: '',
            height: 0, weight: 0,
            medicalCondition: '', restrictions: '', cuisine: ''
        },
    });

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setFirebaseUser(user);
            if (user) {
                form.setValue('email', user.email || '');
                form.setValue('name', user.displayName || '');
            }
        });
        return unsubscribe;
    }, [form]);

    const { watch } = form;
    const height = watch('height');
    const weight = watch('weight');

    React.useEffect(() => {
        if (height > 0 && weight > 0) {
            const heightInMeters = height / 100;
            const calculatedBmi = weight / (heightInMeters * heightInMeters);
            setBmi(parseFloat(calculatedBmi.toFixed(1)));
        } else {
            setBmi(null);
        }
    }, [height, weight]);

    const progress = useMemo(() => ((currentStep + 1) / steps.length) * 100, [currentStep]);

    const next = async () => {
        const fields = steps[currentStep].fields;
        const output = await form.trigger(fields as any, { shouldFocus: true });
        if (!output) return;
        if (currentStep < steps.length - 1) {
            setCurrentStep(step => step + 1);
        }
    };

    const prev = () => {
        if (currentStep > 0) {
            setCurrentStep(step => step - 1);
        }
    };

    async function onSubmit(data: SignupFormValues) {
        setIsLoading(true);
        try {
            let user: FirebaseUser | null = firebaseUser;

            // If not logged in via Google, create user with email/password
            if (!user) {
                const { email, password } = data;
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                user = userCredential.user;
            }
            
            if (!user) {
                throw new Error("Authentication failed.");
            }

            const { password, ...rest } = data; // Exclude password from DB
            const userData = {
                uid: user.uid,
                email: user.email,
                ...rest,
                targetDate: format(data.targetDate, "yyyy-MM-dd"),
                bmi,
            };

            await setDoc(doc(db, "users", user.uid), userData);

            toast({
                title: "Account Created",
                description: "Your account has been successfully created.",
            });
            router.push("/dashboard");

        } catch (error: any) {
             toast({
                variant: "destructive",
                title: "Uh oh! Something went wrong.",
                description: error.message || "There was a problem with your request.",
            });
        } finally {
            setIsLoading(false);
        }
    }
    
    return (
        <Card className="border-0 shadow-none">
            <CardHeader>
                <CardTitle className="text-center">{steps[currentStep].name}</CardTitle>
                <CardDescription className="text-center">
                    {currentStep === 0 && "Create your GuardianHealth account."}
                    {currentStep === 1 && "Tell us about your health status."}
                    {currentStep === 2 && "Set up your diet and health objectives."}
                </CardDescription>
                <Progress value={progress} className="mt-4 h-2" />
            </CardHeader>

            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        {/* Step 1 */}
                        {currentStep === 0 && (
                            <div className="space-y-4">
                                {!firebaseUser && (
                                <>
                                    <div className="grid grid-cols-2 gap-4">
                                        <Button variant="outline" className="w-full" disabled={true}><GoogleIcon className="mr-2 h-5 w-5"/> Google</Button>
                                        <Button variant="outline" className="w-full" disabled={true}><Apple className="mr-2 h-5 w-5"/> Apple</Button>
                                    </div>
                                    <div className="relative">
                                        <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
                                        <div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-2 text-muted-foreground">Or</span></div>
                                    </div>
                                </>
                                )}
                                <FormField control={form.control} name="name" render={({ field }) => (
                                    <FormItem>
                                        <FormControl><div className="relative"><User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Full Name" {...field} className="pl-10" /></div></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}/>
                                <FormField control={form.control} name="email" render={({ field }) => (
                                    <FormItem>
                                        <FormControl><div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="email@example.com" {...field} className="pl-10" disabled={!!firebaseUser} /></div></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}/>
                                {!firebaseUser && (
                                    <FormField control={form.control} name="password" render={({ field }) => (
                                        <FormItem>
                                            <FormControl><div className="relative"><KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input type="password" placeholder="Password" {...field} className="pl-10" /></div></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}/>
                                )}
                                <div className="grid grid-cols-2 gap-4">
                                <FormField control={form.control} name="phone" render={({ field }) => (
                                    <FormItem>
                                        <FormControl><div className="relative"><Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Phone Number" {...field} className="pl-10" /></div></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}/>
                                <FormField control={form.control} name="role" render={({ field }) => (
                                    <FormItem>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger><SelectValue placeholder="Select your role" /></SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="father">Father</SelectItem>
                                                <SelectItem value="mother">Mother</SelectItem>
                                                <SelectItem value="son">Son</SelectItem>
                                                <SelectItem value="daughter">Daughter</SelectItem>
                                                <SelectItem value="cousin">Cousin</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}/>
                                </div>
                            </div>
                        )}
                        {/* Step 2 */}
                        {currentStep === 1 && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField control={form.control} name="height" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Height (cm)</FormLabel>
                                            <FormControl><div className="relative"><Ruler className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input type="number" {...field} className="pl-10" /></div></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}/>
                                    <FormField control={form.control} name="weight" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Weight (kg)</FormLabel>
                                            <FormControl><div className="relative"><Weight className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input type="number" {...field} className="pl-10" /></div></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}/>
                                </div>
                                <div className="p-4 rounded-lg bg-muted/50 text-center">
                                    <p className="text-sm text-muted-foreground">Your BMI</p>
                                    <p className="text-2xl font-bold text-primary">{bmi ?? "..."}</p>
                                </div>
                                <FormField control={form.control} name="medicalCondition" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Medical Conditions</FormLabel>
                                        <FormControl><div className="relative"><HeartPulse className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="e.g., Diabetes, Hypertension" {...field} className="pl-10" /></div></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}/>
                                <FormField control={form.control} name="activityLevel" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Lifestyle</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl><SelectTrigger><SelectValue placeholder="Select your activity level" /></SelectTrigger></FormControl>
                                            <SelectContent>
                                                <SelectItem value="sedentary">Sedentary (little or no exercise)</SelectItem>
                                                <SelectItem value="lightly active">Lightly Active (light exercise/sports 1-3 days/week)</SelectItem>
                                                <SelectItem value="moderately active">Moderately Active (moderate exercise/sports 3-5 days/week)</SelectItem>
                                                <SelectItem value="very active">Very Active (hard exercise/sports 6-7 days a week)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}/>
                            </div>
                        )}
                        {/* Step 3 */}
                        {currentStep === 2 && (
                             <div className="space-y-4">
                                <FormField control={form.control} name="vegOrNonVeg" render={({ field }) => (
                                    <FormItem className="space-y-3">
                                        <FormLabel>Dietary Preference</FormLabel>
                                        <FormControl>
                                            <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex items-center space-x-4">
                                                <FormItem className="flex items-center space-x-2 space-y-0">
                                                    <FormControl><RadioGroupItem value="vegetarian" /></FormControl>
                                                    <FormLabel className="font-normal flex items-center gap-2"><Salad className="h-4 w-4"/>Vegetarian</FormLabel>
                                                </FormItem>
                                                <FormItem className="flex items-center space-x-2 space-y-0">
                                                    <FormControl><RadioGroupItem value="non-vegetarian" /></FormControl>
                                                    <FormLabel className="font-normal flex items-center gap-2"><Beef className="h-4 w-4"/>Non-Vegetarian</FormLabel>
                                                </FormItem>
                                            </RadioGroup>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}/>
                                <FormField control={form.control} name="cuisine" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Preferred Cuisine</FormLabel>
                                        <FormControl><div className="relative"><ChefHat className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="e.g., Italian, Indian" {...field} className="pl-10" /></div></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}/>
                                 <FormField control={form.control} name="restrictions" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Dietary Restrictions</FormLabel>
                                        <FormControl><Input placeholder="e.g., Gluten-free, lactose intolerant" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}/>

                                <div className="grid grid-cols-2 gap-4">
                                <FormField control={form.control} name="goalType" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Health Goal</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl><SelectTrigger><div className="flex items-center gap-2"><Goal className="h-4 w-4" /><SelectValue placeholder="Goal" /></div></SelectTrigger></FormControl>
                                            <SelectContent>
                                                <SelectItem value="weight loss">Weight Loss</SelectItem>
                                                <SelectItem value="muscle gain">Muscle Gain</SelectItem>
                                                <SelectItem value="maintenance">Maintenance</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}/>
                                <FormField control={form.control} name="targetWeight" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Target Weight (kg)</FormLabel>
                                        <FormControl><div className="relative"><Weight className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input type="number" {...field} className="pl-10" /></div></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}/>
                                </div>
                                <FormField control={form.control} name="targetDate" render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                    <FormLabel>Target Date</FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button variant={"outline"} className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                            {field.value ? (format(field.value, "PPP")) : (<span>Pick a date</span>)}
                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                            </Button>
                                        </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date < new Date()} initialFocus />
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                    </FormItem>
                                )}/>
                            </div>
                        )}
                        
                        <div className="flex gap-4 pt-4">
                            {currentStep > 0 && (
                                <Button type="button" onClick={prev} variant="outline" className="w-full" disabled={isLoading}>
                                    <ArrowLeft className="mr-2 h-4 w-4"/> Previous
                                </Button>
                            )}
                            {currentStep < steps.length - 1 && (
                                <Button type="button" onClick={next} className="w-full [filter:drop-shadow(0_0_6px_hsl(var(--primary)/0.8))]" disabled={isLoading}>
                                    Next <ArrowRight className="ml-2 h-4 w-4"/>
                                </Button>
                            )}
                            {currentStep === steps.length - 1 && (
                                <Button type="submit" disabled={isLoading} className="w-full [filter:drop-shadow(0_0_6px_hsl(var(--primary)/0.8))]">
                                     {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Create Account'}
                                </Button>
                            )}
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
