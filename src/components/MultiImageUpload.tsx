import React from 'react';
import { useState, useRef } from 'react';
import { UploadCloud, X, Plus } from 'lucide-react';
import { ImageUpload } from './ImageUpload';

interface MultiImageUploadProps {
  label: string;
  images: string[];
  onChange: (images: string[]) => void;
}

export function MultiImageUpload({ label, images, onChange }: MultiImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        onChange([...images, e.target.result as string]);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };
  
  const removeImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    onChange(newImages);
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-text-secondary">{label}</label>
      
      <div className="grid grid-cols-3 gap-4">
        {images.map((img, idx) => (
           <div key={idx} className="relative rounded-xl overflow-hidden border border-border group aspect-square">
             <img src={img} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
             <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
               <button 
                 type="button"
                 onClick={() => removeImage(idx)} 
                 className="p-1.5 bg-error text-white rounded-full hover:bg-error/80 transition-colors"
               >
                 <X className="w-4 h-4" />
               </button>
             </div>
           </div>
        ))}

        <div 
          className="border-2 border-dashed border-border hover:border-text-secondary/50 rounded-xl flex flex-col items-center justify-center text-center cursor-pointer transition-colors aspect-square"
          onClick={() => fileInputRef.current?.click()}
        >
          <Plus className="w-6 h-6 text-text-secondary mb-1" />
          <span className="text-xs font-medium">Add Image</span>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleChange} 
            accept="image/*" 
            className="hidden" 
          />
        </div>
      </div>
    </div>
  );
}
