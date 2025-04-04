"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Upload, X, File, Image, FileText, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/components/ui/use-toast"

interface FileWithPreview extends File {
  preview?: string
  id: string
  uploadProgress: number
}

interface MultiFileUploadProps {
  onFilesSelected: (files: File[]) => void
  maxFiles?: number
  acceptedFileTypes?: string
  maxSizeInMB?: number
}

export default function MultiFileUpload({
  onFilesSelected,
  maxFiles = 5,
  acceptedFileTypes = "image/*,application/pdf",
  maxSizeInMB = 10,
}: MultiFileUploadProps) {
  const [files, setFiles] = useState<FileWithPreview[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const maxSizeInBytes = maxSizeInMB * 1024 * 1024

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    addFiles(selectedFiles)

    // Reset the input value so the same file can be selected again if removed
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const addFiles = (selectedFiles: File[]) => {
    // Check if adding these files would exceed the maximum
    if (files.length + selectedFiles.length > maxFiles) {
      toast({
        title: "Too many files",
        description: `You can only upload a maximum of ${maxFiles} files.`,
        variant: "destructive",
      })
      return
    }

    // Process and validate each file
    const validFiles = selectedFiles.filter((file) => {
      // Check file size
      if (file.size > maxSizeInBytes) {
        toast({
          title: "File too large",
          description: `${file.name} exceeds the maximum size of ${maxSizeInMB}MB.`,
          variant: "destructive",
        })
        return false
      }

      // Check file type
      const fileType = file.type.split("/")[0]
      const fileExtension = file.name.split(".").pop()?.toLowerCase()

      if (
        !acceptedFileTypes.includes(file.type) &&
        !acceptedFileTypes.includes(`${fileType}/*`) &&
        !acceptedFileTypes.includes(`.${fileExtension}`)
      ) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not an accepted file type.`,
          variant: "destructive",
        })
        return false
      }

      return true
    })

    // Create preview for images
    const filesWithPreview = validFiles.map((file) => {
      const fileWithPreview = file as FileWithPreview
      fileWithPreview.id = Math.random().toString(36).substring(2, 11)
      fileWithPreview.uploadProgress = 0

      // Create preview URL for images
      if (file.type.startsWith("image/")) {
        fileWithPreview.preview = URL.createObjectURL(file)
      }

      return fileWithPreview
    })

    setFiles((prev) => [...prev, ...filesWithPreview])

    // Notify parent component
    onFilesSelected([...files, ...filesWithPreview])
  }

  const removeFile = (id: string) => {
    setFiles((prev) => {
      const updatedFiles = prev.filter((file) => file.id !== id)

      // Notify parent component
      onFilesSelected(updatedFiles)

      return updatedFiles
    })
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)

    if (e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files)
      addFiles(droppedFiles)
    }
  }

  const simulateUpload = () => {
    if (files.length === 0) {
      toast({
        title: "No files selected",
        description: "Please select files to upload first.",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)

    // Simulate progress for each file
    const interval = setInterval(() => {
      setFiles((prev) => {
        const updated = prev.map((file) => {
          if (file.uploadProgress < 100) {
            return {
              ...file,
              uploadProgress: Math.min(file.uploadProgress + Math.random() * 10, 100),
            }
          }
          return file
        })

        // Check if all files are uploaded
        if (updated.every((file) => file.uploadProgress === 100)) {
          clearInterval(interval)

          setTimeout(() => {
            setIsUploading(false)
            toast({
              title: "Upload complete",
              description: `Successfully uploaded ${files.length} files.`,
            })
          }, 500)
        }

        return updated
      })
    }, 200)
  }

  const getFileIcon = (file: FileWithPreview) => {
    if (file.type.startsWith("image/")) {
      return <Image className="w-6 h-6 text-blue-500" />
    } else if (file.type === "application/pdf") {
      return <FileText className="w-6 h-6 text-red-500" />
    } else {
      return <File className="w-6 h-6 text-gray-500" />
    }
  }

  return (
    <div className="space-y-4">
      {/* Drag and drop area */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          isDragging ? "border-[#1B9D65] bg-[#1B9D65]/5" : "border-gray-300 hover:border-[#1B9D65]"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          multiple
          accept={acceptedFileTypes}
          className="hidden"
        />
        <Upload className="w-10 h-10 mx-auto mb-2 text-gray-400" />
        <p className="text-sm font-medium mb-1">Drag and drop files here or click to browse</p>
        <p className="text-xs text-gray-500">
          Supports images and PDF documents (Max {maxFiles} files, {maxSizeInMB}MB each)
        </p>
      </div>

      {/* File list */}
      {files.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">
            Selected Files ({files.length}/{maxFiles})
          </p>
          <div className="space-y-2">
            {files.map((file) => (
              <div key={file.id} className="flex items-center p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center flex-1 min-w-0">
                  {file.preview ? (
                    <div className="w-10 h-10 rounded bg-white border flex items-center justify-center overflow-hidden mr-3">
                      <img
                        src={file.preview || "/placeholder.svg"}
                        alt={file.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded bg-white border flex items-center justify-center mr-3">
                      {getFileIcon(file)}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>

                {isUploading ? (
                  <div className="w-24">
                    <Progress value={file.uploadProgress} className="h-2" />
                    <p className="text-xs text-right mt-1">{Math.round(file.uploadProgress)}%</p>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      removeFile(file.id)
                    }}
                    className="ml-2 text-gray-400 hover:text-red-500"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <Button
            type="button"
            onClick={simulateUpload}
            disabled={isUploading || files.length === 0}
            className="w-full bg-[#1B9D65] hover:bg-[#1B9D65]/90"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                Upload {files.length} {files.length === 1 ? "file" : "files"}
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  )
}

