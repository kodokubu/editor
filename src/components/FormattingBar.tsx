import { Editor } from '@tiptap/react';
import React from 'react';
import {
    Bold, Code, Heading1, Heading2, List, ListOrdered, Quote
} from 'lucide-react';

interface FormattingBarProps {
    editor: Editor | null;
}

export const FormattingBar: React.FC<FormattingBarProps> = ({ editor }) => {
    if (!editor) {
        return null;
    }

    // Helper to check active state
    const isActive = (name: string, attributes?: any) => editor.isActive(name, attributes);

    return (
        <div className="formatting-bar">
            <div className="formatting-group">
                <button
                    className={`icon-btn ${isActive('bold') ? 'active' : ''}`}
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    title="Bold (Cmd+B)"
                >
                    <Bold size={20} />
                </button>
                {/* Removed Italic and Strikethrough as requested */}
                <button
                    className={`icon-btn ${isActive('code') ? 'active' : ''}`}
                    onClick={() => editor.chain().focus().toggleCode().run()}
                    title="Inline Code"
                >
                    <Code size={20} />
                </button>

                <div className="separator" style={{ height: '24px' }} />

                <button
                    className={`icon-btn ${isActive('heading', { level: 1 }) ? 'active' : ''}`}
                    onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                    title="Heading 1"
                >
                    <Heading1 size={20} />
                </button>
                <button
                    className={`icon-btn ${isActive('heading', { level: 2 }) ? 'active' : ''}`}
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    title="Heading 2"
                >
                    <Heading2 size={20} />
                </button>

                <div className="separator" style={{ height: '24px' }} />

                <button
                    className={`icon-btn ${isActive('bulletList') ? 'active' : ''}`}
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    title="Bullet List"
                >
                    <List size={20} />
                </button>
                <button
                    className={`icon-btn ${isActive('orderedList') ? 'active' : ''}`}
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    title="Ordered List"
                >
                    <ListOrdered size={20} />
                </button>
                <button
                    className={`icon-btn ${isActive('blockquote') ? 'active' : ''}`}
                    onClick={() => editor.chain().focus().toggleBlockquote().run()}
                    title="Blockquote"
                >
                    <Quote size={20} />
                </button>
            </div>
        </div>
    );
};
