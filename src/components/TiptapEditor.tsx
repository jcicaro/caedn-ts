// src/components/TiptapEditor.tsx
import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

interface TiptapEditorProps {
  initialContent?: string;
  onContentChange?: (html: string) => void;
}

const TiptapEditor: React.FC<TiptapEditorProps> = ({ initialContent = '<p>Hello World!</p>', onContentChange }) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      // You can add more extensions here as needed, e.g.,
      // import Link from '@tiptap/extension-link';
      // Link.configure({ openOnClick: true }),
    ],
    content: initialContent,
    onUpdate: ({ editor }) => {
      // Called whenever the editor content changes
      if (onContentChange) {
        onContentChange(editor.getHTML());
      }
    },
    editorProps: {
      attributes: {
        class: 'prose focus:outline-none max-w-none border rounded p-4', // Basic styling for visibility
      },
    },
  });

  return (
    <div>
      <EditorContent editor={editor} />
      {/* You can add a toolbar here using the editor instance */}
      {/* For example, a simple button for bold: */}
      {editor && (
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`mr-2 p-1 border rounded ${editor.isActive('bold') ? 'bg-blue-200' : ''}`}
        >
          Bold
        </button>
      )}
    </div>
  );
};

export default TiptapEditor;