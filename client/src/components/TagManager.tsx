import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tag, X, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface TagManagerProps {
  tags: string[] | null;
  onTagsChange: (tags: string[]) => void;
  readOnly?: boolean;
  className?: string;
  maxTags?: number;
}

export default function TagManager({ 
  tags = [], 
  onTagsChange, 
  readOnly = false,
  className,
  maxTags = 10
}: TagManagerProps) {
  const [tagList, setTagList] = useState<string[]>(tags || []);
  const [inputValue, setInputValue] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Update parent component when tags change
  useEffect(() => {
    onTagsChange(tagList);
  }, [tagList, onTagsChange]);
  
  // Update internal state when external tags change
  useEffect(() => {
    setTagList(tags || []);
  }, [tags]);
  
  const addTag = () => {
    setErrorMessage(null);
    const trimmedValue = inputValue.trim();
    
    if (!trimmedValue) {
      return;
    }
    
    if (tagList.includes(trimmedValue)) {
      setErrorMessage("This tag already exists");
      return;
    }
    
    if (tagList.length >= maxTags) {
      setErrorMessage(`Maximum ${maxTags} tags allowed`);
      return;
    }
    
    if (trimmedValue.length > 20) {
      setErrorMessage("Tag must be 20 characters or less");
      return;
    }
    
    setTagList([...tagList, trimmedValue]);
    setInputValue("");
  };
  
  const removeTag = (tagToRemove: string) => {
    setTagList(tagList.filter(tag => tag !== tagToRemove));
    setErrorMessage(null);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
    
    // Add tag on comma or space
    if (e.key === ',' || e.key === ' ') {
      e.preventDefault();
      addTag();
    }
    
    // Remove last tag on backspace if input is empty
    if (e.key === 'Backspace' && inputValue === "" && tagList.length > 0) {
      setTagList(tagList.slice(0, -1));
    }
  };
  
  return (
    <div className={cn("w-full", className)}>
      {!readOnly && (
        <div className="flex gap-2 mb-2">
          <div className="relative flex-1">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Add tags..."
              className="pr-8"
              disabled={readOnly}
            />
            {inputValue && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-2 hover:bg-transparent"
                onClick={() => setInputValue("")}
                type="button"
              >
                <X size={14} />
              </Button>
            )}
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={addTag}
            disabled={!inputValue.trim() || readOnly}
            type="button"
          >
            <Plus size={16} />
          </Button>
        </div>
      )}
      
      {errorMessage && (
        <p className="text-xs text-destructive mt-1">{errorMessage}</p>
      )}
      
      <div className="flex flex-wrap gap-1 mt-1">
        {tagList.length === 0 && !readOnly ? (
          <p className="text-xs text-muted-foreground">No tags added yet</p>
        ) : tagList.length === 0 && readOnly ? (
          <p className="text-xs text-muted-foreground">No tags</p>
        ) : (
          tagList.map((tag) => (
            <Badge 
              key={tag}
              variant="secondary"
              className={cn(
                "flex items-center gap-1 pl-2 tag-badge",
                !readOnly && "pr-1"
              )}
            >
              <Tag size={10} className="mr-1" />
              {tag}
              {!readOnly && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 rounded-full hover:bg-destructive hover:text-destructive-foreground"
                  onClick={() => removeTag(tag)}
                  type="button"
                >
                  <X size={10} />
                </Button>
              )}
            </Badge>
          ))
        )}
      </div>
    </div>
  );
}