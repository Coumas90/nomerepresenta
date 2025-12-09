import { useState, useCallback } from "react";

interface UseFileDropOptions {
  acceptedTypes?: string[];
  multiple?: boolean;
  onFilesSelected: (files: File[]) => void;
}

interface UseFileDropReturn {
  isDragOver: boolean;
  handleDragEnter: (e: React.DragEvent) => void;
  handleDragLeave: (e: React.DragEvent) => void;
  handleDragOver: (e: React.DragEvent) => void;
  handleDrop: (e: React.DragEvent) => void;
  handleFileInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const useFileDrop = ({
  acceptedTypes = ["image/"],
  multiple = false,
  onFilesSelected,
}: UseFileDropOptions): UseFileDropReturn => {
  const [isDragOver, setIsDragOver] = useState(false);

  const isAcceptedFile = useCallback(
    (file: File) => {
      return acceptedTypes.some((type) => file.type.startsWith(type));
    },
    [acceptedTypes]
  );

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);

      const droppedFiles = Array.from(e.dataTransfer.files).filter(isAcceptedFile);

      if (droppedFiles.length > 0) {
        const filesToProcess = multiple ? droppedFiles : [droppedFiles[0]];
        onFilesSelected(filesToProcess);
      }
    },
    [isAcceptedFile, multiple, onFilesSelected]
  );

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files) return;

      const acceptedFiles = Array.from(files).filter(isAcceptedFile);

      if (acceptedFiles.length > 0) {
        const filesToProcess = multiple ? acceptedFiles : [acceptedFiles[0]];
        onFilesSelected(filesToProcess);
      }

      // Reset input value to allow selecting the same file again
      e.target.value = "";
    },
    [isAcceptedFile, multiple, onFilesSelected]
  );

  return {
    isDragOver,
    handleDragEnter,
    handleDragLeave,
    handleDragOver,
    handleDrop,
    handleFileInputChange,
  };
};
