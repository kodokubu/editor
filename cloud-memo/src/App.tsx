import { BrowserRouter, Routes, Route, useNavigate, useParams, Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { common, createLowlight } from 'lowlight';
import { Download, Moon, Sun, Home, ChevronRight, Menu, X, Clock, Trash2, Upload } from 'lucide-react';
import { Extension } from '@tiptap/core';
import LinkExtension from '@tiptap/extension-link';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';

const lowlight = createLowlight(common);

// Wikiリンクデコレーション
const WikiLinkHighlighter = Extension.create({
    name: 'wikiLinkHighlighter',

    addProseMirrorPlugins() {
        return [
            new Plugin({
                key: new PluginKey('wikiLinkHighlighter'),
                state: {
                    init() {
                        return DecorationSet.empty;
                    },
                    apply(tr, set) {
                        set = set.map(tr.mapping, tr.doc);

                        const decorations: Decoration[] = [];
                        const regex = /\[\[([^\]]+)\]\]/g;

                        tr.doc.descendants((node, pos) => {
                            if (node.isText && node.text) {
                                let match;
                                while ((match = regex.exec(node.text)) !== null) {
                                    const from = pos + match.index;
                                    const to = from + match[0].length;
                                    const target = match[1];

                                    decorations.push(
                                        Decoration.inline(from, to, {
                                            class: 'wiki-link',
                                            'data-target': target,
                                        })
                                    );
                                }
                            }
                        });

                        return DecorationSet.create(tr.doc, decorations);
                    },
                },
                props: {
                    decorations(state) {
                        return this.getState(state);
                    },
                },
            }),
        ];
    },
});

// Markdown記法ハイライター
const MarkdownHighlighter = Extension.create({
    name: 'markdownHighlighter',

    addProseMirrorPlugins() {
        return [
            new Plugin({
                key: new PluginKey('markdownHighlighter'),
                state: {
                    init() {
                        return DecorationSet.empty;
                    },
                    apply(tr, set) {
                        set = set.map(tr.mapping, tr.doc);
                        const decorations: Decoration[] = [];

                        const patterns = [
                            { regex: /^#\s.*$/gm, class: 'md-h1' },
                            { regex: /^##\s.*$/gm, class: 'md-h2' },
                            { regex: /^###\s.*$/gm, class: 'md-h3' },
                            { regex: /\*\*([^*]+)\*\*/g, class: 'md-bold' },
                            { regex: /_([^_]+)_/g, class: 'md-italic' },
                            { regex: /^>\s.*$/gm, class: 'md-blockquote' },
                            { regex: /`([^`]+)`/g, class: 'md-code' },
                            { regex: /^-\s.*$/gm, class: 'md-list' },
                            { regex: /^\d+\.\s.*$/gm, class: 'md-list' },
                        ];

                        tr.doc.descendants((node, pos) => {
                            if (node.isText && node.text) {
                                patterns.forEach(({ regex, class: className }) => {
                                    let match;
                                    regex.lastIndex = 0;
                                    while ((match = regex.exec(node.text!)) !== null) {
                                        const from = pos + match.index;
                                        const to = from + match[0].length;

                                        decorations.push(Decoration.inline(from, to, { class: className }));

                                        if (className === 'md-bold') {
                                            decorations.push(Decoration.inline(from, from + 2, { class: 'md-symbol' }));
                                            decorations.push(Decoration.inline(to - 2, to, { class: 'md-symbol' }));
                                        } else if (className === 'md-italic' || className === 'md-code') {
                                            decorations.push(Decoration.inline(from, from + 1, { class: 'md-symbol' }));
                                            decorations.push(Decoration.inline(to - 1, to, { class: 'md-symbol' }));
                                        } else if (className.startsWith('md-h')) {
                                            const hashCount = className.endsWith('h1') ? 2 : className.endsWith('h2') ? 3 : 4;
                                            decorations.push(Decoration.inline(from, from + hashCount, { class: 'md-symbol' }));
                                        } else if (className === 'md-blockquote' || className === 'md-list') {
                                            const symbolMatch = match[0].match(/^(>|-|\d+\.)\s/);
                                            if (symbolMatch) {
                                                decorations.push(Decoration.inline(from, from + symbolMatch[0].length, { class: 'md-symbol' }));
                                            }
                                        }
                                    }
                                });
                            }
                        });

                        return DecorationSet.create(tr.doc, decorations);
                    },
                },
                props: {
                    decorations(state) {
                        return this.getState(state);
                    },
                },
            }),
        ];
    },
});

// --- Landing Page ---

const LandingPage = () => {
    const [id, setId] = useState('');
    const [history, setHistory] = useState<string[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        const savedHistory = localStorage.getItem('memo_history');
        if (savedHistory) setHistory(JSON.parse(savedHistory));
    }, []);

    const handleStart = () => {
        const cleanId = id.trim().replace(/[^a-zA-Z0-9-]/g, '');
        if (cleanId.length >= 6) {
            navigate(`/${cleanId}`);
        } else {
            alert('IDは6文字以上の半角英数字で入力してください');
        }
    };

    const deleteHistory = async (e: React.MouseEvent, targetId: string) => {
        e.preventDefault();
        e.stopPropagation();

        if (!window.confirm(`「${targetId}」を削除しますか？\nサーバー上のデータも完全に削除されます。この操作は取り消せません。`)) {
            return;
        }

        // APIで削除
        try {
            await fetch(`/api/notes/${targetId}`, { method: 'DELETE' });
        } catch (error) {
            console.error('Failed to delete from server:', error);
            // サーバー削除に失敗してもローカル履歴からは消す（あるいはエラーを表示する）
        }

        const newHistory = history.filter(item => item !== targetId);
        setHistory(newHistory);
        localStorage.setItem('memo_history', JSON.stringify(newHistory));
    };

    return (
        <div className="main-content">
            <div className="landing">
                <h1>Cloud Memo</h1>
                <p>会員登録不要。好きなURLでメモを保存・共有できます。</p>

                <div className="id-input-group">
                    <input
                        type="text"
                        className="id-input"
                        placeholder="お好きなID（6文字〜）"
                        value={id}
                        onChange={(e) => setId(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleStart()}
                        autoFocus
                    />
                    <button className="go-button" onClick={handleStart}>
                        <ChevronRight size={24} />
                    </button>
                </div>

                {history.length > 0 && (
                    <div className="recent-memos-landing" style={{ marginTop: '3rem', width: '100%', maxWidth: '500px', margin: '3rem auto 0 auto' }}>
                        <h3 style={{ fontSize: '0.9rem', color: '#71717a', marginBottom: '1rem', textAlign: 'left' }}>最近使ったメモ</h3>
                        <div className="history-list-landing" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {history.slice(0, 5).map(item => (
                                <Link key={item} to={`/${item}`} className="history-item" style={{ background: 'var(--sidebar-bg)' }}>
                                    <span className="history-id">{item}</span>
                                    <button className="delete-history" onClick={(e) => deleteHistory(e, item)}>
                                        <Trash2 size={14} />
                                    </button>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                <div className="tips" style={{ marginTop: '3rem', fontSize: '0.85rem', color: '#71717a', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <div>
                        <h3 style={{ marginBottom: '0.5rem', color: 'var(--text-color)' }}>🚀 使い方</h3>
                        <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                            <li>• 好きなID（6文字以上）を入力してスタート</li>
                            <li>• URLを共有すれば、誰とでも共同編集できます</li>
                            <li>• Markdown対応。太字やコードブロックも綺麗に書けます</li>
                        </ul>
                    </div>

                    <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                        <h3 style={{ marginBottom: '0.5rem', color: '#ef4444' }}>⚠️ 注意事項</h3>
                        <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.4rem', color: '#ef4444' }}>
                            <li>• IDを知っている人は<strong>誰でも閲覧・編集・削除</strong>が可能です</li>
                            <li>• パスワードや個人情報などの<strong>機密情報は絶対に書かない</strong>でください</li>
                            <li>• 誰に見られても問題ないメモとしてお使いください</li>
                        </ul>
                    </div>
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
    const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 1024);
    const [history, setHistory] = useState<string[]>([]);
    const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && editor) {
            // 上書き確認
            if (!editor.isEmpty && !window.confirm('現在のメモの内容は上書きされます。よろしいですか？')) {
                e.target.value = '';
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                const content = e.target?.result as string;
                editor.commands.setContent(content);
                // 変更を即時保存するためにトリガー
                editor.commands.focus();
            };
            reader.readAsText(file);
        }
        // Reset input
        e.target.value = '';
    };

    // Load and update history
    useEffect(() => {
        const savedHistory = localStorage.getItem('memo_history');
        let parsed: string[] = [];
        if (savedHistory) {
            parsed = JSON.parse(savedHistory);
        }

        if (id) {
            const newHistory = [id, ...parsed.filter((item: string) => item !== id)].slice(0, 20);
            setHistory(newHistory);
            localStorage.setItem('memo_history', JSON.stringify(newHistory));
        } else {
            setHistory(parsed);
        }
    }, [id]);

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: false,
                bold: false,
                italic: false,
                blockquote: false,
                code: false,
                bulletList: false,
                orderedList: false,
                codeBlock: false,
            }),
            LinkExtension.configure({
                openOnClick: true,
                autolink: true,
                defaultProtocol: 'https',
            }),
            CodeBlockLowlight.configure({
                lowlight,
            }),
            WikiLinkHighlighter,
            MarkdownHighlighter,
        ],
        content: '',
        onUpdate: ({ editor }) => {
            setSaveStatus('変更中...');
            if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
            saveTimeoutRef.current = setTimeout(async () => {
                const content = editor.getText({ blockSeparator: "\n" });
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
    }, [id, navigate]);

    useEffect(() => {
        if (id && editor) {
            fetch(`/api/notes/${id}`)
                .then(res => res.json())
                .then(data => {
                    if (data.content) {
                        editor.commands.setContent(data.content, { emitUpdate: false });
                    } else {
                        editor.commands.setContent(`# ${id}\n\nここにメモを書き始めてください。`, { emitUpdate: false });
                    }
                    setSaveStatus('保存済み');
                })
                .catch(() => setSaveStatus('読込失敗'));
        }
    }, [id, editor]);

    const deleteFromHistory = async (e: React.MouseEvent, targetId: string) => {
        e.preventDefault();
        e.stopPropagation();

        if (!window.confirm(`「${targetId}」を削除しますか？\nサーバー上のデータも完全に削除されます。この操作は取り消せません。`)) {
            return;
        }

        // APIで削除
        try {
            await fetch(`/api/notes/${targetId}`, { method: 'DELETE' });
        } catch (error) {
            console.error('Failed to delete from server:', error);
        }

        const newHistory = history.filter(item => item !== targetId);
        setHistory(newHistory);
        localStorage.setItem('memo_history', JSON.stringify(newHistory));
        if (targetId === id) navigate('/');
    };

    if (!editor) return null;

    const toggleMd = (prefix: string, suffix: string = '') => {
        if (!editor) return;
        const { from, to } = editor.state.selection;
        const text = editor.state.doc.textBetween(from, to, "\n");

        if (text.startsWith(prefix) && text.endsWith(suffix)) {
            // 解除
            const newText = text.slice(prefix.length, suffix.length ? -suffix.length : undefined);
            editor.chain().focus().insertContentAt({ from, to }, newText).run();
            // 選択範囲を戻す
            editor.chain().setTextSelection({ from, to: from + newText.length }).run();
        } else {
            // 付与
            const newText = `${prefix}${text}${suffix}`;
            editor.chain().focus().insertContentAt({ from, to }, newText).run();
            // 選択範囲を戻す（記号を含める）
            editor.chain().setTextSelection({ from, to: from + newText.length }).run();
        }
    };

    const downloadAsMarkdown = () => {
        if (!editor) return;
        const content = editor.getText({ blockSeparator: "\n" });
        const blob = new Blob([content], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${id || 'memo'}.md`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const guideItems = [
        { label: '見出し 1', symbol: '#', action: () => toggleMd('# ') },
        { label: '見出し 2', symbol: '##', action: () => toggleMd('## ') },
        { label: '**太字**', symbol: '**', action: () => toggleMd('**', '**') },
        { label: 'リスト', symbol: '-', action: () => toggleMd('- ') },
        { label: '引用', symbol: '>', action: () => toggleMd('> ') },
        { label: 'コード', symbol: '`', action: () => toggleMd('`', '`') },
    ];

    return (
        <div className="app-container" data-theme={isDarkMode ? 'dark' : 'light'}>
            {/* History Sidebar */}
            <aside className={`history-sidebar ${isSidebarOpen ? '' : 'closed'}`}>
                <div className="sidebar-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Clock size={16} />
                        <span>Recent Memos</span>
                    </div>
                    {window.innerWidth <= 800 && (
                        <button className="sidebar-toggle" onClick={() => setIsSidebarOpen(false)}>
                            <X size={20} />
                        </button>
                    )}
                </div>
                <div className="history-list">
                    {history.map(item => (
                        <Link
                            key={item}
                            to={`/${item}`}
                            className={`history-item ${item === id ? 'active' : ''}`}
                            onClick={() => window.innerWidth <= 800 && setIsSidebarOpen(false)}
                        >
                            <span className="history-id">{item}</span>
                            <button className="delete-history" onClick={(e) => deleteFromHistory(e, item)}>
                                <Trash2 size={14} />
                            </button>
                        </Link>
                    ))}
                    {history.length === 0 && (
                        <div style={{ padding: '2rem', textAlign: 'center', fontSize: '0.8rem', color: '#52525b' }}>
                            履歴はありません
                        </div>
                    )}
                </div>
            </aside>

            {/* Mobile Overlay */}
            {isSidebarOpen && window.innerWidth <= 800 && (
                <div
                    onClick={() => setIsSidebarOpen(false)}
                    style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1500, backdropFilter: 'blur(4px)' }}
                ></div>
            )}

            <div className="main-wrapper">
                <header>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <button className="sidebar-toggle" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                            {isSidebarOpen && window.innerWidth > 800 ? <X size={20} /> : <Menu size={20} />}
                        </button>
                        <div className="logo-group" onClick={() => navigate('/')}>
                            <Home size={18} />
                            <div className="logo">Cloud Memo</div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div className="save-status">{saveStatus}</div>
                        <input
                            type="file"
                            ref={fileInputRef}
                            style={{ display: 'none' }}
                            accept=".md,.txt,.markdown"
                            onChange={handleImport}
                        />
                        <button className="download-button" onClick={() => fileInputRef.current?.click()} title="ファイルをインポート">
                            <Upload size={18} />
                        </button>
                        <button className="download-button" onClick={downloadAsMarkdown} title="Markdownでダウンロード">
                            <Download size={18} />
                        </button>
                        <button className="toolbar-button" onClick={() => setIsDarkMode(!isDarkMode)}>
                            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                        </button>
                    </div>
                </header>

                <main className="main-content">
                    <div
                        className="editor-surface"
                        onClick={(e) => {
                            const target = e.target as HTMLElement;
                            if (target.classList.contains('wiki-link')) {
                                e.preventDefault();
                                const linkTarget = target.getAttribute('data-target') || target.textContent?.replace(/\[\[|\]\]/g, '');
                                if (linkTarget) {
                                    navigate(`/${linkTarget}`);
                                }
                            }
                        }}
                    >
                        <EditorContent editor={editor} />
                    </div>
                </main>

                <aside className="help-sidebar">
                    <h4>Format Guide</h4>
                    <div className="guide-list">
                        {guideItems.map((item, idx) => (
                            <button key={idx} className="guide-item" onClick={item.action}>
                                <span className="guide-symbol">{item.symbol}</span>
                                <span>{item.label}</span>
                            </button>
                        ))}
                    </div>
                </aside>
            </div>
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
