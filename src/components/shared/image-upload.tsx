"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ImagePlus, Trash, X } from "lucide-react";
import { Input } from "@/components/ui/input";

interface ImageUploadProps {
  disabled?: boolean;
  onChange: (value: string[]) => void;
  onRemove: (value: string) => void;
  value: string[];
}

export function ImageUpload({
  disabled,
  onChange,
  onRemove,
  value
}: ImageUploadProps) {
  const [mounted, setMounted] = useState(false);
  const [url, setUrl] = useState("");

  useEffect(() => {
    const handle = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(handle);
  }, []);

  if (!mounted) {
    return null;
  }

  const onAdd = () => {
    if (!url) return;
    onChange([...value, url]);
    setUrl("");
  };

  return (
    <div>
      <div className="mb-4 flex items-center flex-wrap gap-4">
        {value.map((url) => (
          <div key={url} className="relative w-[200px] h-[200px] rounded-md overflow-hidden border bg-muted/30 group">
            <div className="z-10 absolute top-2 right-2">
              <Button type="button" onClick={() => onRemove(url)} variant="destructive" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                <Trash className="h-4 w-4" />
              </Button>
            </div>
            <img
              className="object-cover w-full h-full"
              alt="Product image"
              src={url}
            />
          </div>
        ))}
      </div>

      <div className="flex items-center gap-x-2">
        <Input
            disabled={disabled}
            placeholder="Paste image URL here..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => {
                if (e.key === "Enter") {
                    e.preventDefault();
                    onAdd();
                }
            }}
        />
        <Button
          type="button"
          disabled={disabled || !url}
          variant="secondary"
          onClick={onAdd}
          className="flex-shrink-0"
        >
          <ImagePlus className="h-4 w-4 mr-2" />
          Add Image
        </Button>
      </div>
      <p className="text-[10px] text-muted-foreground mt-2">
          Note: This is an MVP placeholder. In production, this would integrate with a storage service like UploadThing or Cloudinary.
      </p>
    </div>
  );
}
