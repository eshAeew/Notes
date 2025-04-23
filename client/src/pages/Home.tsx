import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import NoteEditor from "@/components/NoteEditor";
import MobileControls from "@/components/MobileControls";
import QuickActions from "@/components/QuickActions";
import useNotes from "@/hooks/useNotes";
import useFolders from "@/hooks/useFolders";
import EmptyState from "@/components/EmptyState";
import { useToast } from "@/hooks/use-toast";
import { useMobile } from "@/hooks/use-mobile";

export default function Home() {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [selectedFolderId, setSelectedFolderId] = useState<number>(1); // Default to "All Notes"
  const [selectedNoteId, setSelectedNoteId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const isMobile = useMobile();
  
  // Fetch folders data
  const { 
    folders, 
    isLoading: isFoldersLoading,
    isError: isFoldersError
  } = useFolders();
  
  // Fetch notes data based on selected folder or search query
  const { 
    notes, 
    selectedNote,
    isLoading: isNotesLoading,
    isError: isNotesError,
    createEmptyNote,
    mutateNote,
    deleteNote,
    isMutating
  } = useNotes({ 
    folderId: selectedFolderId, 
    noteId: selectedNoteId, 
    searchQuery 
  });

  // Automatically close sidebar on mobile
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    } else {
      setSidebarOpen(true);
    }
  }, [isMobile]);
  
  // Auto-select first note when notes load or change
  useEffect(() => {
    if (notes?.length && selectedNoteId === null) {
      setSelectedNoteId(notes[0].id);
    }
    
    // If the selected note is not in the current folder's notes, reset selection
    if (selectedNoteId && notes?.length && !notes.some(note => note.id === selectedNoteId)) {
      setSelectedNoteId(notes[0].id);
    }
  }, [notes, selectedNoteId]);
  
  // Handle new note creation
  const handleNewNote = async () => {
    try {
      const newNote = await createEmptyNote(selectedFolderId);
      setSelectedNoteId(newNote.id);
      toast({
        title: "Note created",
        description: "A new note has been created.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create new note.",
        variant: "destructive",
      });
    }
  };
  
  // Handle note deletion
  const handleDeleteNote = async (id: number) => {
    try {
      await deleteNote(id);
      setSelectedNoteId(null);
      toast({
        title: "Note deleted",
        description: "The note has been deleted.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete note.",
        variant: "destructive",
      });
    }
  };
  
  // Handle folder selection
  const handleFolderSelect = (folderId: number) => {
    setSelectedFolderId(folderId);
    setSelectedNoteId(null); // Reset note selection
    setSearchQuery(""); // Clear search when changing folders
  };
  
  // Handle mobile sidebar toggle
  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };
  
  return (
    <div className="flex flex-col h-full">
      <Header 
        onNewNote={handleNewNote}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        isSearching={searchQuery !== ""}
      />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar 
          folders={folders || []}
          notes={notes || []}
          selectedFolderId={selectedFolderId}
          selectedNoteId={selectedNoteId}
          onFolderSelect={handleFolderSelect}
          onNoteSelect={setSelectedNoteId}
          onNewNote={handleNewNote}
          isLoading={isFoldersLoading || isNotesLoading}
          isError={isFoldersError || isNotesError}
          isOpen={isSidebarOpen}
          isSearching={searchQuery !== ""}
          searchQuery={searchQuery}
          onDeleteNote={handleDeleteNote}
        />
        
        {selectedNote ? (
          <NoteEditor 
            note={selectedNote}
            onSave={mutateNote}
            isSaving={isMutating}
          />
        ) : (
          <EmptyState 
            isLoading={isNotesLoading}
            hasNotes={notes?.length > 0}
            onNewNote={handleNewNote}
          />
        )}
      </div>
      
      {/* Mobile controls */}
      {isMobile && (
        <MobileControls 
          onNewNote={handleNewNote}
          onToggleSidebar={toggleSidebar}
        />
      )}
      
      {/* Quick actions toolbar */}
      {selectedNote && !isMobile && (
        <QuickActions note={selectedNote} />
      )}
    </div>
  );
}
