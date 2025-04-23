import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import Placeholder from '@tiptap/extension-placeholder';
import { SpellChecker } from './spellchecker-extension';

export function getTipTapExtensions() {
  return [
    StarterKit.configure({
      heading: {
        levels: [1, 2, 3],
      },
      bulletList: {
        keepMarks: true,
        keepAttributes: true,
      },
      orderedList: {
        keepMarks: true,
        keepAttributes: true,
      },
      code: {
        HTMLAttributes: {
          class: 'bg-muted px-1.5 py-0.5 rounded text-sm font-mono',
        },
      },
      codeBlock: {
        HTMLAttributes: {
          class: 'bg-muted p-4 rounded-md font-mono text-sm',
        },
      },
      blockquote: {
        HTMLAttributes: {
          class: 'border-l-4 border-muted-foreground/30 pl-4 italic',
        },
      },
    }),
    Underline,
    Link.configure({
      openOnClick: true,
      HTMLAttributes: {
        class: 'text-primary underline cursor-pointer',
      },
    }),
    Image.configure({
      HTMLAttributes: {
        class: 'rounded-md max-w-full',
      },
    }),
    Table.configure({
      resizable: true,
      HTMLAttributes: {
        class: 'border-collapse w-full',
      },
    }),
    TableRow,
    TableCell.configure({
      HTMLAttributes: {
        class: 'border border-border p-2',
      },
    }),
    TableHeader.configure({
      HTMLAttributes: {
        class: 'border border-border p-2 font-bold bg-muted',
      },
    }),
    Placeholder.configure({
      placeholder: 'Start writing...',
      emptyEditorClass: 'before:content-[attr(data-placeholder)] before:text-muted-foreground before:float-left before:pointer-events-none',
    }),
    // Add our custom spell checker extension
    SpellChecker,
  ];
}
