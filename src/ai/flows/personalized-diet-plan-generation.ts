'use server';
/**
 * @fileOverview This file defines a Genkit flow for generating personalized diet plans.
 *
 * The flow takes user profile information, dietary preferences, and health goals as input, and uses
 * a language model to generate a personalized daily diet plan.
 *
 * @exports {generatePersonalizedDietPlan} - The main function to trigger the diet plan generation flow.
 * @exports {PersonalizedDietPlanInput} - The input type for the generatePersonalizedDietPlan function.
 * @exports {PersonalizedDietPlanOutput} - The output type for the generatePersonalizedDietPlan function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Define the input schema
const PersonalizedDietPlanInputSchema = z.object({
  userID: z.string().describe('The unique ID of the user.'),
  name: z.string().describe('The name of the user.'),
  role: z.string().describe('The role of the user (e.g., father, mother, son, daughter, cousin).'),
  personalInfo: z.object({
    height: z.number().describe('The height of the user in centimeters.'),
    weight: z.number().describe('The weight of the user in kilograms.'),
    bmi: z.number().describe('The Body Mass Index of the user.'),
  }).describe('The personal information of the user including height, weight and BMI.'),
  medicalCondition: z.string().describe('Any medical conditions the user has.'),
  lifestyleHabits: z.object({
    activityLevel: z.string().describe('The activity level of the user (e.g., sedentary, lightly active, moderately active, very active).'),
    sleepPattern: z.string().describe('The sleep pattern of the user.'),
    workShift: z.string().describe('The work shift of the user.'),
  }).describe('The lifestyle habits of the user including activity level, sleep pattern and work shift.'),
  dietaryPreferences: z.object({
    vegOrNonVeg: z.string().describe('Whether the user is vegetarian or non-vegetarian.'),
    cuisine: z.string().describe('The preferred cuisine of the user.'),
    restrictions: z.string().describe('Any dietary restrictions the user has.'),
  }).describe('The dietary preferences of the user including vegOrNonVeg, cuisine and restrictions.'),
  healthGoals: z.object({
    goalType: z.string().describe('The type of health goal (e.g., weight loss, muscle gain).'),
    targetWeight: z.number().describe('The target weight of the user in kilograms.'),
    targetDate: z.string().describe('The target date for the health goal.'),
  }).describe('The health goals of the user including goal type, target weight and target date.'),
});

export type PersonalizedDietPlanInput = z.infer<typeof PersonalizedDietPlanInputSchema>;

// Define the output schema
const PersonalizedDietPlanOutputSchema = z.object({
  dailyPlan: z.object({
    meals: z.array(
      z.object({
        name: z.string().describe('The name of the meal.'),
        calories: z.number().describe('The number of calories in the meal.'),
        macros: z.object({
          protein: z.number().describe('The amount of protein in grams.'),
          carbs: z.number().describe('The amount of carbohydrates in grams.'),
          fats: z.number().describe('The amount of fats in grams.'),
        }).describe('The macro-nutrient breakdown of the meal.'),
        recipe: z.string().describe('The recipe for the meal.'),
        prepTime: z.string().describe('The preparation time for the meal.'),
      })
    ).describe('An array of meals for the day.'),
  }).describe('The daily diet plan.'),
});

export type PersonalizedDietPlanOutput = z.infer<typeof PersonalizedDietPlanOutputSchema>;

// Define the prompt
const personalizedDietPlanPrompt = ai.definePrompt({
  name: 'personalizedDietPlanPrompt',
  input: {schema: PersonalizedDietPlanInputSchema},
  output: {schema: PersonalizedDietPlanOutputSchema},
  prompt: `You are an expert nutritionist. Generate a personalized daily diet plan for the user based on their profile, dietary preferences, and health goals.  The diet plan should align with the user's preferences and restrictions.

User ID: {{{userID}}}
Name: {{{name}}}
Role: {{{role}}}
Personal Info: Height- {{{personalInfo.height}}}cm, Weight- {{{personalInfo.weight}}}kg, BMI- {{{personalInfo.bmi}}}
Medical Condition: {{{medicalCondition}}}
Lifestyle Habits: Activity Level- {{{lifestyleHabits.activityLevel}}}, Sleep Pattern- {{{lifestyleHabits.sleepPattern}}}, Work Shift- {{{lifestyleHabits.workShift}}}
Dietary Preferences: Veg/Non-Veg- {{{dietaryPreferences.vegOrNonVeg}}}, Cuisine- {{{dietaryPreferences.cuisine}}}, Restrictions- {{{dietaryPreferences.restrictions}}}
Health Goals: Goal Type- {{{healthGoals.goalType}}}, Target Weight- {{{healthGoals.targetWeight}}}kg, Target Date- {{{healthGoals.targetDate}}}

Ensure that the generated diet plan is realistic and achievable for the user, considering their lifestyle and preferences. Provide detailed recipes and preparation times for each meal.
`,
});

// Define the flow
const personalizedDietPlanFlow = ai.defineFlow(
  {
    name: 'personalizedDietPlanFlow',
    inputSchema: PersonalizedDietPlanInputSchema,
    outputSchema: PersonalizedDietPlanOutputSchema,
  },
  async (input) => {
    const {output} = await personalizedDietPlanPrompt(input);
    return output!;
  }
);

/**
 * Generates a personalized diet plan for a user.
 * @param input - The input containing user profile, dietary preferences, and health goals.
 * @returns A promise that resolves to the generated diet plan.
 */
export async function generatePersonalizedDietPlan(input: PersonalizedDietPlanInput): Promise<PersonalizedDietPlanOutput> {
  return personalizedDietPlanFlow(input);
}
