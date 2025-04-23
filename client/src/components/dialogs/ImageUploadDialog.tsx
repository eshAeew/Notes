import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Image, Upload, Link } from "lucide-react";

interface ImageUploadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (url: string, alt?: string) => void;
}

export function ImageUploadDialog({
  isOpen,
  onClose,
  onConfirm,
}: ImageUploadDialogProps) {
  const [url, setUrl] = useState("");
  const [alt, setAlt] = useState("");
  const [activeTab, setActiveTab] = useState<"upload" | "url">("upload");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset form when dialog opens
  useEffect(() => {
    if (isOpen) {
      setUrl("");
      setAlt("");
      setSelectedFile(null);
      setPreviewUrl(null);
      setActiveTab("upload");
    }
  }, [isOpen]);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (activeTab === "upload" && previewUrl) {
      onConfirm(previewUrl, alt);
    } else if (activeTab === "url" && url.trim()) {
      onConfirm(url, alt);
    }
    
    onClose();
  };

  // Trigger file input click
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Insert Image</DialogTitle>
            <DialogDescription>
              Upload an image or provide a URL.
            </DialogDescription>
          </DialogHeader>
          
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "upload" | "url")} className="mt-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upload" className="flex items-center gap-2">
                <Upload size={16} />
                <span>Upload</span>
              </TabsTrigger>
              <TabsTrigger value="url" className="flex items-center gap-2">
                <Link size={16} />
                <span>URL</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="upload" className="py-4">
              <div className="flex flex-col items-center gap-4">
                <div
                  className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 w-full flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={handleUploadClick}
                >
                  {previewUrl ? (
                    <div className="w-full">
                      <img 
                        src={previewUrl} 
                        alt="Preview" 
                        className="max-h-48 mx-auto object-contain rounded-md" 
                      />
                      <p className="text-xs text-center mt-2 text-muted-foreground">
                        {selectedFile?.name} ({Math.round(selectedFile?.size || 0 / 1024)} KB)
                      </p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Image size={36} className="mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm font-medium">Click to select an image</p>
                      <p className="text-xs text-muted-foreground mt-1">or drag and drop</p>
                    </div>
                  )}
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4 w-full">
                  <Label htmlFor="image-alt" className="text-right">
                    Alt Text
                  </Label>
                  <Input
                    id="image-alt"
                    type="text"
                    placeholder="Description of the image"
                    value={alt}
                    onChange={(e) => setAlt(e.target.value)}
                    className="col-span-3"
                  />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="url" className="py-4">
              <div className="grid gap-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="image-url" className="text-right">
                    URL
                  </Label>
                  <Input
                    id="image-url"
                    type="url"
                    placeholder="https://example.com/image.jpg"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="col-span-3"
                    autoFocus={activeTab === "url"}
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="image-alt-url" className="text-right">
                    Alt Text
                  </Label>
                  <Input
                    id="image-alt-url"
                    type="text"
                    placeholder="Description of the image"
                    value={alt}
                    onChange={(e) => setAlt(e.target.value)}
                    className="col-span-3"
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          <DialogFooter className="mt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={(activeTab === "upload" && !previewUrl) || (activeTab === "url" && !url)}
            >
              Insert Image
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}