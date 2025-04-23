import { Button } from "@/components/ui/button";
import { FileText, Plus } from "lucide-react";

interface EmptyStateProps {
  isLoading: boolean;
  hasNotes: boolean;
  onNewNote: () => void;
}

export default function EmptyState({ isLoading, hasNotes, onNewNote }: EmptyStateProps) {
  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading notes...</p>
        </div>
      </div>
    );
  }
  
  if (!hasNotes) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background p-8">
        <div className="text-center max-w-md mx-auto">
          <div className="mb-4 rounded-full bg-muted w-16 h-16 flex items-center justify-center mx-auto">
            <FileText size={28} className="text-primary" />
          </div>
          <h2 className="text-xl font-medium mb-2">No notes yet</h2>
          <p className="text-muted-foreground mb-6">
            Create your first note to get started with Notepad Pro.
          </p>
          <Button onClick={onNewNote}>
            <Plus size={16} className="mr-2" />
            Create New Note
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex-1 flex items-center justify-center bg-background p-8">
      <div className="text-center max-w-md mx-auto">
        <div className="mb-4 rounded-full bg-muted w-16 h-16 flex items-center justify-center mx-auto">
          <FileText size={28} className="text-primary" />
        </div>
        <h2 className="text-xl font-medium mb-2">Select a note</h2>
        <p className="text-muted-foreground mb-6">
          Choose a note from the sidebar or create a new one.
        </p>
        <Button onClick={onNewNote}>
          <Plus size={16} className="mr-2" />
          Create New Note
        </Button>
      </div>
    </div>
  );
}
