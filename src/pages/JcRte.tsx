// src/App.tsx
import React, { useState } from 'react';
import TiptapEditor from '../components/TiptapEditor'; // Adjust path if needed

function JcRte() {
  const [editorContent, setEditorContent] = useState('<p>Start typing here...</p>');

  const handleContentChange = (html: string) => {
    setEditorContent(html);
    console.log('Editor content:', html); // Log content for demonstration
  };

  return (
    <div className="App p-8">
      <h1 className="text-2xl font-bold mb-4">My Tiptap Rich Text Editor</h1>
      <TiptapEditor initialContent={editorContent} onContentChange={handleContentChange} />
      <div className="mt-8">
        <h2 className="text-xl font-semibold">Current Editor HTML Output:</h2>
        <pre className="bg-gray-100 p-4 rounded-md overflow-auto">{editorContent}</pre>
      </div>
    </div>
  );
}

export default JcRte;