import { useState, useEffect } from 'react';
import { Toolbar } from './components/Toolbar';
import TiptapEditor from './components/TiptapEditor'; // Assuming we rename/create this

const DEFAULT_MARKDOWN = `# シンプルなMarkdownエディタへようこそ

これは **Obsidianライク** なライブプレビューエディタです。
入力したMarkdown記法がリアルタイムで反映されます。

## 基本的な使い方
- \`#\` で見出しを作成（H1〜H6）
- \`-\` または \`*\` でリスト作成
- \`**太字**\` や \`*斜体*\` も即座に反映
- \`>\` で引用

> "書くことに集中しよう、フォーマットではなく。"

ここに入力してみてください：
- リスト1
- リスト2
`;

function App() {
  const [markdown, setMarkdown] = useState<string>(DEFAULT_MARKDOWN);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [editor, setEditor] = useState<any>(null);

  useEffect(() => {
    document.body.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
    document.body.style.backgroundColor = isDarkMode ? '#09090b' : '#ffffff';
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const handleImport = (content: string) => {
    setMarkdown(content);
    // TiptapEditor useEffect will pick this up and setContent
  };

  const handleExport = () => {
    if (!editor) return;

    // Prompt for filename
    const filename = window.prompt("ファイル名を入力してください", "document");
    if (!filename) return; // Cancelled

    const markdownStorage = (editor.storage as any).markdown;
    if (!markdownStorage) {
      console.warn('Markdown storage not available');
      return;
    }
    const md = markdownStorage.getMarkdown();
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="app-container">
      <Toolbar
        editor={editor}
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
        onImport={handleImport}
        onExport={handleExport}
      />
      <div className="workspace">
        <TiptapEditor
          content={markdown}
          onUpdate={() => {
            // We don't strictly need to sync state back to 'markdown' on every keystroke 
            // unless we want to persist it or debug.
            // We can just rely on editor instance for export.
          }}
          setEditor={setEditor}
        />
      </div>
    </div>
  );
}

export default App;
