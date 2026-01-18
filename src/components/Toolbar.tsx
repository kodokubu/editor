import { Editor } from '@tiptap/react';
import React from 'react';
import {
  Moon, Sun, Download, Upload, FileText,
  Bold, Italic, Strikethrough, Code, Heading1, Heading2, List, ListOrdered, Quote
} from 'lucide-react';

interface ToolbarProps {
  editor: Editor | null;
  isDarkMode: boolean;
  toggleTheme: () => void;
  onImport: (content: string) => void;
  onExport: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  editor,
  isDarkMode,
  toggleTheme,
  onImport,
  onExport
}) => {

  if (!editor) {
    return null;
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        onImport(content);
      };
      reader.readAsText(file);
    }
    event.target.value = '';
  };

  const triggerFileInput = () => {
    document.getElementById('file-upload')?.click();
  };

  // Helper to check active state
  const isActive = (name: string, attributes?: any) => editor.isActive(name, attributes);

  return (
    <div className="toolbar">
      <div className="toolbar-title">
        <FileText size={20} className="text-accent" style={{ color: 'var(--accent-color)' }} />
        <span>MD Editor</span>
      </div>

      {/* Formatting Tools */}
      <div className="toolbar-group">
        <button
          className={`icon-btn ${isActive('bold') ? 'active' : ''}`}
          onClick={() => editor.chain().focus().toggleBold().run()}
          title="Bold (Cmd+B)"
        >
          <Bold size={16} />
        </button>
        <button
          className={`icon-btn ${isActive('italic') ? 'active' : ''}`}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          title="Italic (Cmd+I)"
        >
          <Italic size={16} />
        </button>
        <button
          className={`icon-btn ${isActive('strike') ? 'active' : ''}`}
          onClick={() => editor.chain().focus().toggleStrike().run()}
          title="Strikethrough"
        >
          <Strikethrough size={16} />
        </button>
        <button
          className={`icon-btn ${isActive('code') ? 'active' : ''}`}
          onClick={() => editor.chain().focus().toggleCode().run()}
          title="Inline Code"
        >
          <Code size={16} />
        </button>

        <div className="separator" />

        <button
          className={`icon-btn ${isActive('heading', { level: 1 }) ? 'active' : ''}`}
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          title="Heading 1"
        >
          <Heading1 size={16} />
        </button>
        <button
          className={`icon-btn ${isActive('heading', { level: 2 }) ? 'active' : ''}`}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          title="Heading 2"
        >
          <Heading2 size={16} />
        </button>

        <div className="separator" />

        <button
          className={`icon-btn ${isActive('bulletList') ? 'active' : ''}`}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          title="Bullet List"
        >
          <List size={16} />
        </button>
        <button
          className={`icon-btn ${isActive('orderedList') ? 'active' : ''}`}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          title="Ordered List"
        >
          <ListOrdered size={16} />
        </button>
        <button
          className={`icon-btn ${isActive('blockquote') ? 'active' : ''}`}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          title="Blockquote"
        >
          <Quote size={16} />
        </button>
      </div>

      <div className="toolbar-actions">
        <input
          type="file"
          id="file-upload"
          accept=".md,.txt"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
        <button className="icon-btn" onClick={triggerFileInput} title="Import Markdown">
          <Upload size={18} />
        </button>
        <button className="icon-btn" onClick={onExport} title="Export Markdown">
          <Download size={18} />
        </button>
        <div className="separator" />
        <button className="icon-btn" onClick={toggleTheme} title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}>
          {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
    </div>
  );
};
