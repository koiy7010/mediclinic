"use client"

import { useState, useRef, useCallback } from 'react'
import { Upload, X, Image, FileText, Film, Eye, Download, Trash2 } from 'lucide-react'
import { Button } from './button'
import { cn } from '@/lib/utils'

interface UploadedFile {
  id: string
  file: File
  preview?: string
  progress: number
  status: 'uploading' | 'complete' | 'error'
  error?: string
}

interface FileUploadProps {
  accept?: string
  multiple?: boolean
  maxSize?: number // in MB
  maxFiles?: number
  onUpload?: (files: File[]) => Promise<void>
  onRemove?: (fileId: string) => void
  className?: string
  label?: string
  hint?: string
}

export function FileUpload({
  accept = 'image/*,.pdf,.dcm',
  multiple = true,
  maxSize = 10,
  maxFiles = 10,
  onUpload,
  onRemove,
  className,
  label = 'Upload Files',
  hint = 'Drag and drop files here, or click to browse',
}: FileUploadProps) {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [previewFile, setPreviewFile] = useState<UploadedFile | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFiles = useCallback(async (fileList: FileList | null) => {
    if (!fileList) return

    const newFiles: UploadedFile[] = []
    
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i]
      
      // Check file size
      if (file.size > maxSize * 1024 * 1024) {
        newFiles.push({
          id: `${Date.now()}_${i}`,
          file,
          progress: 0,
          status: 'error',
          error: `File exceeds ${maxSize}MB limit`,
        })
        continue
      }

      // Check max files
      if (files.length + newFiles.length >= maxFiles) {
        break
      }

      const uploadedFile: UploadedFile = {
        id: `${Date.now()}_${i}`,
        file,
        progress: 0,
        status: 'uploading',
      }

      // Generate preview for images
      if (file.type.startsWith('image/')) {
        uploadedFile.preview = URL.createObjectURL(file)
      }

      newFiles.push(uploadedFile)
    }

    setFiles(prev => [...prev, ...newFiles])

    // Simulate upload progress
    for (const uploadedFile of newFiles.filter(f => f.status === 'uploading')) {
      await simulateUpload(uploadedFile.id)
    }

    // Call onUpload callback
    if (onUpload) {
      const validFiles = newFiles.filter(f => f.status !== 'error').map(f => f.file)
      if (validFiles.length > 0) {
        await onUpload(validFiles)
      }
    }
  }, [files.length, maxFiles, maxSize, onUpload])

  const simulateUpload = async (fileId: string) => {
    for (let progress = 0; progress <= 100; progress += 10) {
      await new Promise(resolve => setTimeout(resolve, 50))
      setFiles(prev => prev.map(f => 
        f.id === fileId ? { ...f, progress } : f
      ))
    }
    setFiles(prev => prev.map(f => 
      f.id === fileId ? { ...f, status: 'complete' } : f
    ))
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    handleFiles(e.dataTransfer.files)
  }, [handleFiles])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const removeFile = (fileId: string) => {
    const file = files.find(f => f.id === fileId)
    if (file?.preview) {
      URL.revokeObjectURL(file.preview)
    }
    setFiles(prev => prev.filter(f => f.id !== fileId))
    onRemove?.(fileId)
  }

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return Image
    if (file.type.startsWith('video/')) return Film
    return FileText
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className={className}>
      <label className="text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide mb-2 block">
        {label}
      </label>

      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all",
          isDragging
            ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.05)]"
            : "border-[hsl(var(--border))] hover:border-[hsl(var(--primary)/0.5)] hover:bg-[hsl(var(--muted)/0.3)]"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
        />
        <Upload className={cn(
          "w-10 h-10 mx-auto mb-3 transition-colors",
          isDragging ? "text-[hsl(var(--primary))]" : "text-[hsl(var(--muted-foreground))]"
        )} />
        <p className="text-sm font-medium text-[hsl(var(--foreground))]">{hint}</p>
        <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">
          Max {maxSize}MB per file • {accept.replace(/\./g, '').toUpperCase()}
        </p>
      </div>

      {/* File list */}
      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          {files.map(uploadedFile => {
            const FileIcon = getFileIcon(uploadedFile.file)
            
            return (
              <div
                key={uploadedFile.id}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg border",
                  uploadedFile.status === 'error'
                    ? "bg-red-50 border-red-200"
                    : "bg-[hsl(var(--card))] border-[hsl(var(--border))]"
                )}
              >
                {/* Preview/Icon */}
                {uploadedFile.preview ? (
                  <img
                    src={uploadedFile.preview}
                    alt={uploadedFile.file.name}
                    className="w-12 h-12 object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-[hsl(var(--muted))] flex items-center justify-center">
                    <FileIcon className="w-6 h-6 text-[hsl(var(--muted-foreground))]" />
                  </div>
                )}

                {/* File info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{uploadedFile.file.name}</p>
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">
                    {formatFileSize(uploadedFile.file.size)}
                    {uploadedFile.error && (
                      <span className="text-red-600 ml-2">{uploadedFile.error}</span>
                    )}
                  </p>
                  
                  {/* Progress bar */}
                  {uploadedFile.status === 'uploading' && (
                    <div className="mt-1 h-1 bg-[hsl(var(--muted))] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[hsl(var(--primary))] transition-all duration-200"
                        style={{ width: `${uploadedFile.progress}%` }}
                      />
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1">
                  {uploadedFile.preview && uploadedFile.status === 'complete' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setPreviewFile(uploadedFile)
                      }}
                      className="p-2 rounded-lg hover:bg-[hsl(var(--muted))] transition-colors cursor-pointer"
                      title="Preview"
                    >
                      <Eye className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      removeFile(uploadedFile.id)
                    }}
                    className="p-2 rounded-lg hover:bg-red-100 transition-colors cursor-pointer"
                    title="Remove"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Image preview modal */}
      {previewFile && previewFile.preview && (
        <ImagePreviewModal
          src={previewFile.preview}
          filename={previewFile.file.name}
          onClose={() => setPreviewFile(null)}
        />
      )}
    </div>
  )
}

interface ImagePreviewModalProps {
  src: string
  filename: string
  onClose: () => void
}

function ImagePreviewModal({ src, filename, onClose }: ImagePreviewModalProps) {
  return (
    <>
      <div 
        className="fixed inset-0 bg-black/80 z-50 animate-in fade-in duration-150"
        onClick={onClose}
      />
      <div className="fixed inset-4 z-50 flex items-center justify-center">
        <div className="relative max-w-4xl max-h-full">
          <img
            src={src}
            alt={filename}
            className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
          />
          <div className="absolute top-4 right-4 flex gap-2">
            <a
              href={src}
              download={filename}
              className="p-2 rounded-lg bg-white/90 hover:bg-white transition-colors cursor-pointer"
              title="Download"
            >
              <Download className="w-5 h-5" />
            </a>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-white/90 hover:bg-white transition-colors cursor-pointer"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="absolute bottom-4 left-4 px-3 py-1 rounded-lg bg-black/50 text-white text-sm">
            {filename}
          </p>
        </div>
      </div>
    </>
  )
}

export default FileUpload
