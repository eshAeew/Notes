import { useRef, useState, useEffect } from "react";
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
} from "lucide-react";
import { LinkDialog } from "@/components/dialogs/LinkDialog";
import { ImageUploadDialog } from "@/components/dialogs/ImageUploadDialog";

interface ContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
}

interface ContextMenuItem {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  divider?: boolean;
  submenu?: ContextMenuItem[];
}

export const EditorContextMenu = ({ x, y, onClose }: ContextMenuProps) => {
  const { editor } = useEditor();
  const menuRef = useRef<HTMLDivElement>(null);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [selectedText, setSelectedText] = useState("");
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("contextmenu", handleClickOutside);
    
    // Capture current selection
    if (editor) {
      const selection = editor.view.state.selection;
      const text = editor.view.state.doc.textBetween(
        selection.from, 
        selection.to,
        ' '
      );
      setSelectedText(text);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("contextmenu", handleClickOutside);
    };
  }, [onClose, editor]);

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
    onClose();
  };

  // Handle insert image
  const handleInsertImage = (url: string, alt?: string) => {
    if (!editor) return;
    
    editor.chain().focus().setImage({ 
      src: url,
      alt: alt || 'image'
    }).run();
    onClose();
  };

  // Context menu items
  const menuItems: ContextMenuItem[] = [
    {
      icon: <Bold size={16} />,
      label: "Bold",
      onClick: () => {
        editor?.chain().focus().toggleBold().run();
        onClose();
      },
    },
    {
      icon: <Italic size={16} />,
      label: "Italic",
      onClick: () => {
        editor?.chain().focus().toggleItalic().run();
        onClose();
      },
    },
    {
      icon: <Underline size={16} />,
      label: "Underline",
      onClick: () => {
        editor?.chain().focus().toggleUnderline().run();
        onClose();
      },
    },
    {
      icon: <div />,
      label: "",
      onClick: () => {},
      divider: true,
    },
    {
      icon: <Scissors size={16} />,
      label: "Cut",
      onClick: () => {
        document.execCommand('cut');
        onClose();
      },
    },
    {
      icon: <Copy size={16} />,
      label: "Copy",
      onClick: () => {
        document.execCommand('copy');
        onClose();
      },
    },
    {
      icon: <ClipboardPaste size={16} />,
      label: "Paste",
      onClick: () => {
        navigator.clipboard.readText().then(text => {
          editor?.chain().focus().insertContent(text).run();
        });
        onClose();
      },
    },
    {
      icon: <div />,
      label: "",
      onClick: () => {},
      divider: true,
    },
    {
      icon: <LinkIcon size={16} />,
      label: "Insert Link",
      onClick: () => {
        setShowLinkDialog(true);
      },
    },
    {
      icon: <Image size={16} />,
      label: "Insert Image",
      onClick: () => {
        setShowImageDialog(true);
      },
    },
    {
      icon: <Table size={16} />,
      label: "Insert Table",
      onClick: () => {
        editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
        onClose();
      },
    },
    {
      icon: <div />,
      label: "",
      onClick: () => {},
      divider: true,
    },
    {
      icon: <Type size={16} />,
      label: "Paragraph Format",
      onClick: () => {},
      submenu: [
        {
          icon: <Type size={16} />,
          label: "Paragraph",
          onClick: () => {
            editor?.chain().focus().setParagraph().run();
            onClose();
          },
        },
        {
          icon: <Type size={16} />,
          label: "Heading 1",
          onClick: () => {
            editor?.chain().focus().setHeading({ level: 1 }).run();
            onClose();
          },
        },
        {
          icon: <Type size={16} />,
          label: "Heading 2",
          onClick: () => {
            editor?.chain().focus().setHeading({ level: 2 }).run();
            onClose();
          },
        },
        {
          icon: <Type size={16} />,
          label: "Heading 3",
          onClick: () => {
            editor?.chain().focus().setHeading({ level: 3 }).run();
            onClose();
          },
        },
        {
          icon: <Type size={16} />,
          label: "Code Block",
          onClick: () => {
            editor?.chain().focus().setCodeBlock().run();
            onClose();
          },
        },
        {
          icon: <Type size={16} />,
          label: "Quote",
          onClick: () => {
            editor?.chain().focus().setBlockquote().run();
            onClose();
          },
        },
      ],
    },
    {
      icon: <List size={16} />,
      label: "Bullet List",
      onClick: () => {
        editor?.chain().focus().toggleBulletList().run();
        onClose();
      },
    },
    {
      icon: <ListOrdered size={16} />,
      label: "Numbered List",
      onClick: () => {
        editor?.chain().focus().toggleOrderedList().run();
        onClose();
      },
    },
    {
      icon: <div />,
      label: "",
      onClick: () => {},
      divider: true,
    },
    {
      icon: <AlignLeft size={16} />,
      label: "Align Left",
      onClick: () => {
        // Add alignment when supported
        onClose();
      },
    },
    {
      icon: <AlignCenter size={16} />,
      label: "Align Center",
      onClick: () => {
        // Add alignment when supported
        onClose();
      },
    },
    {
      icon: <AlignRight size={16} />,
      label: "Align Right",
      onClick: () => {
        // Add alignment when supported
        onClose();
      },
    },
    {
      icon: <AlignJustify size={16} />,
      label: "Justify",
      onClick: () => {
        // Add alignment when supported
        onClose();
      },
    },
  ];

  // Helper to handle submenu hover
  const handleSubmenuHover = (label: string) => {
    setActiveSubmenu(label);
  };

  // Adjust position to keep menu in viewport
  const adjustedPosition = () => {
    if (!menuRef.current) return { x, y };
    
    const menuWidth = menuRef.current.offsetWidth;
    const menuHeight = menuRef.current.offsetHeight;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    let adjustedX = x;
    let adjustedY = y;
    
    if (x + menuWidth > viewportWidth) {
      adjustedX = viewportWidth - menuWidth - 10;
    }
    
    if (y + menuHeight > viewportHeight) {
      adjustedY = viewportHeight - menuHeight - 10;
    }
    
    return { x: adjustedX, y: adjustedY };
  };

  const { x: adjustedX, y: adjustedY } = adjustedPosition();

  return (
    <>
      <div
        ref={menuRef}
        className="absolute context-menu"
        style={{
          left: `${adjustedX}px`,
          top: `${adjustedY}px`,
        }}
      >
        <div className="py-1 min-w-52">
          {menuItems.map((item, index) => (
            <div key={index}>
              {item.divider ? (
                <div className="context-menu-divider" />
              ) : (
                <div
                  className="relative"
                  onMouseEnter={() => item.submenu && handleSubmenuHover(item.label)}
                  onMouseLeave={() => setActiveSubmenu(null)}
                >
                  <button
                    className="context-menu-item"
                    onClick={item.submenu ? undefined : item.onClick}
                  >
                    <span className="context-menu-item-icon">
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                    {item.submenu && (
                      <span className="ml-auto">▶</span>
                    )}
                  </button>

                  {/* Submenu */}
                  {item.submenu && activeSubmenu === item.label && (
                    <div
                      className="context-submenu min-w-48"
                      style={{ marginLeft: '2px' }}
                    >
                      <div className="py-1">
                        {item.submenu.map((subItem, subIndex) => (
                          <button
                            key={subIndex}
                            className="context-menu-item"
                            onClick={subItem.onClick}
                          >
                            <span className="context-menu-item-icon">
                              {subItem.icon}
                            </span>
                            <span>{subItem.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

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