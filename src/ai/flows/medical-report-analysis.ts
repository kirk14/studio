'use server';
/**
 * @fileOverview An AI agent that analyzes a medical report image to extract key health metrics.
 *
 * - analyzeMedicalReport - A function that handles the OCR and data extraction process.
 * - AnalyzeMedicalReportInput - The input type for the analyzeMedicalReport function.
 * - AnalyzeMedicalReportOutput - The return type for the analyzeMedicalReport function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeMedicalReportInputSchema = z.object({
  reportImage: z
    .string()
    .describe(
      "A photo of a medical report, as a data URI that must include a MIME type and use Base64 encoding."
    ),
});
export type AnalyzeMedicalReportInput = z.infer<typeof AnalyzeMedicalReportInputSchema>;

const AnalyzeMedicalReportOutputSchema = z.object({
  bloodPressure: z.string().optional().describe("The user's blood pressure, e.g., '120/80 mmHg'."),
  bloodSugar: z.string().optional().describe("The user's blood sugar level, e.g., '90 mg/dL'."),
  cholesterol: z.string().optional().describe("The user's total cholesterol level, e.g., '180 mg/dL'."),
  spO2: z.string().optional().describe("The user's blood oxygen saturation level, e.g., '98%'."),
});
export type AnalyzeMedicalReportOutput = z.infer<typeof AnalyzeMedicalReportOutputSchema>;

export async function analyzeMedicalReport(input: AnalyzeMedicalReportInput): Promise<AnalyzeMedicalReportOutput> {
  return medicalReportAnalysisFlow(input);
}

const prompt = ai.definePrompt({
  name: 'medicalReportAnalysisPrompt',
  input: {schema: AnalyzeMedicalReportInputSchema},
  output: {schema: AnalyzeMedicalReportOutputSchema},
  prompt: `You are an expert at analyzing medical reports using OCR. Your task is to extract specific health metrics from the provided image.

  Analyze the following medical report image:
  {{media url=reportImage}}

  Extract the following values. If a value is not present, leave the field empty.
  - Blood Pressure (systolic/diastolic)
  - Blood Sugar (glucose level)
  - Total Cholesterol
  - SpO2 (Blood Oxygen Saturation)

  Provide the results in the specified JSON format.
  `,
});

const medicalReportAnalysisFlow = ai.defineFlow(
  {
    name: 'medicalReportAnalysisFlow',
    inputSchema: AnalyzeMedicalReportInputSchema,
    outputSchema: AnalyzeMedicalReportOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
