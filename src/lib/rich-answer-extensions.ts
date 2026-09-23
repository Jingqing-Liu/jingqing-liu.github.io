import type { Extensions } from '@tiptap/core';
import { Fragment, Slice, type Node as ProseMirrorNode, type Schema } from '@tiptap/pm/model';
import StarterKit from '@tiptap/starter-kit';
import { TextStyle, Color, FontSize } from '@tiptap/extension-text-style';
import Highlight from '@tiptap/extension-highlight';
import Superscript from '@tiptap/extension-superscript';
import Subscript from '@tiptap/extension-subscript';
import TextAlign from '@tiptap/extension-text-align';
import { Table, TableKit } from '@tiptap/extension-table';
import { InlineMath, BlockMath } from '@tiptap/extension-mathematics';
import { RICH_TABLE_MAX_ROWS, safeRichLink, sanitizeRichDocument } from './rich-answer';

interface RichAnswerExtensionOptions {
  onInlineMathClick?: (node: ProseMirrorNode, pos: number) => void;
  onBlockMathClick?: (node: ProseMirrorNode, pos: number) => void;
}

// Formula creation goes through the validated panel. Automatic dollar-delimited
// input rules would bypass its length and syntax checks while someone is typing.
const ValidatedInlineMath = InlineMath.extend({ addInputRules: () => [] });
const ValidatedBlockMath = BlockMath.extend({ addInputRules: () => [] });
const BoundedTable = Table.extend({
  addKeyboardShortcuts() {
    return {
      ...this.parent?.(),
      Tab: () => {
        if (this.editor.commands.goToNextCell()) return true;
        const { $from } = this.editor.state.selection;
        for (let depth = $from.depth; depth > 0; depth--) {
          const node = $from.node(depth);
          if (node.type.name !== 'table') continue;
          // At the last supported row, Tab leaves the table instead of creating
          // content that could not survive a save-and-reload round trip.
          if (node.childCount >= RICH_TABLE_MAX_ROWS) return false;
          break;
        }
        if (!this.editor.can().addRowAfter()) return false;
        return this.editor.chain().addRowAfter().goToNextCell().run();
      },
    };
  },
});

/** One schema for editing, partner viewing, clipboard handling and round trips. */
export function createRichAnswerExtensions({ onInlineMathClick, onBlockMathClick }: RichAnswerExtensionOptions = {}): Extensions {
  const katexOptions = { throwOnError: false, trust: false, strict: 'error' as const, maxExpand: 1000, maxSize: 20 };
  return [
    StarterKit.configure({
      heading: { levels: [4, 5] },
      link: {
        // Read-only anchors retain native navigation; writing does not open tabs.
        openOnClick: false,
        autolink: true,
        defaultProtocol: 'https',
        isAllowedUri: href => !!safeRichLink(href),
        HTMLAttributes: { target: '_blank', rel: 'noopener noreferrer nofollow' },
      },
    }),
    TextStyle,
    Color,
    FontSize,
    Highlight.configure({ multicolor: true }),
    Superscript,
    Subscript,
    TextAlign.configure({ types: ['heading', 'paragraph'], alignments: ['left', 'center', 'right'] }),
    TableKit.configure({ table: false }),
    BoundedTable.configure({ resizable: false }),
    ValidatedInlineMath.configure({ onClick: onInlineMathClick, katexOptions: { ...katexOptions, displayMode: false } }),
    ValidatedBlockMath.configure({ onClick: onBlockMathClick, katexOptions: { ...katexOptions, displayMode: true } }),
  ];
}

/** Preserve clipboard paragraph boundaries after stripping unsupported content. */
export function sanitizeRichAnswerSlice(schema: Schema, slice: Slice): Slice {
  if (!slice.content.size) return Slice.empty;
  const clean = sanitizeRichDocument({ type: 'doc', content: slice.content.toJSON() });
  const content = Fragment.fromJSON(schema, clean.content);
  const widest = Slice.maxOpen(content);
  return new Slice(content, Math.min(slice.openStart, widest.openStart), Math.min(slice.openEnd, widest.openEnd));
}
