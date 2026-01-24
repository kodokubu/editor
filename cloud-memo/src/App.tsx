import { BrowserRouter, Routes, Route, useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Markdown } from 'tiptap-markdown';
import { Moon, Sun, Bold, Italic, List, Heading1, Heading2, Home } from 'lucide-react';

// --- Landing Page ---

const LandingPage = () => {
    const [id, setId] = useState('');
    const navigate = useNavigate();

    const handleStart = () => {
        // 6文字以上
        const cleanId = id.trim().replace(/[^a-zA-Z0-9-]/g, '');
        if (cleanId.length >= 6) {
            navigate(`/${cleanId}`);
        } else {
            alert('IDは6文字以上の半角英数字で入力してください');
        }
    };

    return (
        <div className="main-content">
            <div className="landing">
                <h1>Cloud Memo</h1>
                <p>会員登録不要。好きなURLでメモを保存・共有できます。</p>

                <div className="id-input-group">
                    <span className="id-prefix">cloud-memo.pages.dev/</span>
                    <input
                        type="text"
                        className="id-input"
                        placeholder="お好きなID（6文字〜）"
                        value={id}
                        onChange={(e) => setId(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleStart()}
                        autoFocus
                    />
                    <button className="go-button" onClick={handleStart}>開始</button>
                </div>

                <div className="tips" style={{ marginTop: '3rem', fontSize: '0.85rem', color: '#71717a', textAlign: 'left' }}>
                    <h3>使い方のコツ</h3>
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        <li>• IDが分かれば誰でも編集できます。秘密のメモは長く複雑なIDにしましょう。</li>
                        <li>• インストール不要。PC、スマホ、どこからでも同じURLでアクセス可能です。</li>
                        <li>• Markdown記法に対応しており、リアルタイムで書式が反映されます。</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

// --- Editor Page ---

const EditorPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [saveStatus, setSaveStatus] = useState('保存済み');
    const [isDarkMode, setIsDarkMode] = useState(true);
    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: { levels: [1, 2, 3] },
            }),
            Markdown,
        ],
        content: '',
        onUpdate: ({ editor }) => {
            setSaveStatus('変更中...');

            if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

            saveTimeoutRef.current = setTimeout(async () => {
                const content = editor.storage.markdown.getMarkdown();
                try {
                    await fetch(`/api/notes/${id}`, {
                        method: 'POST',
                        body: JSON.stringify({ content }),
                        headers: { 'Content-Type': 'application/json' },
                    });
                    setSaveStatus('保存済み');
                } catch (e) {
                    setSaveStatus('保存失敗');
                }
            }, 1000);
        },
    });

    // Fetch initial content
    useEffect(() => {
        if (id && editor) {
            fetch(`/api/notes/${id}`)
                .then(res => res.json())
                .then(data => {
                    if (data.content) {
                        editor.commands.setContent(data.content);
                    } else {
                        // 新規メモの初期テキスト
                        editor.commands.setContent(`# ${id}\n\nここに入力してください。`);
                    }
                    setSaveStatus('保存済み');
                })
                .catch(() => setSaveStatus('読込失敗'));
        }
    }, [id, editor]);

    if (!editor) return null;

    return (
        <div className="app-container" data-theme={isDarkMode ? 'dark' : 'light'}>
            <header>
                <div className="logo-group" onClick={() => navigate('/')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Home size={20} />
                    <div className="logo">Cloud Memo</div>
                </div>
                <div className="id-display" style={{ fontSize: '0.9rem', opacity: 0.8 }}>ID: {id}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div className="save-status">{saveStatus}</div>
                    <button className="toolbar-button" onClick={() => setIsDarkMode(!isDarkMode)}>
                        {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                    </button>
                </div>
            </header>
            <main className="main-content">
                <div className="editor-surface">
                    <div className="toolbar">
                        <button
                            onClick={() => editor.chain().focus().toggleBold().run()}
                            className={`toolbar-button ${editor.isActive('bold') ? 'is-active' : ''}`}
                        >
                            <Bold size={18} />
                        </button>
                        <button
                            onClick={() => editor.chain().focus().toggleItalic().run()}
                            className={`toolbar-button ${editor.isActive('italic') ? 'is-active' : ''}`}
                        >
                            <Italic size={18} />
                        </button>
                        <button
                            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                            className={`toolbar-button ${editor.isActive('heading', { level: 1 }) ? 'is-active' : ''}`}
                        >
                            <Heading1 size={18} />
                        </button>
                        <button
                            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                            className={`toolbar-button ${editor.isActive('heading', { level: 2 }) ? 'is-active' : ''}`}
                        >
                            <Heading2 size={18} />
                        </button>
                        <button
                            onClick={() => editor.chain().focus().toggleBulletList().run()}
                            className={`toolbar-button ${editor.isActive('bulletList') ? 'is-active' : ''}`}
                        >
                            <List size={18} />
                        </button>
                    </div>
                    <EditorContent editor={editor} />
                </div>
            </main>
        </div>
    );
};

// --- App ---

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/:id" element={<EditorPage />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
