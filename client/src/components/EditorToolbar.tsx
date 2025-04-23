import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Bold,
  Italic,
  Underline,
  Heading1,
  ListOrdered,
  List,
  Link,
  Table,
  Image,
  Share2,
} from "lucide-react";
import { useEditor } from "@/hooks/useEditor";
import { cn } from "@/lib/utils";

export default function EditorToolbar() {
  const { editor, isEditorActive } = useEditor();
  
  // Only enable toolbar buttons if editor is active and initialized
  const isActive = (type: string) => {
    if (!editor || !isEditorActive) return false;
    
    switch (type) {
      case 'bold':
        return editor.isActive('bold');
      case 'italic':
        return editor.isActive('italic');
      case 'underline':
        return editor.isActive('underline');
      case 'heading1':
        return editor.isActive('heading', { level: 1 });
      case 'bulletList':
        return editor.isActive('bulletList');
      case 'orderedList':
        return editor.isActive('orderedList');
      case 'link':
        return editor.isActive('link');
      default:
        return false;
    }
  };
  
  const executeCommand = (command: string) => {
    if (!editor || !isEditorActive) return;
    
    switch (command) {
      case 'bold':
        editor.chain().focus().toggleBold().run();
        break;
      case 'italic':
        editor.chain().focus().toggleItalic().run();
        break;
      case 'underline':
        editor.chain().focus().toggleUnderline().run();
        break;
      case 'heading1':
        editor.chain().focus().toggleHeading({ level: 1 }).run();
        break;
      case 'bulletList':
        editor.chain().focus().toggleBulletList().run();
        break;
      case 'orderedList':
        editor.chain().focus().toggleOrderedList().run();
        break;
      case 'link':
        const url = window.prompt('URL');
        if (url) {
          editor.chain().focus().setLink({ href: url }).run();
        }
        break;
      case 'table':
        editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
        break;
      case 'image':
        const imageUrl = window.prompt('Image URL');
        if (imageUrl) {
          editor.chain().focus().setImage({ src: imageUrl }).run();
        }
        break;
      default:
        break;
    }
  };
  
  const handleFormatChange = (value: string) => {
    if (!editor || !isEditorActive) return;
    
    switch (value) {
      case 'paragraph':
        editor.chain().focus().setParagraph().run();
        break;
      case 'heading1':
        editor.chain().focus().setHeading({ level: 1 }).run();
        break;
      case 'heading2':
        editor.chain().focus().setHeading({ level: 2 }).run();
        break;
      case 'heading3':
        editor.chain().focus().setHeading({ level: 3 }).run();
        break;
      case 'codeBlock':
        editor.chain().focus().setCodeBlock().run();
        break;
      case 'blockquote':
        editor.chain().focus().setBlockquote().run();
        break;
      default:
        break;
    }
  };
  
  return (
    <div className="flex items-center justify-between px-2 py-1 border-t border-border overflow-x-auto">
      <div className="flex items-center space-x-1">
        <Button
          variant="ghost"
          size="icon"
          className={cn("toolbar-btn", isActive('bold') && "is-active")}
          onClick={() => executeCommand('bold')}
          title="Bold (Ctrl+B)"
          disabled={!isEditorActive}
        >
          <Bold size={16} />
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          className={cn("toolbar-btn", isActive('italic') && "is-active")}
          onClick={() => executeCommand('italic')}
          title="Italic (Ctrl+I)"
          disabled={!isEditorActive}
        >
          <Italic size={16} />
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          className={cn("toolbar-btn", isActive('underline') && "is-active")}
          onClick={() => executeCommand('underline')}
          title="Underline (Ctrl+U)"
          disabled={!isEditorActive}
        >
          <Underline size={16} />
        </Button>
        
        <Separator orientation="vertical" className="h-5 mx-1" />
        
        <Button
          variant="ghost"
          size="icon"
          className={cn("toolbar-btn", isActive('heading1') && "is-active")}
          onClick={() => executeCommand('heading1')}
          title="Heading 1"
          disabled={!isEditorActive}
        >
          <Heading1 size={16} />
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          className={cn("toolbar-btn", isActive('bulletList') && "is-active")}
          onClick={() => executeCommand('bulletList')}
          title="Bullet List"
          disabled={!isEditorActive}
        >
          <List size={16} />
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          className={cn("toolbar-btn", isActive('orderedList') && "is-active")}
          onClick={() => executeCommand('orderedList')}
          title="Numbered List"
          disabled={!isEditorActive}
        >
          <ListOrdered size={16} />
        </Button>
        
        <Separator orientation="vertical" className="h-5 mx-1" />
        
        <Button
          variant="ghost"
          size="icon"
          className={cn("toolbar-btn", isActive('link') && "is-active")}
          onClick={() => executeCommand('link')}
          title="Insert Link"
          disabled={!isEditorActive}
        >
          <Link size={16} />
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          className="toolbar-btn"
          onClick={() => executeCommand('table')}
          title="Insert Table"
          disabled={!isEditorActive}
        >
          <Table size={16} />
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          className="toolbar-btn"
          onClick={() => executeCommand('image')}
          title="Insert Image"
          disabled={!isEditorActive}
        >
          <Image size={16} />
        </Button>
      </div>
      
      <div className="flex items-center">
        <Select
          onValueChange={handleFormatChange}
          disabled={!isEditorActive}
        >
          <SelectTrigger className="h-8 w-[130px] text-xs mr-2">
            <SelectValue placeholder="Paragraph" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="paragraph">Paragraph</SelectItem>
            <SelectItem value="heading1">Heading 1</SelectItem>
            <SelectItem value="heading2">Heading 2</SelectItem>
            <SelectItem value="heading3">Heading 3</SelectItem>
            <SelectItem value="codeBlock">Code Block</SelectItem>
            <SelectItem value="blockquote">Quote</SelectItem>
          </SelectContent>
        </Select>
        
        <Button
          size="sm"
          className="text-xs bg-primary text-primary-foreground hover:bg-primary/90"
          disabled={!isEditorActive}
        >
          <Share2 size={14} className="mr-1" />
          Share
        </Button>
      </div>
    </div>
  );
}
