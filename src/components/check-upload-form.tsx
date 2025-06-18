"use client";

import React, { useState, useCallback, ChangeEvent, DragEvent, useRef } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UploadCloud, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CheckUploadFormProps {
  onImageUpload: (file: File) => void;
  isProcessing: boolean;
  imagePreviewUrl: string | null;
  clearPreview: () => void;
}

const CheckUploadForm: React.FC<CheckUploadFormProps> = ({
  onImageUpload,
  isProcessing,
  imagePreviewUrl,
  clearPreview,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null); // The div containing the Image
  const imageRef = useRef<HTMLImageElement>(null); // The actual Image component

  // --- State for the localized scaling effect ---
  const [isZoomed, setIsZoomed] = useState(false);
  const [originX, setOriginX] = useState('50%'); // Default to center
  const [originY, setOriginY] = useState('50%'); // Default to center
  const zoomFactor = 1.5; // How much to zoom in (e.g., 1.5x)

  const handleZoomMouseEnter = useCallback(() => {
    if (imagePreviewUrl) {
      setIsZoomed(true);
    }
  }, [imagePreviewUrl]);

  const handleZoomMouseLeave = useCallback(() => {
    setIsZoomed(false);
    // Optionally reset origin to center when leaving
    setOriginX('50%');
    setOriginY('50%');
  }, []);

  const handleZoomMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current) return;

    // Get the bounding rectangle of the actual Image element
    const imageRect = imageRef.current.getBoundingClientRect();

    // Calculate mouse position relative to the image itself
    // e.clientX/Y is mouse position relative to viewport
    // imageRect.left/top is image position relative to viewport
    const mouseX = e.clientX - imageRect.left;
    const mouseY = e.clientY - imageRect.top;

    // Calculate percentage for transform-origin
    // Ensure we don't divide by zero if imageRect has no width/height yet
    const percentX = imageRect.width > 0 ? (mouseX / imageRect.width) * 100 : 50;
    const percentY = imageRect.height > 0 ? (mouseY / imageRect.height) * 100 : 50;

    setOriginX(`${percentX}%`);
    setOriginY(`${percentY}%`);
  }, []);

  // --- Magnifier part (removed to avoid conflict and simplify, but you can reintegrate) ---
  // If you need both, the magnifier should probably be on a *different* layer
  // or your logic needs to decide which effect takes precedence.
  // Given "whole image is getting scaled", this localized scaling is likely what you want.

  const handleFile = useCallback((file: File | null) => {
    setError(null);
    if (file) {
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        setError('Invalid file type. Please upload a JPG, PNG, or WEBP image.');
        clearPreview();
        if (inputRef.current) inputRef.current.value = "";
        return;
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        setError('File is too large. Maximum size is 10MB.');
        clearPreview();
        if (inputRef.current) inputRef.current.value = "";
        return;
      }
      onImageUpload(file);
    }
  }, [onImageUpload, clearPreview]);

  const handleDrag = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, [handleFile]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const onButtonClick = () => {
    inputRef.current?.click();
  };

  return (
    <Card className="w-full max-w-lg shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Upload Check Image</CardTitle>
        <CardDescription>Drag & drop your check image or click to select a file. Supports JPG, PNG, WEBP (max 10MB).</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={(e) => e.preventDefault()}>
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={onButtonClick}
            className={cn(
              "flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary/80 transition-colors",
              dragActive ? "border-primary bg-primary/10" : "border-border bg-card",
              imagePreviewUrl ? "p-2" : "p-6"
            )}
            aria-label="Check image upload area"
          >
            {imagePreviewUrl ? (
              <div
                className="relative w-full h-full overflow-hidden" // Crucial for containing the scaled image
                ref={imageContainerRef}
                onMouseEnter={handleZoomMouseEnter}
                onMouseLeave={handleZoomMouseLeave}
                onMouseMove={handleZoomMouseMove}
                style={{ cursor: 'zoom-in' }}
              >
                <Image
                  src={imagePreviewUrl}
                  alt="Check preview"
                  layout="fill"
                  objectFit="contain" // Keep this as it handles aspect ratio within the container
                  className="rounded-md transition-transform duration-300 ease-out" // Smooth transition
                  style={{
                    transform: isZoomed ? `scale(${zoomFactor})` : 'scale(1)',
                    transformOrigin: `${originX} ${originY}`, // Dynamic transform-origin
                  }}
                  data-ai-hint="check document"
                  ref={imageRef} // Attach ref to the Image component
                />
                {/* No magnifier div here, as the image itself is zooming */}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center">
                <UploadCloud className="w-12 h-12 text-muted-foreground mb-3" />
                <p className="mb-2 text-sm text-muted-foreground">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-muted-foreground">JPG, PNG, or WEBP (MAX. 10MB)</p>
              </div>
            )}
            <Input
              ref={inputRef}
              type="file"
              className="hidden"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleChange}
              aria-describedby={error ? "file-error" : undefined}
            />
          </div>
        </form>
        {error && (
          <p id="file-error" role="alert" className="mt-2 text-sm text-destructive flex items-center">
            <AlertCircle className="h-4 w-4 mr-1" />
            {error}
          </p>
        )}
      </CardContent>
      {imagePreviewUrl && (
         <CardFooter className="flex justify-end">
            <Button
              onClick={() => {
                clearPreview();
                setError(null);
                if (inputRef.current) inputRef.current.value = "";
              }}
              variant="outline"
              disabled={isProcessing}
            >
              Clear Image
            </Button>
         </CardFooter>
      )}
    </Card>
  );
};

export default CheckUploadForm;