"use client";

import React, { useState, useEffect, ChangeEvent } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Edit3, Save, Copy, CheckCircle } from "lucide-react";
import type { ExtractCheckDataOutput } from "@/ai/flows/extract-check-data";
import { useToast } from "@/hooks/use-toast";

interface CheckDataTableProps {
  initialData: ExtractCheckDataOutput;
  onSave: (updatedData: ExtractCheckDataOutput) => void;
  isProcessing: boolean; // To disable inputs while parent is processing (e.g. AI call)
}

type EditableData = ExtractCheckDataOutput;

// Define the order and labels for table rows
// Added a dummy field to make the number of fields a multiple of 3 for demonstration
// If you have a real 8th field, replace 'dummyField' with its actual key and label
const fieldOrder: Array<{ key: keyof EditableData; label: string }> = [
  { key: "payee", label: "Payee" },
  { key: "amountNumerical", label: "Amount Numerical" },
  { key: "amountWords", label: "Amount Words" },
  { key: "date", label: "Date" },
  { key: "bankName", label: "Bank Name" },
  { key: "ifscCode", label: "IFSC Code" }, // Corrected label typo
  { key: "accountNumber", label: "Account Number" },
  { key: "checkNumber", label: "Cheque Number" },
  { key: "issuerName", label: "Issuer Name" }, // Added issuerName field
];

// Helper function to chunk an array
function chunkArray<T>(array: T[], chunkSize: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    result.push(array.slice(i, i + chunkSize));
  }
  return result;
}

const CheckDataTable: React.FC<CheckDataTableProps> = ({
  initialData,
  onSave,
  isProcessing,
}) => {
  const [editedData, setEditedData] = useState<EditableData>(initialData);
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Merge initialData with editedData to ensure all fields are present,
    // especially if initialData might be partial
    setEditedData((prev) => ({ ...prev, ...initialData }));
    setIsEditing(false); // Reset editing state when new initial data arrives
  }, [initialData]);

  const handleChange = (field: keyof EditableData, value: string) => {
    setEditedData((prev) => ({ ...prev, [field]: value }));
  };

  const handleEditToggle = () => {
    if (isEditing) {
      onSave(editedData); // Save changes when toggling off editing
      toast({
        title: "Changes Saved",
        description: "Your updates to the check data have been saved.",
        variant: "default",
      });
    }
    setIsEditing(!isEditing);
  };

  const handleCopyData = () => {
    const dataString = fieldOrder
      .map((field) => `${field.label}: ${editedData[field.key] || ""}`) // Ensure fallback for undefined values
      .join("\n");
    navigator.clipboard
      .writeText(dataString)
      .then(() => {
        setCopied(true);
        toast({
          title: "Data Copied!",
          description: "Extracted check information copied to clipboard.",
        });
        setTimeout(() => setCopied(false), 2000);
      })
      .catch((err) => {
        toast({
          title: "Copy Failed",
          description: "Could not copy data to clipboard.",
          variant: "destructive",
        });
        console.error("Failed to copy: ", err);
      });
  };

  // Divide fields into chunks of 3 for the 3-column layout
  const chunkedFieldOrder = chunkArray(fieldOrder, 3);

  return (
    <Card className="w-full mt-8 shadow-lg">
      <CardHeader className="flex flex-row justify-between items-center">
        <div>
          <CardTitle className="font-headline text-2xl">
            Extracted Check Information
          </CardTitle>
          <CardDescription>
            {isEditing
              ? "Modify the fields below as needed."
              : "Review the extracted data. Click 'Edit' to make changes."}
          </CardDescription>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={handleCopyData}
            disabled={isProcessing || isEditing}
          >
            {copied ? (
              <CheckCircle className="mr-2 h-4 w-4" />
            ) : (
              <Copy className="mr-2 h-4 w-4" />
            )}
            {copied ? "Copied!" : "Copy"}
          </Button>
          <Button
            onClick={handleEditToggle}
            disabled={isProcessing}
            aria-pressed={isEditing}
          >
            {isEditing ? (
              <Save className="mr-2 h-4 w-4" />
            ) : (
              <Edit3 className="mr-2 h-4 w-4" />
            )}
            {isEditing ? "Save Changes" : "Edit Data"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              {/* Header for the 3 sets of Field | Value */}
              <TableHead className="w-[100px] font-bold text-xl bg-blue-500 text-white">
                Field
              </TableHead>
              <TableHead className="w-[150px] font-bold text-xl bg-blue-500 text-white">
                Value
              </TableHead>
              <TableHead className="w-[100px] font-bold text-xl bg-blue-500 text-white">
                Field
              </TableHead>
              <TableHead className="w-[150px] font-bold text-xl bg-blue-500 text-white">
                Value
              </TableHead>
              <TableHead className="w-[100px] font-bold text-xl bg-blue-500 text-white">
                Field
              </TableHead>
              <TableHead className="w-[150px] font-bold text-xl bg-blue-500 text-white">
                Value
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {chunkedFieldOrder.map((rowFields, rowIndex) => (
              <TableRow key={rowIndex}>
                {rowFields.map((field) => (
                  <React.Fragment key={field.key}>
                    <TableCell className="font-bold text-muted-foreground text-xl text-blue-500">
                      {field.label}
                    </TableCell>
                    <TableCell>
                      {" "}
                      {/* <-- **CRITICAL CHANGE HERE: NO WHITESPACE** */}
                      {isEditing ? (
                        <Input
                          type="text"
                          value={editedData[field.key] || ""}
                          onChange={(e: ChangeEvent<HTMLInputElement>) =>
                            handleChange(field.key, e.target.value)
                          }
                          className="h-8 w-full"
                          disabled={isProcessing}
                          aria-label={`Edit ${field.label}`}
                        />
                      ) : (
                        <span className="py-2 block text-xl">
                          {editedData[field.key] || "-"}
                        </span>
                      )}
                    </TableCell>
                  </React.Fragment>
                ))}
                {/* Optional: Fill empty cells if the last row doesn't have 3 pairs */}
                {rowFields.length < 3 &&
                  Array.from({ length: (3 - rowFields.length) * 2 }).map(
                    (_, i) => <TableCell key={`empty-${rowIndex}-${i}`} />
                  )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default CheckDataTable;
