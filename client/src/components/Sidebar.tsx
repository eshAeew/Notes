import { useState } from "react";
import { Folder, Note } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  FolderIcon,
  FolderOpenIcon,
  PlusIcon,
  DownloadIcon,
  Trash2,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import useFolders from "@/hooks/useFolders";
import { useToast } from "@/hooks/use-toast";

interface SidebarProps {
  folders: Folder[];
  notes: Note[];
  selectedFolderId: number;
  selectedNoteId: number | null;
  onFolderSelect: (folderId: number) => void;
  onNoteSelect: (noteId: number) => void;
  onNewNote: () => void;
  isLoading: boolean;
  isError: boolean;
  isOpen: boolean;
  isSearching: boolean;
  searchQuery: string;
  onDeleteNote: (noteId: number) => void;
}

export default function Sidebar({
  folders,
  notes,
  selectedFolderId,
  selectedNoteId,
  onFolderSelect,
  onNoteSelect,
  onNewNote,
  isLoading,
  isError,
  isOpen,
  isSearching,
  searchQuery,
  onDeleteNote,
}: SidebarProps) {
  const [newFolderName, setNewFolderName] = useState("");
  const [showNewFolderDialog, setShowNewFolderDialog] = useState(false);
  const [showDeleteNoteDialog, setShowDeleteNoteDialog] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<number | null>(null);
  
  const { createFolder } = useFolders();
  const { toast } = useToast();
  
  if (!isOpen) {
    return null;
  }
  
  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      toast({
        title: "Error",
        description: "Folder name cannot be empty",
        variant: "destructive",
      });
      return;
    }
    
    try {
      await createFolder({ name: newFolderName, icon: "folder" });
      setNewFolderName("");
      setShowNewFolderDialog(false);
      
      toast({
        title: "Success",
        description: "Folder created successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create folder",
        variant: "destructive",
      });
    }
  };
  
  const confirmDeleteNote = (noteId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setNoteToDelete(noteId);
    setShowDeleteNoteDialog(true);
  };
  
  const handleDeleteNote = () => {
    if (noteToDelete) {
      onDeleteNote(noteToDelete);
      setShowDeleteNoteDialog(false);
      setNoteToDelete(null);
    }
  };
  
  const renderFolderSkeleton = () => (
    <div className="px-2 py-3">
      <div className="px-2 mb-2">
        <Skeleton className="h-4 w-20" />
      </div>
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex items-center px-2 py-1.5 mb-1">
          <Skeleton className="h-4 w-4 mr-2" />
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-4 w-4 ml-auto" />
        </div>
      ))}
    </div>
  );
  
  const renderNotesSkeleton = () => (
    <div className="px-1 pt-2">
      <div className="px-2 mb-2">
        <Skeleton className="h-4 w-20" />
      </div>
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="p-2 mb-1">
          <div className="flex items-start justify-between mb-1">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-6" />
          </div>
          <Skeleton className="h-4 w-full mb-1" />
          <Skeleton className="h-4 w-2/3 mb-2" />
          <div className="flex items-center">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-12 ml-auto" />
          </div>
        </div>
      ))}
    </div>
  );
  
  const getNoteDateText = (date: Date) => {
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: false });
    } catch {
      return "unknown time";
    }
  };
  
  return (
    <aside className="w-64 border-r border-border flex-shrink-0 flex flex-col h-full overflow-hidden md:relative">
      {/* Folders section */}
      <div className="px-2 py-3">
        <h2 className="text-xs font-semibold uppercase text-muted-foreground px-2 mb-2">
          Folders
        </h2>
        
        {isLoading ? (
          renderFolderSkeleton()
        ) : (
          <div>
            <ul>
              {folders.map((folder) => (
                <li
                  key={folder.id}
                  className={cn(
                    "folder-item",
                    selectedFolderId === folder.id && "is-active"
                  )}
                  onClick={() => onFolderSelect(folder.id)}
                >
                  {selectedFolderId === folder.id ? (
                    <FolderOpenIcon className="text-primary mr-2 text-sm" size={16} />
                  ) : (
                    <FolderIcon className="text-muted-foreground mr-2 text-sm" size={16} />
                  )}
                  <span className="text-sm">{folder.name}</span>
                  <span className="ml-auto text-xs text-muted-foreground">
                    {notes.filter(note => !isSearching && note.folderId === folder.id).length}
                  </span>
                </li>
              ))}
            </ul>
            
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center mt-2 text-muted-foreground text-sm hover:text-primary w-full justify-start"
              onClick={() => setShowNewFolderDialog(true)}
            >
              <PlusIcon size={14} className="mr-2" />
              <span>New Folder</span>
            </Button>
          </div>
        )}
      </div>
      
      {/* Notes list section */}
      <ScrollArea className="flex-1">
        <div className="sticky top-0 bg-background z-10 px-1 pt-2 pb-1">
          <h2 className="text-xs font-semibold uppercase text-muted-foreground px-2 mb-2">
            {isSearching ? `Search Results: "${searchQuery}"` : folders.find(f => f.id === selectedFolderId)?.name || "All Notes"}
          </h2>
        </div>
        
        {isLoading ? (
          renderNotesSkeleton()
        ) : notes.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <p className="text-muted-foreground text-sm mb-4">
              {isSearching ? "No notes match your search" : "No notes in this folder"}
            </p>
            <Button size="sm" onClick={onNewNote}>
              Create a new note
            </Button>
          </div>
        ) : (
          <ul className="space-y-1 px-1">
            {notes.map((note) => (
              <li
                key={note.id}
                className={cn(
                  "note-item",
                  selectedNoteId === note.id && "is-active"
                )}
                onClick={() => onNoteSelect(note.id)}
              >
                <div className="flex items-start justify-between group">
                  <h3 className={cn(
                    "font-medium text-sm",
                    selectedNoteId === note.id ? "text-primary" : "text-foreground"
                  )}>
                    {note.title}
                  </h3>
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-muted-foreground">
                      {getNoteDateText(note.updatedAt)}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => confirmDeleteNote(note.id, e)}
                    >
                      <Trash2 size={14} className="text-muted-foreground hover:text-destructive" />
                    </Button>
                  </div>
                </div>
                
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {note.content && typeof note.content === 'string' && note.content.length > 2 
                    ? JSON.parse(note.content)?.content?.map((block: any) => 
                        block.content?.map((item: any) => item.text).join(' ')
                      ).join(' ').substring(0, 100) + '...'
                    : 'Empty note'}
                </p>
                
                <div className="flex items-center mt-2 text-xs text-muted-foreground">
                  <span>{new Date(note.updatedAt).toLocaleDateString()}</span>
                  <span className="ml-auto flex items-center text-status-saved">
                    <i className="fa fa-check text-xs mr-1"></i>
                    Saved
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </ScrollArea>
      
      {/* Sidebar footer actions */}
      <div className="border-t border-border p-2">
        <Button
          variant="ghost"
          className="flex items-center w-full rounded-md px-3 py-2 text-sm hover:bg-secondary transition-colors"
        >
          <DownloadIcon className="mr-2" size={16} />
          <span>Export Notes</span>
        </Button>
      </div>
      
      {/* New Folder Dialog */}
      <Dialog open={showNewFolderDialog} onOpenChange={setShowNewFolderDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
            <DialogDescription>
              Enter a name for your new folder.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="folder-name" className="text-right">
                Name
              </Label>
              <Input
                id="folder-name"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                className="col-span-3"
                placeholder="My Folder"
                autoFocus
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewFolderDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateFolder}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Note Confirmation Dialog */}
      <Dialog open={showDeleteNoteDialog} onOpenChange={setShowDeleteNoteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Note</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this note? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteNoteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteNote}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </aside>
  );
}
