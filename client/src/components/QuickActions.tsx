import { Button } from "@/components/ui/button";
import { FileText, Expand, Download } from "lucide-react";
import { Note } from "@shared/schema";
import { exportToPDF, exportToText } from "@/lib/utils/export";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface QuickActionsProps {
  note: Note;
}

export default function QuickActions({ note }: QuickActionsProps) {
  const [wordCount, setWordCount] = useState(() => {
    try {
      const content = JSON.parse(note.content);
      let text = "";
      
      const extractText = (node: any) => {
        if (node.text) {
          text += node.text + " ";
        }
        
        if (node.content) {
          node.content.forEach(extractText);
        }
      };
      
      if (content.content) {
        content.content.forEach(extractText);
      }
      
      return text.trim().split(/\s+/).filter(Boolean).length;
    } catch {
      return 0;
    }
  });
  
  const handleExport = (format: 'pdf' | 'text') => {
    if (format === 'pdf') {
      exportToPDF(note);
    } else {
      exportToText(note);
    }
  };
  
  const toggleFocusMode = () => {
    document.documentElement.requestFullscreen();
  };
  
  return (
    <div className="fixed bottom-4 left-4 md:flex items-center bg-secondary/80 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg hidden">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
              <FileText size={16} />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p>Word count</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      <span className="mx-2 text-sm text-foreground/80">{wordCount} words</span>
      
      <Separator orientation="vertical" className="h-4 mx-1" />
      
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-muted-foreground"
              onClick={toggleFocusMode}
            >
              <Expand size={16} />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p>Focus mode</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      <Separator orientation="vertical" className="h-4 mx-1" />
      
      <DropdownMenu>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                  <Download size={16} />
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>Export</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <DropdownMenuContent align="start">
          <DropdownMenuItem onClick={() => handleExport('pdf')}>
            Export as PDF
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleExport('text')}>
            Export as Text
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
