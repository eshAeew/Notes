import React, { useState, createContext, useContext, useCallback } from 'react';
import { EditorContextMenu } from './EditorContextMenu';
import { FolderContextMenu } from './FolderContextMenu';
import { NoteContextMenu } from './NoteContextMenu';
import { Folder, Note } from '@shared/schema';

// Define the context menu types
export type ContextMenuType = 
  | { type: 'none' }
  | { 
      type: 'editor'; 
      x: number; 
      y: number; 
      targetText?: string;
      isSpellingError?: boolean;
      spellingSuggestions?: string[];
      contextType?: 'text' | 'header' | 'noteBody' | 'image' | 'link';
    }
  | { 
      type: 'folder'; 
      x: number; 
      y: number; 
      folder?: Folder;
    }
  | { 
      type: 'note'; 
      x: number; 
      y: number; 
      note: Note;
    };

// Define the context type
interface ContextMenuContextType {
  showContextMenu: (menu: ContextMenuType) => void;
  hideContextMenu: () => void;
  activeMenu: ContextMenuType;
}

// Create the context
const ContextMenuContext = createContext<ContextMenuContextType | undefined>(undefined);

// Props for the provider
interface ContextMenuProviderProps {
  children: React.ReactNode;
  folders?: Folder[];
  onNewFolder?: () => void;
  onRenameFolder?: (folder: Folder) => void;
  onDeleteFolder?: (folder: Folder) => void;
  onNewNote?: (folderId: number) => void;
  onRenameNote?: (note: Note) => void;
  onDeleteNote?: (note: Note) => void;
  onMoveNote?: (note: Note, folderId: number) => void;
  onDuplicateNote?: (note: Note) => void;
  onExportNote?: (note: Note, format: 'pdf' | 'text') => void;
}

// Provider component
export const ContextMenuProvider: React.FC<ContextMenuProviderProps> = ({
  children,
  folders = [],
  onNewFolder,
  onRenameFolder,
  onDeleteFolder,
  onNewNote,
  onRenameNote,
  onDeleteNote,
  onMoveNote,
  onDuplicateNote,
  onExportNote
}) => {
  const [activeMenu, setActiveMenu] = useState<ContextMenuType>({ type: 'none' });

  const showContextMenu = useCallback((menu: ContextMenuType) => {
    setActiveMenu(menu);
  }, []);

  const hideContextMenu = useCallback(() => {
    setActiveMenu({ type: 'none' });
  }, []);

  return (
    <ContextMenuContext.Provider value={{ showContextMenu, hideContextMenu, activeMenu }}>
      {children}
      
      {/* Render the appropriate context menu based on type */}
      {activeMenu.type === 'editor' && (
        <EditorContextMenu
          x={activeMenu.x}
          y={activeMenu.y}
          onClose={hideContextMenu}
          targetText={activeMenu.targetText}
          isSpellingError={activeMenu.isSpellingError}
          spellingSuggestions={activeMenu.spellingSuggestions}
          contextType={activeMenu.contextType}
        />
      )}
      
      {activeMenu.type === 'folder' && (
        <FolderContextMenu
          x={activeMenu.x}
          y={activeMenu.y}
          onClose={hideContextMenu}
          folder={activeMenu.folder}
          onNewFolder={onNewFolder}
          onRenameFolder={onRenameFolder}
          onDeleteFolder={onDeleteFolder}
          onNewNote={onNewNote}
        />
      )}
      
      {activeMenu.type === 'note' && (
        <NoteContextMenu
          x={activeMenu.x}
          y={activeMenu.y}
          onClose={hideContextMenu}
          note={activeMenu.note}
          folders={folders}
          onRenameNote={onRenameNote}
          onDeleteNote={onDeleteNote}
          onMoveNote={onMoveNote}
          onDuplicateNote={onDuplicateNote}
          onExportNote={onExportNote}
        />
      )}
    </ContextMenuContext.Provider>
  );
};

// Hook for using the context menu
export const useContextMenu = () => {
  const context = useContext(ContextMenuContext);
  if (!context) {
    throw new Error('useContextMenu must be used within a ContextMenuProvider');
  }
  return context;
};