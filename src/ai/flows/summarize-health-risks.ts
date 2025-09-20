'use server';
/**
 * @fileOverview An AI agent that summarizes potential health risks based on medical metrics.
 *
 * - summarizeHealthRisks - A function that provides a summary of health risks.
 * - SummarizeHealthRisksInput - The input type for the summarizeHealthRisks function.
 * - SummarizeHealthRisksOutput - The return type for the summarizeHealthRisks function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Using the same input schema as the classification flow
const SummarizeHealthRisksInputSchema = z.object({
  bloodPressure: z.string().optional().describe("The user's blood pressure, e.g., '120/80 mmHg'."),
  bloodSugar: z.string().optional().describe("The user's blood sugar level, e.g., '90 mg/dL'."),
  cholesterol: z.string().optional().describe("The user's total cholesterol level, e.g., '180 mg/dL'."),
  spO2: z.string().optional().describe("The user's blood oxygen saturation level, e.g., '98%'."),
});
export type SummarizeHealthRisksInput = z.infer<typeof SummarizeHealthRisksInputSchema>;

const SummarizeHealthRisksOutputSchema = z.object({
  summary: z.string().describe('A summary of potential health conditions and risks based on the provided metrics. Includes a disclaimer.'),
});
export type SummarizeHealthRisksOutput = z.infer<typeof SummarizeHealthRisksOutputSchema>;

export async function summarizeHealthRisks(input: SummarizeHealthRisksInput): Promise<SummarizeHealthRisksOutput> {
  return summarizeHealthRisksFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeHealthRisksPrompt',
  input: {schema: SummarizeHealthRisksInputSchema},
  output: {schema: SummarizeHealthRisksOutputSchema},
  prompt: `You are a helpful AI health assistant. Your task is to analyze the following health metrics and provide a concise summary of potential conditions and risks.

  Health Metrics:
  - Blood Pressure: {{{bloodPressure}}}
  - Blood Sugar: {{{bloodSugar}}}
  - Cholesterol: {{{cholesterol}}}
  - SpO2: {{{spO2}}}

  Based on these metrics, identify any potential health risks. For example, high blood pressure could indicate a risk of hypertension, and high blood sugar could indicate a risk of diabetes.

  Your summary should be easy to understand for a non-medical person.

  IMPORTANT: Start your summary with the following disclaimer, exactly as written:
  "Disclaimer: This is an AI-generated summary and not a substitute for professional medical advice. Consult with a healthcare provider for any health concerns."

  Provide the summary in the specified JSON format.
  `,
});

const summarizeHealthRisksFlow = ai.defineFlow(
  {
    name: 'summarizeHealthRisksFlow',
    inputSchema: SummarizeHealthRisksInputSchema,
    outputSchema: SummarizeHealthRisksOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
