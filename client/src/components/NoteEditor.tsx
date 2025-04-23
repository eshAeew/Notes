import { useState, useEffect, useCallback } from "react";
import { Note } from "@shared/schema";
import { EditorProvider } from "@/hooks/useEditor";
import { EditorContent } from "@tiptap/react";
import { useTipTapEditor } from "@/hooks/useEditor";
import { getTipTapExtensions } from "@/lib/utils/editor-extensions";
import { Input } from "@/components/ui/input";
import { Check, AlertCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { debounce } from "@/lib/utils";
import TagManager from "@/components/TagManager";

interface NoteEditorProps {
  note: Note;
  onSave: (id: number, data: Partial<Note>) => Promise<Note | undefined>;
  isSaving: boolean;
}

function NoteEditorContent({ note, onSave, isSaving }: NoteEditorProps) {
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const [tags, setTags] = useState<string[]>(note.tags || []);
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "error">("saved");
  
  // Initialize editor with content from note
  const editor = useTipTapEditor({
    extensions: getTipTapExtensions(),
    content: note.content ? JSON.parse(note.content) : undefined,
    onUpdate: ({ editor }) => {
      const json = editor.getJSON();
      setContent(JSON.stringify(json));
      debouncedSave(note.id, { content: JSON.stringify(json) });
      setSaveStatus("saving");
    },
  });
  
  // Create a debounced save function
  const debouncedSave = useCallback(
    debounce(async (id: number, data: Partial<Note>) => {
      try {
        await onSave(id, data);
        setSaveStatus("saved");
      } catch (error) {
        setSaveStatus("error");
        console.error("Error saving note:", error);
      }
    }, 1000),
    [onSave]
  );
  
  // Handle title changes
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    debouncedSave(note.id, { title: newTitle });
    setSaveStatus("saving");
  };
  
  // Update content when note changes
  useEffect(() => {
    if (note.id && editor && JSON.stringify(note.content) !== content) {
      try {
        const contentObj = note.content ? JSON.parse(note.content) : { type: "doc", content: [{ type: "paragraph" }] };
        editor.commands.setContent(contentObj);
        setContent(note.content);
      } catch (error) {
        console.error("Error setting editor content:", error);
      }
    }
    
    setTitle(note.title);
    setTags(note.tags || []);
  }, [note.id, editor, note.tags]);
  
  // Handle tag changes
  const handleTagsChange = (newTags: string[]) => {
    setTags(newTags);
    debouncedSave(note.id, { tags: newTags });
    setSaveStatus("saving");
  };
  
  // Sync with isSaving prop
  useEffect(() => {
    if (isSaving) {
      setSaveStatus("saving");
    }
  }, [isSaving]);
  
  const formatLastEdited = (date: Date) => {
    try {
      return `Last edited: ${new Date(date).toLocaleDateString()} at ${new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } catch {
      return "Last edited: Unknown";
    }
  };
  
  return (
    <main className="flex-1 flex flex-col overflow-hidden bg-background">
      {/* Note title */}
      <div className="border-b border-border px-6 py-4">
        <Input
          type="text"
          value={title}
          onChange={handleTitleChange}
          className="bg-transparent border-none w-full text-xl font-medium text-foreground focus-visible:ring-0 p-0 h-auto"
        />
        
        {/* Tags */}
        <div className="mt-3">
          <TagManager 
            tags={tags} 
            onTagsChange={handleTagsChange} 
            className="mb-2"
          />
        </div>
        
        <div className="flex items-center mt-1 text-xs text-muted-foreground">
          <span>{formatLastEdited(note.updatedAt)}</span>
          <div className={cn(
            "ml-auto flex items-center",
            saveStatus === "saved" && "status-saved",
            saveStatus === "saving" && "status-editing",
            saveStatus === "error" && "status-error"
          )}>
            {saveStatus === "saved" && (
              <>
                <Check size={14} className="mr-1" />
                <span>All changes saved</span>
              </>
            )}
            
            {saveStatus === "saving" && (
              <>
                <Clock size={14} className="mr-1 animate-spin" />
                <span>Saving...</span>
              </>
            )}
            
            {saveStatus === "error" && (
              <>
                <AlertCircle size={14} className="mr-1" />
                <span>Error saving changes</span>
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* Editor content */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        <EditorContent editor={editor} className="tiptap min-h-[300px]" />
      </div>
    </main>
  );
}

export default function NoteEditor(props: NoteEditorProps) {
  return (
    <EditorProvider>
      <NoteEditorContent {...props} />
    </EditorProvider>
  );
}
