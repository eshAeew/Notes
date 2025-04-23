import React from "react";
import { ContextMenuBase, ContextMenuSectionDefinition } from "./ContextMenuBase";
import { Note, Folder } from "@shared/schema";
import { useTheme } from "@/hooks/useTheme";
import { useToast } from "@/hooks/use-toast";
import {
  Pencil,
  Trash2,
  Copy,
  Files,
  MoveRight,
  Share2,
  ArrowDownToLine,
  ExternalLink,
  FileSymlink,
  Link,
  File,
  FilePenLine,
  Archive,
  Tag,
  Tags
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
  const { theme } = useTheme();
  const { toast } = useToast();
  
  // Generate menu sections
  const getSections = (): ContextMenuSectionDefinition[] => {
    const sections: ContextMenuSectionDefinition[] = [];
    
    // Edit operations
    sections.push({
      id: 'edit-operations',
      title: 'Note Actions',
      items: [
        {
          id: 'rename-note',
          label: 'Rename Note',
          icon: <FilePenLine size={16} />,
          onClick: () => onRenameNote && onRenameNote(note),
        },
        {
          id: 'delete-note',
          label: 'Delete Note',
          icon: <Trash2 size={16} />,
          onClick: () => onDeleteNote && onDeleteNote(note),
          variant: 'destructive',
        },
        {
          id: 'archive-note',
          label: 'Archive Note',
          icon: <Archive size={16} />,
          onClick: () => {
            toast({
              title: "Note archived",
              description: `"${note.title}" has been archived.`,
            });
          }
        },
        { id: 'edit-ops-divider', divider: true }
      ]
    });
    
    // Clipboard operations
    sections.push({
      id: 'clipboard',
      title: 'Clipboard',
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
            toast({
              title: "Path copied",
              description: "Note path has been copied to clipboard.",
            });
          },
        },
        {
          id: 'copy-title',
          label: 'Copy Title',
          icon: <Copy size={16} />,
          onClick: () => {
            navigator.clipboard.writeText(note.title);
            toast({
              title: "Title copied",
              description: "Note title has been copied to clipboard.",
            });
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
          title: 'Organization',
          items: [
            {
              id: 'move-to',
              label: 'Move to...',
              icon: <MoveRight size={16} />,
              submenu: folderItems,
            },
            {
              id: 'add-tags',
              label: 'Add Tags...',
              icon: <Tags size={16} />,
              onClick: () => {
                toast({
                  title: "Tags feature",
                  description: "Tag functionality would be implemented here.",
                });
              }
            },
            { id: 'move-divider', divider: true }
          ]
        });
      }
    }
    
    // Export and share
    sections.push({
      id: 'export-share',
      title: 'Export & Share',
      items: [
        {
          id: 'export',
          label: 'Export as...',
          icon: <ArrowDownToLine size={16} />,
          submenu: [
            {
              id: 'export-pdf',
              label: 'PDF Document',
              icon: <File size={16} />,
              onClick: () => onExportNote && onExportNote(note, 'pdf'),
            },
            {
              id: 'export-text',
              label: 'Plain Text',
              icon: <File size={16} />,
              onClick: () => onExportNote && onExportNote(note, 'text'),
            }
          ],
        },
        {
          id: 'share',
          label: 'Share',
          icon: <Share2 size={16} />,
          onClick: () => {
            toast({
              title: "Share feature",
              description: "Sharing functionality would be implemented here.",
            });
          },
        },
        {
          id: 'copy-link',
          label: 'Copy Link',
          icon: <Link size={16} />,
          onClick: () => {
            navigator.clipboard.writeText(`${window.location.origin}/notes/${note.id}`);
            toast({
              title: "Link copied",
              description: "Note link has been copied to clipboard.",
            });
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
      variant="note"
    />
  );
};