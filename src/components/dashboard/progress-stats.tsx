
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { ProgressRing } from "./progress-ring";
import type { ConsumedMacros } from "@/lib/types";

interface ProgressStatsProps {
    consumed: ConsumedMacros;
    targets: ConsumedMacros;
}

export function ProgressStats({ consumed, targets }: ProgressStatsProps) {
    const calculatePercentage = (consumed: number, target: number) => {
        if (target === 0) return 0;
        return Math.min(Math.round((consumed / target) * 100), 100);
    };

    const stats = [
        { 
            percentage: calculatePercentage(consumed.calories, targets.calories), 
            label: 'Calories', 
            value: `${consumed.calories}/${targets.calories} kcal`, 
            colorClass: 'text-primary', 
            glowClass: 'glow-primary' 
        },
        { 
            percentage: calculatePercentage(consumed.protein, targets.protein), 
            label: 'Protein', 
            value: `${consumed.protein}/${targets.protein} g`, 
            colorClass: 'text-secondary', 
            glowClass: 'glow-secondary' 
        },
        { 
            percentage: calculatePercentage(consumed.carbs, targets.carbs), 
            label: 'Carbs', 
            value: `${consumed.carbs}/${targets.carbs} g`, 
            colorClass: 'text-accent', 
            glowClass: 'glow-accent' 
        },
        { 
            percentage: calculatePercentage(consumed.fats, targets.fats), 
            label: 'Fats', 
            value: `${consumed.fats}/${targets.fats} g`, 
            colorClass: 'text-chart-4', 
            glowClass: 'glow-yellow' 
        },
    ];

    return (
        <>
        {stats.map((stat) => (
            <Card key={stat.label} className="flex flex-col items-center justify-center pt-6">
                <CardContent>
                    <ProgressRing {...stat} />
                </CardContent>
            </Card>
        ))}
        </>
    );
}
