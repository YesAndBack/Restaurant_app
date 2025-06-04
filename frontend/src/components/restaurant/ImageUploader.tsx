import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

interface ImageUploaderProps {
  restaurantId?: number; // Делаем опциональным
  onImagesUploaded?: (images: string[]) => void; // Изменяем тип на строки (URLs)
  mode?: 'permanent' | 'temporary'; // Добавляем режим работы
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ 
  restaurantId,
  onImagesUploaded,
  mode = 'permanent'
}) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      setSelectedFiles(prev => [...prev, ...files]);
      
      // Generate previews
      files.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target && e.target.result) {
            setPreviews(prev => [...prev, e.target.result as string]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      toast({
        title: "No files selected",
        description: "Please select at least one image to upload",
        variant: "destructive",
      });
      return;
    }

    try {
      setUploading(true);
      
      const token = localStorage.getItem("booking_access_token");
      if (!token) {
        throw new Error("Authentication required");
      }

      const formData = new FormData();
      selectedFiles.forEach(file => {
        formData.append('files', file);
      });

      let endpoint = '';
      if (mode === 'temporary') {
        endpoint = 'http://localhost:8001/rest/restaurants/upload-image-temp/';
      } else {
        if (!restaurantId) {
          throw new Error("Restaurant ID is required for permanent upload");
        }
        endpoint = `http://localhost:8001/rest/restaurants/${restaurantId}/upload-image/`;
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Upload failed');
      }

      const result = await response.json();
      
      if (result && result.length > 0) {
        toast({
          title: "Upload Successful",
          description: `Successfully uploaded ${result.length} image${result.length > 1 ? 's' : ''}`,
        });
        
        // Clear the form
        setSelectedFiles([]);
        setPreviews([]);
        
        // Notify parent component
        if (onImagesUploaded) {
          // Для временной загрузки возвращаем массив URL строк
          // Для постоянной загрузки возвращаем массив объектов с URL
          const imageUrls = mode === 'temporary' 
            ? result 
            : result.map((img: any) => img.url);
          onImagesUploaded(imageUrls);
        }
      } else {
        throw new Error("No images were uploaded");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Failed to upload images",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className="flex-1"
          />
          <Button 
            onClick={handleUpload}
            disabled={uploading || selectedFiles.length === 0}
            className="flex items-center gap-2"
          >
            <Upload className="h-4 w-4" />
            {uploading ? 'Uploading...' : 'Upload'}
          </Button>
        </div>
        
        {previews.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
            {previews.map((preview, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square rounded-md overflow-hidden border border-border">
                  <img 
                    src={preview} 
                    alt={`Preview ${index + 1}`} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="absolute top-1 right-1 bg-background/80 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
        
        {previews.length === 0 && (
          <div className="border border-dashed border-border rounded-md p-8 text-center">
            <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">
              Select images to upload
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default ImageUploader;