import { Button } from "@/components/ui/button";
import { Plus, Menu } from "lucide-react";

interface MobileControlsProps {
  onNewNote: () => void;
  onToggleSidebar: () => void;
}

export default function MobileControls({ onNewNote, onToggleSidebar }: MobileControlsProps) {
  return (
    <div className="md:hidden fixed bottom-4 right-4 flex flex-col gap-2 z-10">
      <Button
        size="icon"
        className="w-12 h-12 rounded-full shadow-lg bg-primary text-primary-foreground hover:bg-primary/90"
        onClick={onNewNote}
      >
        <Plus size={22} />
      </Button>
      
      <Button
        variant="secondary"
        size="icon"
        className="w-12 h-12 rounded-full shadow-lg"
        onClick={onToggleSidebar}
      >
        <Menu size={22} />
      </Button>
    </div>
  );
}
