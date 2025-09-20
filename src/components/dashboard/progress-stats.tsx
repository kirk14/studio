import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ProgressRing } from "./progress-ring";

export function ProgressStats() {
    const stats = [
        { percentage: 76, label: 'Calories', value: '1800/2400 kcal', colorClass: 'text-primary', glowClass: 'glow-primary' },
        { percentage: 85, label: 'Protein', value: '120/140 g', colorClass: 'text-secondary', glowClass: 'glow-secondary' },
        { percentage: 60, label: 'Carbs', value: '180/300 g', colorClass: 'text-accent', glowClass: 'glow-accent' },
        { percentage: 90, label: 'Fats', value: '63/70 g', colorClass: 'text-chart-4', glowClass: 'glow-yellow' },
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
