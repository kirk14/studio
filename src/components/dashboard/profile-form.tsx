
"use client";

import { useContext } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "../ui/button";
import { UserContext } from "@/context/user-context";

export function ProfileForm() {
    const userContext = useContext(UserContext);

    const firebaseUser = userContext?.firebaseUser;
    const userProfile = userContext?.userProfile;
    const isLoading = userContext?.isLoading;

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
                 <div className="flex justify-end">
                    <Button disabled>Edit Profile</Button>
                </div>
            </CardContent>
        </Card>
    );
}
