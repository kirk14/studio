'use server';
/**
 * @fileOverview An AI agent that classifies health metrics.
 *
 * - classifyHealthMetrics - A function that classifies health metrics into categories like Normal, High, Low.
 * - ClassifyHealthMetricsInput - The input type for the classifyHealthMetrics function.
 * - ClassifyHealthMetricsOutput - The return type for the classifyHealthMetrics function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ClassifyHealthMetricsInputSchema = z.object({
  bloodPressure: z.string().optional().describe("The user's blood pressure, e.g., '120/80 mmHg'."),
  bloodSugar: z.string().optional().describe("The user's blood sugar level, e.g., '90 mg/dL'."),
  cholesterol: z.string().optional().describe("The user's total cholesterol level, e.g., '180 mg/dL'."),
  spO2: z.string().optional().describe("The user's blood oxygen saturation level, e.g., '98%'."),
});
export type ClassifyHealthMetricsInput = z.infer<typeof ClassifyHealthMetricsInputSchema>;

const ClassificationSchema = z.enum(["Normal", "High", "Low", "Slightly High", "Slightly Low", "Very High", "Very Low", "N/A"]);

const ClassifyHealthMetricsOutputSchema = z.object({
  bloodPressure: ClassificationSchema.describe("Classification of the blood pressure."),
  bloodSugar: ClassificationSchema.describe("Classification of the blood sugar level."),
  cholesterol: ClassificationSchema.describe("Classification of the total cholesterol level."),
  spO2: ClassificationSchema.describe("Classification of the blood oxygen saturation level."),
});
export type ClassifyHealthMetricsOutput = z.infer<typeof ClassifyHealthMetricsOutputSchema>;

export async function classifyHealthMetrics(input: ClassifyHealthMetricsInput): Promise<ClassifyHealthMetricsOutput> {
  return classifyHealthMetricsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'classifyHealthMetricsPrompt',
  input: {schema: ClassifyHealthMetricsInputSchema},
  output: {schema: ClassifyHealthMetricsOutputSchema},
  prompt: `You are a health data analyst. Your task is to classify the provided health metrics.
  Use the following standard medical guidelines for classification:
  - **Blood Pressure**:
    - Normal: < 120/80 mmHg
    - Slightly High (Elevated): 120-129/<80 mmHg
    - High (Hypertension Stage 1): 130-139/80-89 mmHg
    - Very High (Hypertension Stage 2): >= 140/90 mmHg
    - Low (Hypotension): < 90/60 mmHg
  - **Blood Sugar** (Fasting):
    - Normal: < 100 mg/dL
    - Slightly High (Prediabetes): 100-125 mg/dL
    - High (Diabetes): >= 126 mg/dL
    - Low: < 70 mg/dL
  - **Total Cholesterol**:
    - Normal: < 200 mg/dL
    - Slightly High (Borderline High): 200-239 mg/dL
    - High: >= 240 mg/dL
  - **SpO2** (Blood Oxygen Saturation):
    - Normal: 95-100%
    - Low: 90-94%
    - Very Low: < 90%

  Classify the following metrics. If a value is not present or not in a recognizable format, classify it as 'N/A'.

  - Blood Pressure: {{{bloodPressure}}}
  - Blood Sugar: {{{bloodSugar}}}
  - Cholesterol: {{{cholesterol}}}
  - SpO2: {{{spO2}}}

  Provide the classification for each metric in the specified JSON format.
  `,
});

const classifyHealthMetricsFlow = ai.defineFlow(
  {
    name: 'classifyHealthMetricsFlow',
    inputSchema: ClassifyHealthMetricsInputSchema,
    outputSchema: ClassifyHealthMetricsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
