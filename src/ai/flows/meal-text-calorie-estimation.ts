'use server';
/**
 * @fileOverview An AI agent that estimates calories and macros from a meal description.
 *
 * - estimateMealCaloriesFromText - A function that handles the meal calorie estimation process from text.
 * - EstimateMealCaloriesFromTextInput - The input type for the estimateMealCaloriesFromText function.
 * - EstimateMealCaloriesFromTextOutput - The return type for the estimateMealCaloriesFromText function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EstimateMealCaloriesFromTextInputSchema = z.object({
  mealDescription: z
    .string()
    .describe(
      "A text description of a meal."
    ),
});
export type EstimateMealCaloriesFromTextInput = z.infer<typeof EstimateMealCaloriesFromTextInputSchema>;

const EstimateMealCaloriesFromTextOutputSchema = z.object({
  estimatedCalories: z.number().describe('The estimated calorie count of the meal.'),
  estimatedMacros: z.object({
    protein: z.number().describe('The estimated protein content of the meal in grams.'),
    carbs: z.number().describe('The estimated carbohydrate content of the meal in grams.'),
    fats: z.number().describe('The estimated fat content of the meal in grams.'),
  }).describe('The estimated macronutrient breakdown of the meal.'),
});
export type EstimateMealCaloriesFromTextOutput = z.infer<typeof EstimateMealCaloriesFromTextOutputSchema>;

export async function estimateMealCaloriesFromText(input: EstimateMealCaloriesFromTextInput): Promise<EstimateMealCaloriesFromTextOutput> {
  return estimateMealCaloriesFromTextFlow(input);
}

const prompt = ai.definePrompt({
  name: 'estimateMealCaloriesFromTextPrompt',
  input: {schema: EstimateMealCaloriesFromTextInputSchema},
  output: {schema: EstimateMealCaloriesFromTextOutputSchema},
  prompt: `You are an expert nutritionist. You will analyze the provided text description of a meal and estimate its calorie count and macronutrient breakdown (protein, carbs, and fats).

  Analyze the meal in the following description:
  "{{{mealDescription}}}"

  Provide the estimated calorie count and macronutrient breakdown.
  `,
});

const estimateMealCaloriesFromTextFlow = ai.defineFlow(
  {
    name: 'estimateMealCaloriesFromTextFlow',
    inputSchema: EstimateMealCaloriesFromTextInputSchema,
    outputSchema: EstimateMealCaloriesFromTextOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
