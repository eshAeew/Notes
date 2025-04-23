import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTheme } from "@/hooks/useTheme";
import EditorToolbar from "@/components/EditorToolbar";
import { useMobile } from "@/hooks/use-mobile";
import {
  Moon,
  Sun,
  Plus,
  Search,
  MoreVertical,
  X
} from "lucide-react";

interface HeaderProps {
  onNewNote: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  isSearching: boolean;
}

export default function Header({ onNewNote, searchQuery, onSearchChange, isSearching }: HeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const isMobile = useMobile();
  
  const toggleSearch = () => {
    setIsSearchVisible(!isSearchVisible);
    if (isSearchVisible) {
      onSearchChange("");
    }
  };
  
  return (
    <header className="border-b border-border bg-secondary/30">
      <div className="flex items-center justify-between px-4 py-2">
        {/* Left section with logo */}
        <div className="flex items-center gap-2">
          <span className="text-primary font-medium">Notepad Pro</span>
        </div>
        
        {/* Center controls and search */}
        <div className="flex items-center space-x-1 sm:space-x-2">
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground"
            onClick={onNewNote}
            title="New Note"
          >
            <Plus size={18} />
          </Button>
          
          {!isMobile && (
            <div className="relative hidden md:block">
              <Input
                type="text"
                placeholder="Search notes..."
                className="w-60 text-sm"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
              />
              {searchQuery ? (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6"
                  onClick={() => onSearchChange("")}
                >
                  <X size={14} />
                </Button>
              ) : (
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
              )}
            </div>
          )}
          
          {isMobile && (
            <>
              {isSearchVisible ? (
                <div className="flex-1 flex items-center">
                  <Input
                    type="text"
                    placeholder="Search notes..."
                    className="text-sm w-full"
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    autoFocus
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="ml-1"
                    onClick={toggleSearch}
                  >
                    <X size={18} />
                  </Button>
                </div>
              ) : (
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground"
                  onClick={toggleSearch}
                  title="Search"
                >
                  <Search size={18} />
                </Button>
              )}
            </>
          )}
        </div>
        
        {/* Right section with theme toggle and user */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground"
            onClick={toggleTheme}
            title="Theme toggle"
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground"
            title="More options"
          >
            <MoreVertical size={18} />
          </Button>
          
          <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
            <span className="text-xs font-medium">JP</span>
          </div>
        </div>
      </div>
      
      {/* Editor toolbar */}
      <EditorToolbar />
    </header>
  );
}
