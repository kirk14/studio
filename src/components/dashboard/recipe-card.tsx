"use client";

import type { Meal } from "@/lib/types";
import Image from "next/image";
import { Card, CardContent } from "../ui/card";
import { Clock, Zap, Flame } from "lucide-react";

export function RecipeCard({ meal }: { meal: Meal }) {
  return (
    <div className="group w-full h-80 [perspective:1000px]">
      <div className="relative h-full w-full rounded-xl shadow-xl transition-all duration-500 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]">
        {/* Front of card */}
        <div className="absolute inset-0 [backface-visibility:hidden]">
          <Card className="h-full w-full overflow-hidden">
            <Image
              src={meal.imageUrl}
              alt={meal.name}
              width={600}
              height={400}
              className="w-full h-3/5 object-cover"
              data-ai-hint={meal.imageHint}
            />
            <CardContent className="p-4">
              <h3 className="font-bold text-lg">{meal.name}</h3>
              <div className="flex justify-between items-center text-sm text-muted-foreground mt-2">
                <div className="flex items-center gap-1">
                  <Flame className="h-4 w-4 text-secondary" />
                  <span>{meal.calories} kcal</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4 text-accent" />
                  <span>{meal.prepTime}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        {/* Back of card */}
        <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)]">
          <Card className="h-full w-full p-4 overflow-y-auto">
            <h4 className="font-bold text-md text-primary mb-2">Recipe</h4>
            <p className="text-sm text-muted-foreground whitespace-pre-line">
              {meal.recipe}
            </p>
            <h4 className="font-bold text-md text-primary mt-4 mb-2">Macros</h4>
            <div className="text-sm text-muted-foreground space-y-1">
                <p>Protein: {meal.macros.protein}g</p>
                <p>Carbs: {meal.macros.carbs}g</p>
                <p>Fats: {meal.macros.fats}g</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
