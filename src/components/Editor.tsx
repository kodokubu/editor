import React, { forwardRef } from 'react';

interface EditorProps {
    value: string;
    onChange: (value: string) => void;
    onScroll?: (e: React.UIEvent<HTMLTextAreaElement>) => void;
}

export const Editor = forwardRef<HTMLTextAreaElement, EditorProps>(({ value, onChange, onScroll }, ref) => {
    return (
        <div className="editor-pane">
            <div className="section-label">Markdown</div>
            <textarea
                ref={ref}
                className="editor-input"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onScroll={onScroll}
                placeholder="Type your markdown here..."
                spellCheck={false}
            />
        </div>
    );
});

Editor.displayName = 'Editor';
