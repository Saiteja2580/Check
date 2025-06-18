"use server";

import { extractCheckData, type ExtractCheckDataInput, type ExtractCheckDataOutput } from "@/ai/flows/extract-check-data";

export async function processCheckImageAction(
  input: ExtractCheckDataInput
): Promise<{ success: boolean; data?: ExtractCheckDataOutput; error?: string }> {
  try {
    const result = await extractCheckData(input);
    return { success: true, data: result };
  } catch (error) {
    console.error("Error extracting check data:", error);
    return { success: false, error: error instanceof Error ? error.message : "An unknown error occurred during check data extraction." };
  }
}
