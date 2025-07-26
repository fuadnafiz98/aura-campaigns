import type React from "react";

import { useState, useRef, memo } from "react";
import { Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface UploadLeadsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const UploadLeadsModal = memo(function UploadLeadsModal({
  open,
  onOpenChange,
}: UploadLeadsModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (selectedFile: File) => {
    setFile(selectedFile);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === "text/csv") {
      handleFileChange(droppedFile);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleImport = () => {
    if (!file) return;
    // TODO: Implement actual import logic
    console.log("Importing file:", file.name);
    onOpenChange(false);
    setFile(null);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setFile(null);
      setDragOver(false);
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Upload Leads</DialogTitle>
          <DialogDescription>
            Upload a CSV file to import new leads. Expected columns: name,
            email, company, category
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Dropzone */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              dragOver
                ? "border-primary bg-accent dark:bg-accent"
                : "border-border hover:border-muted-foreground"
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                fileInputRef.current?.click();
              }
            }}
            aria-label="Drop CSV file here or click to browse"
          >
            <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm font-medium">Drop your CSV file here</p>
            <p className="text-xs text-muted-foreground">or click to browse</p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={(e) =>
                e.target.files?.[0] && handleFileChange(e.target.files[0])
              }
              className="hidden"
              aria-hidden="true"
            />
          </div>

          {/* File Info */}
          {file && (
            <div className="p-3 bg-muted border rounded">
              <p className="text-sm font-medium">{file.name}</p>
              <p className="text-xs text-muted-foreground">
                {(file.size / 1024).toFixed(1)} KB
              </p>
            </div>
          )}

          {/* Actions */}
          {file && (
            <div className="flex gap-2">
              <Button onClick={handleImport} className="flex-1 cursor-pointer">
                Import Leads
              </Button>
              <Button
                variant="outline"
                onClick={() => setFile(null)}
                className="cursor-pointer"
              >
                Remove
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
});
