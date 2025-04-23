import React from "react";
import { ContextMenuBase, ContextMenuSectionDefinition } from "./ContextMenuBase";
import { Note, Folder } from "@shared/schema";
import {
  Pencil,
  Trash2,
  Copy,
  Files,
  MoveRight,
  Share2,
  ArrowDownToLine,
  ExternalLink,
  FileSymlink
} from "lucide-react";

interface NoteContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  note: Note;
  folders?: Folder[];
  onRenameNote?: (note: Note) => void;
  onDeleteNote?: (note: Note) => void;
  onMoveNote?: (note: Note, folderId: number) => void;
  onDuplicateNote?: (note: Note) => void;
  onExportNote?: (note: Note, format: 'pdf' | 'text') => void;
}

export const NoteContextMenu: React.FC<NoteContextMenuProps> = ({
  x,
  y,
  onClose,
  note,
  folders = [],
  onRenameNote,
  onDeleteNote,
  onMoveNote,
  onDuplicateNote,
  onExportNote
}) => {
  // Generate menu sections
  const getSections = (): ContextMenuSectionDefinition[] => {
    const sections: ContextMenuSectionDefinition[] = [];
    
    // Edit operations
    sections.push({
      id: 'edit-operations',
      items: [
        {
          id: 'rename-note',
          label: 'Rename Note',
          icon: <Pencil size={16} />,
          onClick: () => onRenameNote && onRenameNote(note),
        },
        {
          id: 'delete-note',
          label: 'Delete Note',
          icon: <Trash2 size={16} />,
          onClick: () => onDeleteNote && onDeleteNote(note),
          variant: 'destructive',
        },
        { id: 'edit-ops-divider', divider: true }
      ]
    });
    
    // Clipboard operations
    sections.push({
      id: 'clipboard',
      items: [
        {
          id: 'duplicate',
          label: 'Duplicate Note',
          icon: <Copy size={16} />,
          onClick: () => onDuplicateNote && onDuplicateNote(note),
        },
        {
          id: 'copy-path',
          label: 'Copy Path',
          icon: <Files size={16} />,
          onClick: () => {
            // Copy a virtual path for the note
            navigator.clipboard.writeText(`/notes/${note.id}`);
          },
        },
        { id: 'clipboard-divider', divider: true }
      ]
    });
    
    // Move to folder (only if we have folders)
    if (folders.length > 0) {
      // Create submenu items for each folder (except the current folder)
      const folderItems = folders
        .filter(folder => folder.id !== note.folderId)
        .map(folder => ({
          id: `folder-${folder.id}`,
          label: folder.name,
          icon: <FileSymlink size={16} />,
          onClick: () => onMoveNote && onMoveNote(note, folder.id),
        }));
      
      // Add the move operation only if we have any target folders
      if (folderItems.length > 0) {
        sections.push({
          id: 'move-operations',
          items: [
            {
              id: 'move-to',
              label: 'Move to...',
              icon: <MoveRight size={16} />,
              submenu: folderItems,
            },
            { id: 'move-divider', divider: true }
          ]
        });
      }
    }
    
    // Export and share
    sections.push({
      id: 'export-share',
      items: [
        {
          id: 'export',
          label: 'Export as...',
          icon: <ArrowDownToLine size={16} />,
          submenu: [
            {
              id: 'export-pdf',
              label: 'PDF Document',
              icon: <ArrowDownToLine size={16} />,
              onClick: () => onExportNote && onExportNote(note, 'pdf'),
            },
            {
              id: 'export-text',
              label: 'Plain Text',
              icon: <ArrowDownToLine size={16} />,
              onClick: () => onExportNote && onExportNote(note, 'text'),
            }
          ],
        },
        {
          id: 'share',
          label: 'Share',
          icon: <Share2 size={16} />,
          onClick: () => {
            // Sharing functionality would be implemented here
          },
        },
        {
          id: 'open-in-new',
          label: 'Open in New Tab',
          icon: <ExternalLink size={16} />,
          onClick: () => {
            // Open in new tab functionality
            window.open(`/notes/${note.id}`, '_blank');
          },
        }
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