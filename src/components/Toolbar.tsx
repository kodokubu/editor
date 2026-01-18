import { Editor } from '@tiptap/react';
import React from 'react';
import {
  Moon, Sun, Download, Upload, FileText
} from 'lucide-react';

interface ToolbarProps {
  editor: Editor | null;
  isDarkMode: boolean;
  toggleTheme: () => void;
  onImport: (content: string) => void;
  onExport: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  isDarkMode,
  toggleTheme,
  onImport,
  onExport
}) => {

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

  return (
    <div className="toolbar">
      {/* Empty div or Logo to keep layout balanced if needed, or just left aligned actions */}
      <div className="toolbar-title">
        {/* User asked to keep Import/Export/Theme only. Maybe logo is fine or remove it?
            User said: "上部はインポート・エクスポートとダークモード切り替えのみ" (Only Import/Export/Theme at top)
            So I will strictly follow that.
         */}
        <FileText size={20} className="text-accent" style={{ color: 'var(--accent-color)' }} />
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
          <Upload size={20} />
        </button>
        <button className="icon-btn" onClick={onExport} title="Export Markdown">
          <Download size={20} />
        </button>
        <div className="separator" />
        <button className="icon-btn" onClick={toggleTheme} title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}>
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>
    </div>
  );
};

