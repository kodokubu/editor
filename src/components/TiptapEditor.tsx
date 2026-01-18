import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Typography from '@tiptap/extension-typography';
import { Markdown } from 'tiptap-markdown';
import React, { useEffect } from 'react';

interface TiptapEditorProps {
    content: string;
    onUpdate: (editor: any) => void;
    setEditor: (editor: any) => void;
}

const TiptapEditor: React.FC<TiptapEditorProps> = ({ content, onUpdate, setEditor }) => {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Typography,
            Markdown.configure({
                html: true,                  // Allow HTML input/output
                tightLists: true,            // No <p> inside <li> in markdown output
                tightListClass: 'tight',     // Add class to tight lists
                bulletListMarker: '-',       // "-" for bullet lists
                linkify: false,              // Create links from "https://..." text
                breaks: true,                // New lines (\n) in markdown = <br>
                transformPastedText: true,   // Allow to paste markdown text into the editor
                transformCopiedText: true,   // Copied text is transformed to markdown
            }),
        ],
        content: content,
        onUpdate: ({ editor }) => {
            onUpdate(editor);
        },
        // Add classes for styling
        editorProps: {
            attributes: {
                class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none markdown-body editor-content',
            },
        },
    });

    // Pass editor instance back to parent when ready
    useEffect(() => {
        if (editor) {
            setEditor(editor);
        }
    }, [editor, setEditor]);

    // Handle external content updates (Import)
    useEffect(() => {
        const markdownStorage = (editor.storage as any).markdown;
        if (editor && markdownStorage && content !== markdownStorage.getMarkdown()) {
            // Only update if content is significantly different to avoid cursor jumps
            // But for "Import", we usually want to replace everything.
            // This simple check might be enough.
            // editor.commands.setContent(content); -> this would require converting MD to HTML first or using markdown extension command?
            // tiptap-markdown adds 'markdown' content support to setContent?
            // Actually, we usually pass content to useEditor, but for updates we use commands.
            // With tiptap-markdown, we should do:
            editor.commands.setContent(content);
        }
    }, [content, editor]);

    return (
        <div className="editor-container">
            <EditorContent editor={editor} />
        </div>
    );
};

export default TiptapEditor;
