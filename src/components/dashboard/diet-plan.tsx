import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { RecipeCard } from "./recipe-card";
import type { Meal } from "@/lib/types";
import { ScrollArea } from "../ui/scroll-area";

const placeholderMeals: Meal[] = [
    {
        name: "Grilled Chicken Salad",
        calories: 450,
        macros: { protein: 40, carbs: 20, fats: 22 },
        recipe: "1. Grill 150g chicken breast.\n2. Chop lettuce, tomatoes, cucumbers.\n3. Mix with olive oil dressing.\n4. Top with chicken.",
        prepTime: "20 min",
        imageUrl: "https://picsum.photos/seed/chickensalad/600/400",
        imageHint: "grilled chicken"
    },
    {
        name: "Quinoa Bowl",
        calories: 550,
        macros: { protein: 25, carbs: 70, fats: 18 },
        recipe: "1. Cook 1 cup of quinoa.\n2. Add black beans, corn, and avocado.\n3. Squeeze lime juice on top.",
        prepTime: "25 min",
        imageUrl: "https://picsum.photos/seed/quinoabowl/600/400",
        imageHint: "quinoa bowl"
    },
    {
        name: "Salmon with Asparagus",
        calories: 600,
        macros: { protein: 45, carbs: 15, fats: 40 },
        recipe: "1. Season 200g salmon fillet.\n2. Bake at 200°C for 15 mins.\n3. Roast asparagus with olive oil.",
        prepTime: "20 min",
        imageUrl: "https://picsum.photos/seed/salmon/600/400",
        imageHint: "grilled salmon"
    }
];

export function DietPlan() {
    return (
        <Card className="h-full flex flex-col">
            <CardHeader>
                <CardTitle>Today's Diet Plan</CardTitle>
                <CardDescription>Your personalized meals for the day.</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
                <ScrollArea className="h-[550px] pr-4">
                    <div className="space-y-8">
                        {placeholderMeals.map((meal) => (
                            <RecipeCard key={meal.name} meal={meal} />
                        ))}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
}
