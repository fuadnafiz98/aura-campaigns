import type React from "react";

import { useState, useRef, useEffect } from "react";
import { Upload } from "lucide-react";
import axios from "axios";
import { api } from "../../../convex/_generated/api";
import { useAction, useMutation, useQuery } from "convex/react";

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

export const UploadLeadsModal = ({
  open,
  onOpenChange,
}: UploadLeadsModalProps) => {
  // states
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [storageId, setStorageId] = useState<any>(null);

  // convex hooks
  const generateUploadUrl = useMutation(api.fileUpload.generateUploadUrl);
  const sendFile = useMutation(api.fileUpload.sendFile);
  const user = useQuery(api.user.getUserInfo);
  const CSVImportWF = useAction(api.csvWorkflow.KSCSVImportWf);
  const CSVImportWFTask = useQuery(
    api.csvWorkflow.CSVImportWfTask,
    storageId ? { id: storageId } : "skip",
  );

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

  const handleImportClick = () => {
    handleImport().catch((error) => {
      console.error("Import failed:", error);
    });
  };

  const handleImport = async () => {
    if (!file) return;

    try {
      setUploading(true);
      setUploadProgress(0);

      console.log("Importing file:", file.name);

      const postURL = await generateUploadUrl();

      const response = await axios.post(postURL, file, {
        headers: {
          "Content-Type": file.type,
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const progress = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total,
            );
            setUploadProgress(progress);
          }
        },
      });

      console.log("Upload successful:", response.data);

      const { storageId } = await response.data;

      if (user?.userId) {
        await sendFile({ storageId, author: user.userId });
      }

      // Reset state and close modal
      setStorageId(storageId);
      setUploading(false);
      setUploadProgress(0);
      setFile(null);
      // onOpenChange(false);
      await CSVImportWF({ storageId: storageId });
    } catch (error) {
      console.error("Upload failed:", error);
      setUploading(false);
      setUploadProgress(0);
      // TODO: Show error message to user
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setFile(null);
      setDragOver(false);
      setUploading(false);
      setUploadProgress(0);
    }
    onOpenChange(newOpen);
  };

  useEffect(() => {
    if (CSVImportWFTask?.status === "DONE") {
      onOpenChange(false);
    }
  }, [onOpenChange, CSVImportWFTask]);

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

          {/* Actions */}
          {file && (
            <div className="flex gap-2">
              <Button
                onClick={handleImportClick}
                className="flex-1 cursor-pointer"
                disabled={uploading}
              >
                {uploading ? `Uploading... ${uploadProgress}%` : "Import Leads"}
              </Button>
              <Button
                variant="outline"
                onClick={() => setFile(null)}
                className="cursor-pointer"
                disabled={uploading}
              >
                Remove
              </Button>
            </div>
          )}

          {/* File Info */}
          {file && (
            <div className="p-3 bg-muted border rounded">
              <p className="text-sm font-medium">{file.name}</p>
              <p className="text-xs text-muted-foreground">
                {(file.size / 1024).toFixed(1)} KB
              </p>
              {/* Upload Progress */}
              {uploading && (
                <div className="mt-2">
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                    <span>Uploading...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {CSVImportWFTask ? (
            <>
              <div className="flex items-center space-x-2">
                {CSVImportWFTask.status !== "DONE" && (
                  <div className="w-3 h-3 border border-primary border-t-transparent rounded-full animate-spin"></div>
                )}
                <div className="text-xs text-muted-foreground">
                  {CSVImportWFTask.status === "CREATED" && "File Uploaded"}
                  {CSVImportWFTask.status === "PROCESSING" && "Processing CSV"}
                  {CSVImportWFTask.status === "DONE" && "Import Complete"}
                </div>
              </div>

              {/* Overall Progress Bar */}
              <div>
                <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-700 ease-out"
                    style={{
                      width: `${
                        CSVImportWFTask.status === "CREATED"
                          ? "33%"
                          : CSVImportWFTask.status === "PROCESSING"
                            ? "66%"
                            : CSVImportWFTask.status === "DONE"
                              ? "100%"
                              : "0%"
                      }`,
                    }}
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>Progress</span>
                  <span>
                    {CSVImportWFTask.status === "CREATED"
                      ? "33%"
                      : CSVImportWFTask.status === "PROCESSING"
                        ? "66%"
                        : CSVImportWFTask.status === "DONE"
                          ? "100%"
                          : "0%"}
                  </span>
                </div>
              </div>
            </>
          ) : storageId ? (
            <div className="text-xs text-muted-foreground">
              Starting CSV Import...
            </div>
          ) : (
            ""
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
