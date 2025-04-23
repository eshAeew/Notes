import React from "react";
import { ContextMenuBase, ContextMenuSectionDefinition } from "./ContextMenuBase";
import { Folder } from "@shared/schema";
import {
  FolderPlus,
  Pencil,
  Trash2,
  Files,
  File,
  MoveRight,
  ClipboardPaste
} from "lucide-react";

interface FolderContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  folder?: Folder;
  onNewFolder?: () => void;
  onRenameFolder?: (folder: Folder) => void;
  onDeleteFolder?: (folder: Folder) => void;
  onNewNote?: (folderId: number) => void;
}

export const FolderContextMenu: React.FC<FolderContextMenuProps> = ({
  x,
  y,
  onClose,
  folder,
  onNewFolder,
  onRenameFolder,
  onDeleteFolder,
  onNewNote
}) => {
  // Generate menu sections
  const getSections = (): ContextMenuSectionDefinition[] => {
    const sections: ContextMenuSectionDefinition[] = [];
    
    // Folder operations
    sections.push({
      id: 'folder-operations',
      items: [
        {
          id: 'new-folder',
          label: 'New Folder',
          icon: <FolderPlus size={16} />,
          onClick: () => onNewFolder && onNewFolder(),
        },
        {
          id: 'new-note',
          label: 'New Note',
          icon: <File size={16} />,
          onClick: () => folder && onNewNote && onNewNote(folder.id),
          disabled: !folder,
        },
        { id: 'folder-ops-divider', divider: true }
      ]
    });
    
    // Edit operations (only if a folder is selected)
    if (folder) {
      // Don't allow deleting the default folder (usually the "All Notes" folder with ID 1)
      const isDefaultFolder = folder.id === 1;
      
      sections.push({
        id: 'edit-operations',
        items: [
          {
            id: 'rename-folder',
            label: 'Rename Folder',
            icon: <Pencil size={16} />,
            onClick: () => onRenameFolder && onRenameFolder(folder),
            disabled: isDefaultFolder,
          },
          {
            id: 'delete-folder',
            label: 'Delete Folder',
            icon: <Trash2 size={16} />,
            onClick: () => onDeleteFolder && onDeleteFolder(folder),
            disabled: isDefaultFolder,
            variant: 'destructive',
          },
          { id: 'edit-ops-divider', divider: true }
        ]
      });
    }
    
    // Clipboard operations
    sections.push({
      id: 'clipboard',
      items: [
        {
          id: 'copy',
          label: 'Copy Path',
          icon: <Files size={16} />,
          onClick: () => {},
        },
        {
          id: 'paste',
          label: 'Paste',
          icon: <ClipboardPaste size={16} />,
          onClick: () => {},
        },
      ]
    });
    
    return sections;
  };

  return (
    <ContextMenuBase
      x={x}
      y={y}
      onClose={onClose}
      sections={getSections()}
    />
  );
};