import React from "react";
import { ContextMenuBase, ContextMenuSectionDefinition } from "./ContextMenuBase";
import { useEditor } from "@/hooks/useEditor";
import {
  Bold,
  Italic,
  Underline,
  Scissors,
  Copy,
  ClipboardPaste,
  Link as LinkIcon,
  Image,
  Table,
  ListOrdered,
  List,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Type,
  Check,
  Plus,
  FileText,
  Search,
  Laptop,
  RefreshCcw,
  BookOpen,
  SendToBack,
  ArrowLeft,
  ArrowRight,
  FileSymlink,
  PanelLeft,
  Download,
} from "lucide-react";
import { LinkDialog } from "@/components/dialogs/LinkDialog";
import { ImageUploadDialog } from "@/components/dialogs/ImageUploadDialog";

interface EditorContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  targetText?: string;
  isSpellingError?: boolean;
  spellingSuggestions?: string[];
  contextType?: 'text' | 'header' | 'noteBody' | 'image' | 'link';
}

export const EditorContextMenu: React.FC<EditorContextMenuProps> = ({
  x,
  y,
  onClose,
  targetText = "",
  isSpellingError = false,
  spellingSuggestions = [],
  contextType = 'text'
}) => {
  const { editor } = useEditor();
  const [showLinkDialog, setShowLinkDialog] = React.useState(false);
  const [showImageDialog, setShowImageDialog] = React.useState(false);
  const [selectedText, setSelectedText] = React.useState("");
  
  // Get selected text from the editor on mount
  React.useEffect(() => {
    if (editor) {
      const selection = editor.view.state.selection;
      const text = editor.view.state.doc.textBetween(
        selection.from, 
        selection.to,
        ' '
      );
      setSelectedText(text || targetText);
    } else {
      setSelectedText(targetText);
    }
  }, [editor, targetText]);

  // Handle insert link
  const handleInsertLink = (url: string, text?: string) => {
    if (!editor) return;
    
    if (text && selectedText === '') {
      // Insert new text with the link
      editor.chain().focus().insertContent({
        type: 'text',
        marks: [{ type: 'link', attrs: { href: url } }],
        text: text
      }).run();
    } else {
      // Apply link to selected text
      editor.chain().focus().setLink({ href: url }).run();
    }
  };
  
  // Handle insert image
  const handleInsertImage = (url: string, alt?: string) => {
    if (!editor) return;
    
    editor.chain().focus().setImage({ 
      src: url,
      alt: alt || 'image'
    }).run();
  };

  // Handle replacing text for spelling corrections
  const handleReplaceText = (suggestion: string) => {
    if (!editor) return;
    
    const { from, to } = editor.view.state.selection;
    editor.chain().focus().deleteRange({ from, to }).run();
    editor.chain().focus().insertContent(suggestion).run();
  };

  // Sections vary based on the context
  const getSections = (): ContextMenuSectionDefinition[] => {
    let sections: ContextMenuSectionDefinition[] = [];
    
    // Spelling suggestions section (if spelling error)
    if (isSpellingError && spellingSuggestions.length > 0) {
      sections.push({
        id: 'spelling',
        items: [
          ...spellingSuggestions.slice(0, 4).map((suggestion, index) => ({
            id: `spelling-${index}`,
            label: suggestion,
            onClick: () => handleReplaceText(suggestion),
            className: 'context-menu-spell-suggestion'
          })),
          {
            id: 'add-to-dictionary',
            label: 'Add to dictionary',
            icon: <Plus size={16} />,
            onClick: () => {}, // This would be implemented with a spell checker
            showInContexts: ['text']
          },
          { id: 'spelling-divider', divider: true }
        ]
      });
    }
    
    // Selection operations section (cut, copy, paste)
    sections.push({
      id: 'selection',
      items: [
        {
          id: 'cut',
          label: 'Cut',
          icon: <Scissors size={16} />,
          shortcut: 'Ctrl+X',
          onClick: () => document.execCommand('cut'),
          disabled: !selectedText && contextType !== 'image',
          showInContexts: ['text', 'noteBody', 'header', 'image']
        },
        {
          id: 'copy',
          label: 'Copy',
          icon: <Copy size={16} />,
          shortcut: 'Ctrl+C',
          onClick: () => document.execCommand('copy'),
          disabled: !selectedText && contextType !== 'image' && contextType !== 'link',
          showInContexts: ['text', 'noteBody', 'header', 'image', 'link']
        },
        {
          id: 'paste',
          label: 'Paste',
          icon: <ClipboardPaste size={16} />,
          shortcut: 'Ctrl+V',
          onClick: () => {
            navigator.clipboard.readText().then(text => {
              editor?.chain().focus().insertContent(text).run();
            });
          },
          showInContexts: ['text', 'noteBody', 'header']
        },
        { id: 'selection-divider', divider: true }
      ]
    });

    // Formatting section
    sections.push({
      id: 'formatting',
      items: [
        {
          id: 'bold',
          label: 'Bold',
          icon: <Bold size={16} />,
          shortcut: 'Ctrl+B',
          onClick: () => editor?.chain().focus().toggleBold().run(),
          disabled: !editor?.can().toggleBold(),
          showInContexts: ['text', 'noteBody']
        },
        {
          id: 'italic',
          label: 'Italic',
          icon: <Italic size={16} />,
          shortcut: 'Ctrl+I',
          onClick: () => editor?.chain().focus().toggleItalic().run(),
          disabled: !editor?.can().toggleItalic(),
          showInContexts: ['text', 'noteBody']
        },
        {
          id: 'underline',
          label: 'Underline',
          icon: <Underline size={16} />,
          shortcut: 'Ctrl+U',
          onClick: () => editor?.chain().focus().toggleUnderline().run(),
          disabled: !editor?.can().toggleUnderline(),
          showInContexts: ['text', 'noteBody']
        },
        {
          id: 'formatting-divider',
          divider: true,
          showInContexts: ['text', 'noteBody']
        }
      ]
    });
    
    // Paragraph and list section
    sections.push({
      id: 'paragraph',
      items: [
        {
          id: 'paragraph-format',
          label: 'Format',
          icon: <Type size={16} />,
          submenu: [
            {
              id: 'paragraph',
              label: 'Paragraph',
              icon: <Type size={16} />,
              onClick: () => editor?.chain().focus().setParagraph().run()
            },
            {
              id: 'heading1',
              label: 'Heading 1',
              icon: <Type size={16} />,
              onClick: () => editor?.chain().focus().setHeading({ level: 1 }).run()
            },
            {
              id: 'heading2',
              label: 'Heading 2',
              icon: <Type size={16} />,
              onClick: () => editor?.chain().focus().setHeading({ level: 2 }).run()
            },
            {
              id: 'heading3',
              label: 'Heading 3',
              icon: <Type size={16} />,
              onClick: () => editor?.chain().focus().setHeading({ level: 3 }).run()
            },
            {
              id: 'code-block',
              label: 'Code Block',
              icon: <Type size={16} />,
              onClick: () => editor?.chain().focus().setCodeBlock().run()
            },
            {
              id: 'blockquote',
              label: 'Quote',
              icon: <Type size={16} />,
              onClick: () => editor?.chain().focus().setBlockquote().run()
            }
          ],
          showInContexts: ['text', 'noteBody']
        },
        {
          id: 'bullet-list',
          label: 'Bullet List',
          icon: <List size={16} />,
          onClick: () => editor?.chain().focus().toggleBulletList().run(),
          showInContexts: ['text', 'noteBody']
        },
        {
          id: 'numbered-list',
          label: 'Numbered List',
          icon: <ListOrdered size={16} />,
          onClick: () => editor?.chain().focus().toggleOrderedList().run(),
          showInContexts: ['text', 'noteBody']
        },
        {
          id: 'paragraph-divider',
          divider: true,
          showInContexts: ['text', 'noteBody']
        }
      ]
    });
    
    // Alignment section
    sections.push({
      id: 'alignment',
      items: [
        {
          id: 'align-left',
          label: 'Align Left',
          icon: <AlignLeft size={16} />,
          onClick: () => {},
          showInContexts: ['text', 'noteBody', 'image']
        },
        {
          id: 'align-center',
          label: 'Align Center',
          icon: <AlignCenter size={16} />,
          onClick: () => {},
          showInContexts: ['text', 'noteBody', 'image']
        },
        {
          id: 'align-right',
          label: 'Align Right',
          icon: <AlignRight size={16} />,
          onClick: () => {},
          showInContexts: ['text', 'noteBody', 'image']
        },
        {
          id: 'align-justify',
          label: 'Justify',
          icon: <AlignJustify size={16} />,
          onClick: () => {},
          showInContexts: ['text', 'noteBody']
        },
        {
          id: 'alignment-divider',
          divider: true,
          showInContexts: ['text', 'noteBody', 'image']
        }
      ]
    });
    
    // Insert section
    sections.push({
      id: 'insert',
      items: [
        {
          id: 'insert-link',
          label: 'Insert Link',
          icon: <LinkIcon size={16} />,
          onClick: () => setShowLinkDialog(true),
          showInContexts: ['text', 'noteBody']
        },
        {
          id: 'insert-image',
          label: 'Insert Image',
          icon: <Image size={16} />,
          onClick: () => setShowImageDialog(true),
          showInContexts: ['text', 'noteBody']
        },
        {
          id: 'insert-table',
          label: 'Insert Table',
          icon: <Table size={16} />,
          onClick: () => editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(),
          showInContexts: ['text', 'noteBody']
        },
        {
          id: 'insert-divider',
          divider: true,
          showInContexts: ['text', 'noteBody']
        }
      ]
    });

    // Search and development
    sections.push({
      id: 'search',
      items: [
        {
          id: 'search',
          label: 'Search',
          icon: <Search size={16} />,
          onClick: () => {},
          showInContexts: ['text', 'noteBody', 'header']
        },
        {
          id: 'search-with',
          label: 'Search with...',
          icon: <Search size={16} />,
          submenu: [
            {
              id: 'search-google',
              label: 'Google',
              onClick: () => {
                const searchTerm = selectedText || targetText;
                if (searchTerm) {
                  window.open(`https://www.google.com/search?q=${encodeURIComponent(searchTerm)}`, '_blank');
                }
              }
            },
            {
              id: 'search-bing',
              label: 'Bing',
              onClick: () => {
                const searchTerm = selectedText || targetText;
                if (searchTerm) {
                  window.open(`https://www.bing.com/search?q=${encodeURIComponent(searchTerm)}`, '_blank');
                }
              }
            }
          ],
          showInContexts: ['text', 'noteBody', 'header']
        },
        {
          id: 'inspect-element',
          label: 'Inspect element',
          icon: <Laptop size={16} />,
          shortcut: 'Ctrl+Shift+C',
          onClick: () => {},
          showInContexts: ['text', 'noteBody', 'header', 'image', 'link']
        }
      ]
    });

    // Image specific options
    if (contextType === 'image') {
      sections.push({
        id: 'image-options',
        items: [
          {
            id: 'edit-image',
            label: 'Edit Image',
            icon: <Image size={16} />,
            onClick: () => {},
          },
          {
            id: 'replace-image',
            label: 'Replace Image',
            icon: <RefreshCcw size={16} />,
            onClick: () => setShowImageDialog(true),
          },
          {
            id: 'save-image',
            label: 'Save Image As...',
            icon: <Download size={16} />,
            onClick: () => {},
          },
          {
            id: 'image-divider',
            divider: true,
          }
        ]
      });
    }

    // Link specific options
    if (contextType === 'link') {
      sections.push({
        id: 'link-options',
        items: [
          {
            id: 'open-link',
            label: 'Open Link',
            icon: <FileSymlink size={16} />,
            onClick: () => {},
          },
          {
            id: 'edit-link',
            label: 'Edit Link',
            icon: <LinkIcon size={16} />,
            onClick: () => setShowLinkDialog(true),
          },
          {
            id: 'copy-link',
            label: 'Copy Link Address',
            icon: <Copy size={16} />,
            onClick: () => {},
          },
          {
            id: 'link-divider',
            divider: true,
          }
        ]
      });
    }

    return sections;
  };

  return (
    <>
      <ContextMenuBase
        x={x}
        y={y}
        onClose={onClose}
        sections={getSections()}
        activeContext={contextType}
      />
      
      {/* Dialogs */}
      <LinkDialog 
        isOpen={showLinkDialog}
        onClose={() => setShowLinkDialog(false)}
        onConfirm={handleInsertLink}
        initialText={selectedText}
      />
      
      <ImageUploadDialog
        isOpen={showImageDialog}
        onClose={() => setShowImageDialog(false)}
        onConfirm={handleInsertImage}
      />
    </>
  );
};