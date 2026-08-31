import React, { useState, useRef } from 'react';
import { UploadCloud, File, X, Loader2 } from 'lucide-react';
import { storage } from '../lib/firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

interface FileUploadProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}

export function FileUpload({ label, value, onChange, required = false }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setError('');
    
    // Check file size (e.g., max 100MB)
    if (file.size > 100 * 1024 * 1024) {
      setError('File size must be less than 100MB');
      return;
    }

    setIsUploading(true);
    setProgress(0);

    try {
      const storageRef = ref(storage, `products/${Date.now()}_${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const p = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setProgress(p);
        },
        (err) => {
          console.error(err);
          setError('Upload failed. Please try again.');
          setIsUploading(false);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          onChange(downloadURL);
          setIsUploading(false);
        }
      );
    } catch (err) {
      console.error(err);
      setError('An error occurred during upload.');
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-text-secondary">
        {label} {required && <span className="text-error">*</span>}
      </label>
      
      {value ? (
        <div className="flex items-center justify-between p-4 bg-background border border-border rounded-xl">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="p-2 bg-primary/10 text-primary rounded-lg">
              <File className="w-6 h-6" />
            </div>
            <div className="truncate">
              <p className="text-sm font-medium text-text-primary truncate">File Uploaded successfully</p>
              <a href={value} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline truncate block">View File</a>
            </div>
          </div>
          <button 
            type="button"
            onClick={() => onChange('')} 
            className="p-2 text-text-secondary hover:text-error hover:bg-error/10 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      ) : (
        <div 
          className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors ${isDragging ? 'border-primary bg-primary/10' : error ? 'border-error bg-error/5' : 'border-border hover:border-text-secondary/50'}`}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
          onDrop={handleDrop}
          onClick={() => !isUploading && fileInputRef.current?.click()}
        >
          {isUploading ? (
            <div className="flex flex-col items-center">
              <Loader2 className="w-8 h-8 text-primary animate-spin mb-3" />
              <p className="text-sm font-medium mb-1">Uploading... {Math.round(progress)}%</p>
              <div className="w-48 h-2 bg-border rounded-full mt-2 overflow-hidden">
                <div className="h-full bg-primary transition-all duration-300" style={{ width: `${progress}%` }}></div>
              </div>
            </div>
          ) : (
            <>
              <UploadCloud className={`w-8 h-8 mb-3 ${error ? 'text-error' : 'text-text-secondary'}`} />
              <p className={`text-sm font-medium mb-1 ${error ? 'text-error' : ''}`}>
                {error || 'Click or drag pack/file to upload'}
              </p>
              <p className="text-xs text-text-secondary">ZIP, RAR, PDF, or other file formats (max. 100MB)</p>
            </>
          )}
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleChange} 
            className="hidden" 
            disabled={isUploading}
          />
        </div>
      )}
    </div>
  );
}
