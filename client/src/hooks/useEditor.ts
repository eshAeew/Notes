import { useEditor as useTipTap, EditorOptions } from '@tiptap/react';
import { useState } from 'react';

// A singleton pattern to avoid React Context issues
let editorInstance: ReturnType<typeof useTipTap> | null = null;
let editorSetterCallback: ((editor: ReturnType<typeof useTipTap>) => void) | null = null;

// Provider component for the editor
export function EditorProvider({ children }: { children: React.ReactNode }) {
  return children;
}

// Hook to access editor state
export function useEditor() {
  return {
    editor: editorInstance,
    isEditorActive: !!editorInstance?.isEditable,
    setEditor: (editor: ReturnType<typeof useTipTap>) => {
      editorInstance = editor;
      if (editorSetterCallback) {
        editorSetterCallback(editor);
      }
    }
  };
}

// Hook to create and initialize TipTap editor
export function useTipTapEditor(options: Partial<EditorOptions>) {
  const [localEditor, setLocalEditor] = useState<ReturnType<typeof useTipTap> | null>(null);
  
  // Set up the callback to update our local state
  editorSetterCallback = setLocalEditor;
  
  const editor = useTipTap({
    ...options,
    editorProps: {
      attributes: {
        class: 'outline-none w-full prose prose-sm dark:prose-invert prose-headings:font-semibold prose-p:my-3 prose-img:rounded-md',
      },
    },
  });
  
  // Register editor with our singleton
  if (editor && !editor.isDestroyed) {
    editorInstance = editor;
  }
  
  return editor;
}
