'use server';
/**
 * @fileOverview An AI agent that estimates calories and macros from a meal image.
 *
 * - estimateMealCalories - A function that handles the meal calorie estimation process.
 * - EstimateMealCaloriesInput - The input type for the estimateMealCalories function.
 * - EstimateMealCaloriesOutput - The return type for the estimateMealCalories function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EstimateMealCaloriesInputSchema = z.object({
  mealImageDataUri: z
    .string()
    .describe(
      "A photo of a meal, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type EstimateMealCaloriesInput = z.infer<typeof EstimateMealCaloriesInputSchema>;

const EstimateMealCaloriesOutputSchema = z.object({
  estimatedCalories: z.number().describe('The estimated calorie count of the meal.'),
  estimatedMacros: z.object({
    protein: z.number().describe('The estimated protein content of the meal in grams.'),
    carbs: z.number().describe('The estimated carbohydrate content of the meal in grams.'),
    fats: z.number().describe('The estimated fat content of the meal in grams.'),
  }).describe('The estimated macronutrient breakdown of the meal.'),
});
export type EstimateMealCaloriesOutput = z.infer<typeof EstimateMealCaloriesOutputSchema>;

export async function estimateMealCalories(input: EstimateMealCaloriesInput): Promise<EstimateMealCaloriesOutput> {
  return estimateMealCaloriesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'estimateMealCaloriesPrompt',
  input: {schema: EstimateMealCaloriesInputSchema},
  output: {schema: EstimateMealCaloriesOutputSchema},
  prompt: `You are an expert nutritionist. You will analyze the provided image of a meal and estimate its calorie count and macronutrient breakdown (protein, carbs, and fats).

  Analyze the meal in the following image:
  {{media url=mealImageDataUri}}

  Provide the estimated calorie count and macronutrient breakdown.
  `,
});

const estimateMealCaloriesFlow = ai.defineFlow(
  {
    name: 'estimateMealCaloriesFlow',
    inputSchema: EstimateMealCaloriesInputSchema,
    outputSchema: EstimateMealCaloriesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
