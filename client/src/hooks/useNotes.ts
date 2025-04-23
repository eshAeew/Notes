import { useQuery, useMutation } from "@tanstack/react-query";
import { Note, InsertNote } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";

interface UseNotesOptions {
  folderId?: number;
  noteId?: number | null;
  searchQuery?: string;
}

export default function useNotes(options: UseNotesOptions = {}) {
  const { folderId, noteId, searchQuery = "" } = options;
  
  // Get notes by folder or search query
  const {
    data: notes,
    isLoading,
    isError,
  } = useQuery<Note[]>({
    queryKey: searchQuery
      ? [`/api/notes/search?q=${encodeURIComponent(searchQuery)}`]
      : folderId
      ? [`/api/notes/folder/${folderId}`]
      : ["/api/notes"],
    enabled: true,
  });
  
  // Get a single note by ID
  const {
    data: selectedNote,
    isLoading: isLoadingSelectedNote,
  } = useQuery<Note>({
    queryKey: [`/api/notes/${noteId}`],
    enabled: !!noteId,
  });
  
  // Create a new note
  const { mutateAsync: createNote } = useMutation({
    mutationFn: async (note: InsertNote) => {
      const res = await apiRequest("POST", "/api/notes", note);
      return res.json() as Promise<Note>;
    },
    onSuccess: () => {
      // Invalidate relevant queries
      if (searchQuery) {
        queryClient.invalidateQueries({ queryKey: [`/api/notes/search?q=${encodeURIComponent(searchQuery)}`] });
      } else if (folderId) {
        queryClient.invalidateQueries({ queryKey: [`/api/notes/folder/${folderId}`] });
      }
      queryClient.invalidateQueries({ queryKey: ["/api/notes"] });
    },
  });
  
  // Create an empty note with default title
  const createEmptyNote = async (folderId: number) => {
    return await createNote({
      title: "Untitled Note",
      content: JSON.stringify({
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [{ type: "text", text: "" }],
          },
        ],
      }),
      folderId,
    });
  };
  
  // Update a note
  const { mutateAsync: updateNote, isPending: isMutating } = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Note> }) => {
      const res = await apiRequest("PUT", `/api/notes/${id}`, data);
      return res.json() as Promise<Note>;
    },
    onSuccess: (updatedNote) => {
      // Update note in cache
      queryClient.setQueryData([`/api/notes/${updatedNote.id}`], updatedNote);
      
      // Invalidate relevant queries
      if (searchQuery) {
        queryClient.invalidateQueries({ queryKey: [`/api/notes/search?q=${encodeURIComponent(searchQuery)}`] });
      } else if (folderId) {
        queryClient.invalidateQueries({ queryKey: [`/api/notes/folder/${folderId}`] });
      }
      queryClient.invalidateQueries({ queryKey: ["/api/notes"] });
    },
  });
  
  // Shorthand for update note mutation
  const mutateNote = async (id: number, data: Partial<Note>) => {
    return await updateNote({ id, data });
  };
  
  // Delete a note
  const { mutateAsync: deleteNoteAsync } = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/notes/${id}`);
      return id;
    },
    onSuccess: (id) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: [`/api/notes/${id}`] });
      
      // Invalidate relevant queries
      if (searchQuery) {
        queryClient.invalidateQueries({ queryKey: [`/api/notes/search?q=${encodeURIComponent(searchQuery)}`] });
      } else if (folderId) {
        queryClient.invalidateQueries({ queryKey: [`/api/notes/folder/${folderId}`] });
      }
      queryClient.invalidateQueries({ queryKey: ["/api/notes"] });
    },
  });
  
  return {
    notes,
    selectedNote,
    isLoading: isLoading || isLoadingSelectedNote,
    isError,
    createNote,
    createEmptyNote,
    mutateNote,
    deleteNote: deleteNoteAsync,
    isMutating,
  };
}
