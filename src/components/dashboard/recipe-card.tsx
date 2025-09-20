"use client";

import type { Meal } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Clock, Flame } from "lucide-react";

export function RecipeCard({ meal }: { meal: Meal }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{meal.name}</CardTitle>
        <div className="flex justify-between items-center text-sm text-muted-foreground pt-2">
            <div className="flex items-center gap-1">
              <Flame className="h-4 w-4 text-secondary" />
              <span>{meal.calories} kcal</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4 text-accent" />
              <span>{meal.prepTime}</span>
            </div>
          </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
            <h4 className="font-bold text-md text-primary mb-2">Recipe</h4>
            <p className="text-sm text-muted-foreground whitespace-pre-line">
              {meal.recipe}
            </p>
        </div>
        <div>
            <h4 className="font-bold text-md text-primary mt-4 mb-2">Macros</h4>
            <div className="text-sm text-muted-foreground space-y-1">
                <p>Protein: {meal.macros.protein}g</p>
                <p>Carbs: {meal.macros.carbs}g</p>
                <p>Fats: {meal.macros.fats}g</p>
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
