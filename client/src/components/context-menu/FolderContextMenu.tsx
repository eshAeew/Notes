import React from "react";
import { ContextMenuBase, ContextMenuSectionDefinition } from "./ContextMenuBase";
import { Folder } from "@shared/schema";
import { useTheme } from "@/hooks/useTheme";
import { useToast } from "@/hooks/use-toast";
import {
  FolderPlus,
  Pencil,
  Trash2,
  Files,
  File,
  MoveRight,
  ClipboardPaste,
  FolderOpen,
  Copy,
  FolderArchive,
  FolderInput
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
  const { theme } = useTheme();
  const { toast } = useToast();
  
  // Generate menu sections
  const getSections = (): ContextMenuSectionDefinition[] => {
    const sections: ContextMenuSectionDefinition[] = [];
    
    // Folder operations
    sections.push({
      id: 'folder-operations',
      title: 'Folder Actions',
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
        {
          id: 'open-folder',
          label: 'Open Folder',
          icon: <FolderOpen size={16} />,
          onClick: () => {
            // This would normally select the folder in the UI
            // For now, we'll just show a toast
            if (folder) {
              toast({
                title: "Folder opened",
                description: `Opened "${folder.name}" folder`,
              });
            }
          },
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
        title: 'Edit Options',
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
          {
            id: 'archive-folder',
            label: 'Archive Folder',
            icon: <FolderArchive size={16} />,
            onClick: () => {
              toast({
                title: "Folder archived",
                description: `"${folder.name}" has been archived.`,
              });
            },
            disabled: isDefaultFolder,
          },
          { id: 'edit-ops-divider', divider: true }
        ]
      });
    }
    
    // Clipboard operations
    sections.push({
      id: 'clipboard',
      title: 'Clipboard',
      items: [
        {
          id: 'copy-path',
          label: 'Copy Path',
          icon: <Files size={16} />,
          onClick: () => {
            if (folder) {
              navigator.clipboard.writeText(`/folders/${folder.id}`);
              toast({
                title: "Path copied",
                description: "Folder path has been copied to clipboard.",
              });
            }
          },
          disabled: !folder,
        },
        {
          id: 'copy-name',
          label: 'Copy Name',
          icon: <Copy size={16} />,
          onClick: () => {
            if (folder) {
              navigator.clipboard.writeText(folder.name);
              toast({
                title: "Name copied",
                description: "Folder name has been copied to clipboard.",
              });
            }
          },
          disabled: !folder,
        },
        {
          id: 'paste',
          label: 'Paste',
          icon: <ClipboardPaste size={16} />,
          onClick: () => {
            navigator.clipboard.readText().then(text => {
              toast({
                title: "Paste operation",
                description: "Paste functionality would be implemented here.",
              });
            });
          },
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
      variant="folder"
    />
  );
};