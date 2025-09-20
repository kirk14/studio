"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Minus, Plus, GlassWater } from "lucide-react";

export function HydrationMeter() {
    const [glasses, setGlasses] = useState(0);
    const dailyGoal = 8;
    const progress = Math.min((glasses / dailyGoal) * 100, 100);

    const handleIncrement = () => {
        setGlasses(prev => prev + 1);
    };

    const handleDecrement = () => {
        setGlasses(prev => Math.max(0, prev - 1));
    };

    return (
        <Card className="h-full flex flex-col">
            <CardHeader>
                <CardTitle>Hydration Meter</CardTitle>
                <CardDescription>Track your daily water intake.</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col items-center justify-center gap-4">
                <div className="relative h-40 w-40">
                    <svg className="h-full w-full" viewBox="0 0 100 100">
                        <circle
                            className="text-muted/20"
                            strokeWidth="10"
                            stroke="currentColor"
                            fill="transparent"
                            r="45"
                            cx="50"
                            cy="50"
                        />
                        <circle
                            className="text-blue-400 transition-all duration-500"
                            strokeWidth="10"
                            strokeDasharray={2 * Math.PI * 45}
                            strokeDashoffset={(2 * Math.PI * 45) - (progress / 100) * (2 * Math.PI * 45)}
                            strokeLinecap="round"
                            stroke="currentColor"
                            fill="transparent"
                            r="45"
                            cx="50"
                            cy="50"
                            transform="rotate(-90 50 50)"
                            style={{
                                filter: `drop-shadow(0 0 4px currentColor)`,
                            }}
                        />
                        <GlassWater className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-10 w-10 text-blue-400" />
                    </svg>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                         <span className="text-3xl font-bold text-foreground">{glasses}</span>
                         <span className="text-sm text-muted-foreground">/{dailyGoal} glasses</span>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" onClick={handleDecrement} disabled={glasses === 0}>
                        <Minus className="h-4 w-4" />
                    </Button>
                    <span className="text-xl font-semibold w-12 text-center">{glasses}</span>
                    <Button variant="outline" size="icon" onClick={handleIncrement}>
                        <Plus className="h-4 w-4" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
