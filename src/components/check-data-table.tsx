"use client";

import React, { useState, useEffect, ChangeEvent } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Edit3, Save, Copy, CheckCircle } from 'lucide-react';
import type { ExtractCheckDataOutput } from '@/ai/flows/extract-check-data';
import { useToast } from "@/hooks/use-toast";

interface CheckDataTableProps {
  initialData: ExtractCheckDataOutput;
  onSave: (updatedData: ExtractCheckDataOutput) => void;
  isProcessing: boolean; // To disable inputs while parent is processing (e.g. AI call)
}

type EditableData = ExtractCheckDataOutput;

// Define the order and labels for table rows
const fieldOrder: Array<{ key: keyof EditableData; label: string }> = [
  { key: 'payee', label: 'Payee' },
  { key: 'amountNumerical', label: 'Amount Numerical' },
    { key: 'amountWords', label: 'Amount Words' },
  { key: 'date', label: 'Date' },
  { key: 'bankName', label: 'Bank Name' },
  {key : 'ifscCode',label:'IFSC Cde'},
  
  { key: 'accountNumber', label: 'Account Number' },
];

const CheckDataTable: React.FC<CheckDataTableProps> = ({ initialData, onSave, isProcessing }) => {
  const [editedData, setEditedData] = useState<EditableData>(initialData);
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setEditedData(initialData);
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
      .map(field => `${field.label}: ${editedData[field.key]}`)
      .join('\n');
    navigator.clipboard.writeText(dataString)
      .then(() => {
        setCopied(true);
        toast({
          title: "Data Copied!",
          description: "Extracted check information copied to clipboard.",
        });
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(err => {
        toast({
          title: "Copy Failed",
          description: "Could not copy data to clipboard.",
          variant: "destructive",
        });
        console.error('Failed to copy: ', err);
      });
  };

  return (
    <Card className="w-full mt-8 shadow-lg">
      <CardHeader className="flex flex-row justify-between items-center">
        <div>
          <CardTitle className="font-headline text-2xl">Extracted Check Information</CardTitle>
          <CardDescription>
            {isEditing ? "Modify the fields below as needed." : "Review the extracted data. Click 'Edit' to make changes."}
          </CardDescription>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleCopyData} disabled={isProcessing || isEditing}>
            {copied ? <CheckCircle className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
            {copied ? "Copied!" : "Copy"}
          </Button>
          <Button onClick={handleEditToggle} disabled={isProcessing} aria-pressed={isEditing}>
            {isEditing ? <Save className="mr-2 h-4 w-4" /> : <Edit3 className="mr-2 h-4 w-4" />}
            {isEditing ? 'Save Changes' : 'Edit Data'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px] font-semibold">Field</TableHead>
              <TableHead className="font-semibold">Value</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {fieldOrder.map((field) => (
              <TableRow key={field.key}>
                <TableCell className="font-medium text-muted-foreground">{field.label}</TableCell>
                <TableCell>
                  {isEditing ? (
                    <Input
                      type="text"
                      value={editedData[field.key]}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange(field.key, e.target.value)}
                      className="h-8"
                      disabled={isProcessing}
                      aria-label={`Edit ${field.label}`}
                    />
                  ) : (
                    <span className="py-2 block">{editedData[field.key] || '-'}</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default CheckDataTable;
