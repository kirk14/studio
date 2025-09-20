
"use client";

import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged, type User as FirebaseAuthUser } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { type User as AppUser } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "../ui/button";

export function ProfileForm() {
    const [firebaseUser, setFirebaseUser] = useState<FirebaseAuthUser | null>(null);
    const [userProfile, setUserProfile] = useState<AppUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setFirebaseUser(user);
                try {
                    const userDocRef = doc(db, "users", user.uid);
                    const userDoc = await getDoc(userDocRef);
                    if (userDoc.exists()) {
                        setUserProfile(userDoc.data() as AppUser);
                    }
                } catch (error) {
                    console.error("Error fetching user profile:", error);
                }
            } else {
                setFirebaseUser(null);
                setUserProfile(null);
            }
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const getInitials = (name: string | null | undefined) => {
        if (!name) return 'U';
        return name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase();
      };
    
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
                        <Input id="height" value={`${userProfile.personalInfo.height} cm`} readOnly />
                    </div>
                    <div>
                        <Label htmlFor="weight">Weight</Label>
                        <Input id="weight" value={`${userProfile.personalInfo.weight} kg`} readOnly />
                    </div>
                    <div>
                        <Label htmlFor="bmi">BMI</Label>
                        <Input id="bmi" value={userProfile.personalInfo.BMI} readOnly />
                    </div>
                    <div>
                        <Label htmlFor="activityLevel">Activity Level</Label>
                        <Input id="activityLevel" value={userProfile.lifestyleHabits.activityLevel} readOnly className="capitalize"/>
                    </div>
                     <div>
                        <Label htmlFor="goal">Health Goal</Label>
                        <Input id="goal" value={userProfile.healthGoals.goalType} readOnly className="capitalize"/>
                    </div>
                    <div>
                        <Label htmlFor="targetWeight">Target Weight</Label>
                        <Input id="targetWeight" value={`${userProfile.healthGoals.targetWeight} kg`} readOnly />
                    </div>
                </div>
                 <div className="flex justify-end">
                    <Button disabled>Edit Profile</Button>
                </div>
            </CardContent>
        </Card>
    );
}
