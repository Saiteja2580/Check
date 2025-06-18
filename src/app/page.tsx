"use client";

import React, { useState, useCallback } from 'react';
import Header from '@/components/header';
import CheckUploadForm from '@/components/check-upload-form';
import CheckDataTable from '@/components/check-data-table';
import { Button } from "@/components/ui/button";
import { Loader2, AlertTriangle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { processCheckImageAction } from './actions';
import type { ExtractCheckDataOutput } from '@/ai/flows/extract-check-data';

// Helper function to convert file to data URI
const fileToDataUri = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};

export default function CheckSnapPage() {
  const [uploadedImageFile, setUploadedImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<ExtractCheckDataOutput | null>(null);
  const [isProcessing, setIsProcessing] = useState(false); // Combined loading state
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleImageUpload = useCallback((file: File) => {
    setUploadedImageFile(file);
    const previewUrl = URL.createObjectURL(file);
    setImagePreviewUrl(previewUrl);
    setExtractedData(null); // Clear previous results
    setError(null); // Clear previous errors
  }, []);

  const clearPreview = useCallback(() => {
    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
    }
    setUploadedImageFile(null);
    setImagePreviewUrl(null);
    setExtractedData(null);
    setError(null);
  }, [imagePreviewUrl]);

  const handleExtractData = async () => {
    if (!uploadedImageFile) {
      toast({
        title: "No Image Selected",
        description: "Please upload an image of a check first.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setError(null);
    setExtractedData(null);

    try {
      const imageDataUri = await fileToDataUri(uploadedImageFile);
      const result = await processCheckImageAction({ checkImageDataUri: imageDataUri });

      if (result.success && result.data) {
        setExtractedData(result.data);
        toast({
          title: "Extraction Successful!",
          description: "Check data has been extracted. Review and edit if needed.",
        });
      } else {
        setError(result.error || "Failed to extract data. Please try again.");
        toast({
          title: "Extraction Failed",
          description: result.error || "An unknown error occurred.",
          variant: "destructive",
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(`Error processing image: ${errorMessage}`);
      toast({
        title: "Processing Error",
        description: `Error processing image: ${errorMessage}`,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDataUpdate = (updatedData: ExtractCheckDataOutput) => {
    setExtractedData(updatedData);
    // Potentially, you could add a "Save to Database" action here if needed in the future.
    // For now, it just updates client-side state.
  };

  return (
    <div className="min-h-screen flex flex-col bg-background ">
      <main className="flex-grow container mx-auto px-4 py-8 flex flex-col items-center w-[100%] min-h-screen">
        <div className="w-[100%] mb-8 flex flex-col items-center space-y-6 h-[600px]">
          <CheckUploadForm
            onImageUpload={handleImageUpload}
            isProcessing={isProcessing}
            imagePreviewUrl={imagePreviewUrl}
            clearPreview={clearPreview}
          />
          
          {uploadedImageFile && (
            <Button
              onClick={handleExtractData}
              disabled={isProcessing || !uploadedImageFile}
              className="w-full max-w-lg py-3 text-lg"
              size="lg"
            >
              {isProcessing ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-5 w-5"><path d="M12 17.5A2.5 2.5 0 0 0 14.5 20H10a2.5 2.5 0 0 0 0-5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v3.5"/><path d="M15 12V6.5"/><path d="m15 6.5-4.503 4.128a2.5 2.5 0 0 0-.497 2.872V15"/><path d="M15 6.5 19.5 2"/><path d="m22 5-3-3"/><path d="M12.566 20.566a2.5 2.5 0 0 0 3.536-3.536L12.5 14.5l-1.061 1.061a2.5 2.5 0 0 0 3.535 3.535Z"/></svg>
              )}
              {isProcessing ? 'Extracting Data...' : 'Extract Data from Check'}
            </Button>
          )}
        </div>

        {error && !isProcessing && (
          <div className="w-full max-w-2xl p-4 my-4 bg-destructive/10 border border-destructive text-destructive rounded-md flex items-center" role="alert">
            <AlertTriangle className="h-5 w-5 mr-3 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {extractedData && !isProcessing && (
          <div className="w-full ">
            <CheckDataTable initialData={extractedData} onSave={handleDataUpdate} isProcessing={isProcessing} />
          </div>
        )}
      </main>
      <footer className="py-6 text-center text-sm text-muted-foreground border-t">
        © {new Date().getFullYear()} SCSVMV. All rights reserved.
      </footer>
    </div>
  );
}
