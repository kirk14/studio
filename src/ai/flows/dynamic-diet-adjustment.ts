'use server';

/**
 * @fileOverview A flow that adjusts the user's diet plan based on wearable data.
 *
 * - adjustDietPlan - A function that adjusts the diet plan based on user activity data.
 * - AdjustDietPlanInput - The input type for the adjustDietPlan function.
 * - AdjustDietPlanOutput - The return type for the adjustDietPlan function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AdjustDietPlanInputSchema = z.object({
  userId: z.string().describe('The ID of the user whose diet plan needs adjustment.'),
  steps: z.number().describe('The number of steps taken by the user today.'),
  caloriesBurned: z.number().describe('The number of calories burned by the user today.'),
  currentDietPlan: z.string().describe('The current diet plan of the user in JSON format.'),
});
export type AdjustDietPlanInput = z.infer<typeof AdjustDietPlanInputSchema>;

const AdjustDietPlanOutputSchema = z.object({
  adjustedDietPlan: z.string().describe('The adjusted diet plan in JSON format.'),
  reason: z.string().describe('The reason for the diet plan adjustment.'),
});
export type AdjustDietPlanOutput = z.infer<typeof AdjustDietPlanOutputSchema>;

export async function adjustDietPlan(input: AdjustDietPlanInput): Promise<AdjustDietPlanOutput> {
  return adjustDietPlanFlow(input);
}

const prompt = ai.definePrompt({
  name: 'adjustDietPlanPrompt',
  input: {schema: AdjustDietPlanInputSchema},
  output: {schema: AdjustDietPlanOutputSchema},
  prompt: `You are a personal nutrition assistant. Your task is to adjust the user's diet plan based on their activity data.

  User ID: {{{userId}}}
  Steps taken: {{{steps}}}
  Calories burned: {{{caloriesBurned}}}
  Current diet plan: {{{currentDietPlan}}}

  Analyze the user's activity data and current diet plan. If the user has burned more calories than planned, suggest increasing the calorie intake. If the user has been less active, suggest reducing the calorie intake. Provide the adjusted diet plan in JSON format and explain the reason for the adjustment.

  Ensure the adjusted diet plan maintains a balanced macro ratio.

  Output the adjusted diet plan in JSON format, along with the reason for the adjustments.
  `,
});

const adjustDietPlanFlow = ai.defineFlow(
  {
    name: 'adjustDietPlanFlow',
    inputSchema: AdjustDietPlanInputSchema,
    outputSchema: AdjustDietPlanOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
