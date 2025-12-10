import { useState, useCallback } from "react";

/**
 * Configuration options for the useFileDrop hook.
 */
interface UseFileDropOptions {
  /**
   * Array of accepted MIME type prefixes.
   * Files are accepted if their type starts with any of these strings.
   * @default ["image/"]
   * @example ["image/", "application/pdf"]
   */
  acceptedTypes?: string[];
  /**
   * Whether to allow multiple file selection.
   * @default false
   */
  multiple?: boolean;
  /**
   * Callback invoked when valid files are selected or dropped.
   * @param files - Array of accepted File objects
   */
  onFilesSelected: (files: File[]) => void;
}

/**
 * Return type for the useFileDrop hook.
 * Provides drag state and event handlers for file drop zones.
 */
interface UseFileDropReturn {
  /** Whether a file is currently being dragged over the drop zone */
  isDragOver: boolean;
  /** Handler for dragenter events */
  handleDragEnter: (e: React.DragEvent) => void;
  /** Handler for dragleave events */
  handleDragLeave: (e: React.DragEvent) => void;
  /** Handler for dragover events */
  handleDragOver: (e: React.DragEvent) => void;
  /** Handler for drop events */
  handleDrop: (e: React.DragEvent) => void;
  /** Handler for file input change events */
  handleFileInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

/**
 * A reusable hook for handling file drag-and-drop and file input interactions.
 *
 * Provides unified handling for:
 * - Drag and drop file uploads
 * - File input element changes
 * - File type validation
 * - Single/multiple file selection
 *
 * @param options - Configuration options for the hook
 * @returns Object containing drag state and event handlers
 *
 * @example
 * ```tsx
 * const { isDragOver, handleDrop, handleDragOver, handleDragEnter, handleDragLeave } = useFileDrop({
 *   acceptedTypes: ["image/"],
 *   multiple: true,
 *   onFilesSelected: (files) => console.log("Selected:", files),
 * });
 *
 * return (
 *   <div
 *     onDrop={handleDrop}
 *     onDragOver={handleDragOver}
 *     onDragEnter={handleDragEnter}
 *     onDragLeave={handleDragLeave}
 *     className={isDragOver ? "bg-blue-100" : "bg-gray-100"}
 *   >
 *     Drop files here
 *   </div>
 * );
 * ```
 */
export const useFileDrop = ({
  acceptedTypes = ["image/"],
  multiple = false,
  onFilesSelected,
}: UseFileDropOptions): UseFileDropReturn => {
  const [isDragOver, setIsDragOver] = useState(false);

  /**
   * Checks if a file's MIME type matches any of the accepted type prefixes.
   */
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
