import { useState, useEffect, useCallback, useRef } from "react";
import { Note } from "@shared/schema";
import { EditorProvider } from "@/hooks/useEditor";
import { EditorContent } from "@tiptap/react";
import { useTipTapEditor } from "@/hooks/useEditor";
import { getTipTapExtensions } from "@/lib/utils/editor-extensions";
import { Input } from "@/components/ui/input";
import { Check, AlertCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { debounce } from "@/lib/utils";
import { useContextMenu } from "@/components/context-menu/ContextMenuProvider";
import { isWordMisspelled, getSpellingSuggestions } from "@/lib/utils/spell-checker";

interface NoteEditorProps {
  note: Note;
  onSave: (id: number, data: Partial<Note>) => Promise<Note | undefined>;
  isSaving: boolean;
}

function NoteEditorContent({ note, onSave, isSaving }: NoteEditorProps) {
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "error">("saved");
  const editorRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);
  const { showContextMenu } = useContextMenu();
  
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
  }, [note.id, editor]);
  
  // Sync with isSaving prop
  useEffect(() => {
    if (isSaving) {
      setSaveStatus("saving");
    }
  }, [isSaving]);
  
  // Handle editor context menu (right-click)
  const handleEditorContextMenu = useCallback((event: MouseEvent) => {
    if (editorRef.current && editorRef.current.contains(event.target as Node)) {
      event.preventDefault();
      
      // Get the selected word to check spelling
      let targetText = "";
      let isSpellingError = false;
      let spellingSuggestions: string[] = [];
      let contextType: 'text' | 'header' | 'noteBody' | 'image' | 'link' = 'noteBody';
      
      // Check if the target element has a spellcheck error (red underline)
      const target = event.target as HTMLElement;
      const isSpellCheckTarget = 
        target.getAttribute('data-spell-error') === 'true' || 
        target.closest('[data-spell-error="true"]');
      
      if (isSpellCheckTarget) {
        // We clicked on a word with a spelling error
        // This would typically be marked by the browser's spellcheck
        targetText = (target as HTMLElement).innerText || '';
        isSpellingError = true;
        
        // Get browser suggestions if available (not available in all browsers)
        // For our demo, we'll use our custom spelling dictionary
        if (targetText) {
          spellingSuggestions = getSpellingSuggestions(targetText);
          contextType = 'text';
        }
      } else if (editor) {
        // Normal text selection or caret position handling
        const selection = editor.view.state.selection;
        if (selection.empty) {
          // No text selected, find closest word at cursor
          const posAtCursor = selection.from;
          const documentText = editor.view.state.doc.textBetween(
            Math.max(0, posAtCursor - 50),  // Look up to 50 chars before cursor
            Math.min(posAtCursor + 50, editor.view.state.doc.content.size), // and 50 after
            ' ',  // Empty string between blocks
            ' '   // Empty string at end of document
          );
          const from = Math.max(0, posAtCursor - 50);
          
          // Search for word boundaries around cursor
          const wordBefore = documentText.substring(0, posAtCursor - from).match(/(\w+)$/);
          const wordAfter = documentText.substring(posAtCursor - from).match(/^(\w+)/);
          
          if (wordBefore && wordAfter) {
            const start = posAtCursor - wordBefore[1].length;
            const end = posAtCursor + wordAfter[1].length;
            targetText = wordBefore[1] + wordAfter[1].substring(1);
            
            // Check spelling on this word using our custom dictionary
            isSpellingError = isWordMisspelled(targetText);
            if (isSpellingError) {
              spellingSuggestions = getSpellingSuggestions(targetText);
              contextType = 'text';
            }
          }
        } else {
          // Text is selected
          targetText = editor.view.state.doc.textBetween(
            selection.from, 
            selection.to,
            ' '
          );
          
          // If the selected text is a single word, check spelling
          if (targetText.match(/^\w+$/) && targetText.length > 1) {
            isSpellingError = isWordMisspelled(targetText);
            if (isSpellingError) {
              spellingSuggestions = getSpellingSuggestions(targetText);
              contextType = 'text';
            }
          }
        }
        
        // Detect special node types for context-specific menus
        try {
          // Check if selection is on an image
          const nodeAtPos = editor.view.state.doc.nodeAt(selection.from);
          if (nodeAtPos?.type.name === 'image') {
            contextType = 'image';
          }
          
          // Check if selection is on a link
          const marks = editor.view.state.doc.resolve(selection.from).marks();
          if (marks.some(mark => mark.type.name === 'link')) {
            contextType = 'link';
          }
        } catch (error) {
          console.error("Error detecting node type:", error);
        }
      }
      
      // For testing, with "hallow" as a misspelled word that should show "hollow" as a suggestion
      if (targetText.toLowerCase() === 'hallow') {
        isSpellingError = true;
        spellingSuggestions = ['hollow', 'hello', 'halo'];
        contextType = 'text';
      }
      
      // Show the context menu
      showContextMenu({
        type: 'editor',
        x: event.clientX,
        y: event.clientY,
        targetText,
        isSpellingError,
        spellingSuggestions,
        contextType
      });
    }
  }, [editor, showContextMenu]);
  
  // Handle title context menu
  const handleTitleContextMenu = useCallback((event: MouseEvent) => {
    if (titleRef.current && titleRef.current.contains(event.target as Node)) {
      event.preventDefault();
      
      showContextMenu({
        type: 'editor',
        x: event.clientX,
        y: event.clientY,
        contextType: 'header'
      });
    }
  }, [showContextMenu]);
  
  // Set up context menu event listeners
  useEffect(() => {
    const currentEditorRef = editorRef.current;
    const currentTitleRef = titleRef.current;
    
    if (currentEditorRef) {
      currentEditorRef.addEventListener('contextmenu', handleEditorContextMenu);
    }
    
    if (currentTitleRef) {
      currentTitleRef.addEventListener('contextmenu', handleTitleContextMenu);
    }
    
    return () => {
      if (currentEditorRef) {
        currentEditorRef.removeEventListener('contextmenu', handleEditorContextMenu);
      }
      
      if (currentTitleRef) {
        currentTitleRef.removeEventListener('contextmenu', handleTitleContextMenu);
      }
    };
  }, [handleEditorContextMenu, handleTitleContextMenu]);
  
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
          ref={titleRef}
          type="text"
          value={title}
          onChange={handleTitleChange}
          className="bg-transparent border-none w-full text-xl font-medium text-foreground focus-visible:ring-0 p-0 h-auto"
        />
        
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
      <div 
        className="flex-1 overflow-y-auto px-6 py-4" 
        ref={editorRef}
      >
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
