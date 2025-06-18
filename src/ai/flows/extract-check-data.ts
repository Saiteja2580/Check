// This file is machine-generated - edit at your own risk!

'use server';

/**
 * @fileOverview Extracts data from a check image using OCR and AI.
 *
 * - extractCheckData - A function that handles the check data extraction process.
 * - ExtractCheckDataInput - The input type for the extractCheckData function.
 * - ExtractCheckDataOutput - The return type for the extractCheckData function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractCheckDataInputSchema = z.object({
  checkImageDataUri: z
    .string()
    .describe(
      'A photo of a check, as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.' 
    ),
});
export type ExtractCheckDataInput = z.infer<typeof ExtractCheckDataInputSchema>;

const ExtractCheckDataOutputSchema = z.object({
  payee: z.string().describe('The name of the payee on the check.'),
  ifscCode:z.string().describe('The Ifsc code  of the bank'),
  amountNumerical: z.string().describe('The amount of the check numerical.'),
  amountWords:z.string().describe('The amount of check words'),
  date: z.string().describe('The date on the check. in format dd/mm/yyyy'),
  bankName: z.string().describe('The name of the bank.'),
  accountNumber: z.string().describe('The account number of the check.'),
});
export type ExtractCheckDataOutput = z.infer<typeof ExtractCheckDataOutputSchema>;

export async function extractCheckData(input: ExtractCheckDataInput): Promise<ExtractCheckDataOutput> {
  return extractCheckDataFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractCheckDataPrompt',
  input: {schema: ExtractCheckDataInputSchema},
  output: {schema: ExtractCheckDataOutputSchema},
  prompt: `You are an expert in extracting data from checks. Analyze the check image provided and extract the following information:

  - Payee (name of the recipient)
  - Amount (numerical amount)
  - Amount (Written)
  - Date
  - Bank Name
  - IFSC Code
  - Account Number

  Ensure the extracted data is accurate and complete. If any information is unclear or missing, indicate it as such and dont extract amount in words directly from the image  and  calculate it from extracted amount.

  Check Image: {{media url=checkImageDataUri}}
`,
});

const extractCheckDataFlow = ai.defineFlow(
  {
    name: 'extractCheckDataFlow',
    inputSchema: ExtractCheckDataInputSchema,
    outputSchema: ExtractCheckDataOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
