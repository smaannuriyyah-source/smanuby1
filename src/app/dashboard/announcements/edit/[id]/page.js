'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin';
import { TRANSFORMERS } from '@lexical/markdown';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { TableCellNode, TableNode, TableRowNode } from '@lexical/table';
import { ListItemNode, ListNode } from '@lexical/list';
import { CodeHighlightNode, CodeNode } from '@lexical/code';
import { AutoLinkNode, LinkNode } from '@lexical/link';
import { $generateHtmlFromNodes, $generateNodesFromDOM } from '@lexical/html';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
    $getRoot,
    $insertNodes,
    $getSelection,
    $isRangeSelection,
    FORMAT_TEXT_COMMAND,
    FORMAT_ELEMENT_COMMAND
} from 'lexical';
import { $setBlocksType, $patchStyleText } from '@lexical/selection';
import { $createHeadingNode, $createQuoteNode } from '@lexical/rich-text';
import { INSERT_UNORDERED_LIST_COMMAND, INSERT_ORDERED_LIST_COMMAND } from '@lexical/list';
import { TOGGLE_LINK_COMMAND } from '@lexical/link';
import {
    ArrowLeft, Save, Bold, Italic, Underline, Strikethrough,
    Code, Link2, List, ListOrdered, Heading1, Heading2,
    Quote, Undo, Redo, Loader2, Upload, FileText, Clock, X, Table,
    AlignLeft, AlignCenter, AlignRight
} from 'lucide-react';

const theme = {
    paragraph: 'editor-paragraph',
    quote: 'editor-quote',
    heading: {
        h1: 'editor-heading-h1',
        h2: 'editor-heading-h2',
        h3: 'editor-heading-h3',
        h4: 'editor-heading-h4',
        h5: 'editor-heading-h5'
    },
    list: {
        nested: { listitem: 'editor-nested-listitem' },
        ol: 'editor-list-ol',
        ul: 'editor-list-ul',
        listitem: 'editor-listitem'
    },
    text: {
        bold: 'editor-text-bold',
        italic: 'editor-text-italic',
        underline: 'editor-text-underline',
        strikethrough: 'editor-text-strikethrough',
        code: 'editor-text-code'
    },
    code: 'editor-code',
    link: 'editor-link'
};

function onError(error) {
    console.error(error);
}

function CatchCancelPlugin() {
    const [editor] = useLexicalComposerContext();
    useEffect(() => {
        return editor.registerCommand(
            'CLEAR_EDITOR_COMMAND',
            () => {
                return window.confirm('Are you sure you want to clear the editor?');
            },
            0
        );
    }, [editor]);
    return null;
}

function ToolbarPlugin() {
    const [editor] = useLexicalComposerContext();

    const formatText = (format) => {
        editor.dispatchCommand(FORMAT_TEXT_COMMAND, format);
    };

    const formatAlign = (align) => {
        editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, align);
    };

    const applyFontSize = (size) => {
        editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
                $patchStyleText(selection, { 'font-size': size });
            }
        });
    };

    const insertLink = () => {
        const url = prompt('Enter URL:');
        if (url) {
            editor.dispatchCommand(TOGGLE_LINK_COMMAND, url);
        }
    };

    const formatHeading = (headingSize) => {
        editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
                $setBlocksType(selection, () => $createHeadingNode(headingSize));
            }
        });
    };

    const formatQuote = () => {
        editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
                $setBlocksType(selection, () => $createQuoteNode());
            }
        });
    };

    const insertList = (listType) => {
        if (listType === 'bullet') {
            editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND);
        } else {
            editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND);
        }
    };

    const buttonStyle = {
        padding: '8px 12px',
        border: '1px solid #D1D5DB',
        borderRadius: '6px',
        backgroundColor: '#fff',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        fontSize: '0.875rem',
        color: '#374151',
        transition: 'all 0.2s'
    };

    const selectStyle = {
        padding: '6px 8px',
        border: '1px solid #D1D5DB',
        borderRadius: '6px',
        backgroundColor: '#fff',
        cursor: 'pointer',
        fontSize: '0.8rem',
        color: '#374151'
    };

    return (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', padding: '12px', backgroundColor: '#fff', borderBottom: '1px solid #E5E7EB', position: 'sticky', top: 0, zIndex: 10 }}>
            <button onClick={() => editor.dispatchCommand('UNDO_COMMAND')} style={buttonStyle} title="Undo"><Undo size={16} /></button>
            <button onClick={() => editor.dispatchCommand('REDO_COMMAND')} style={buttonStyle} title="Redo"><Redo size={16} /></button>
            <div style={{ width: '1px', height: '24px', backgroundColor: '#E5E7EB', margin: '0 4px' }} />
            <button onClick={() => formatHeading('h1')} style={buttonStyle} title="Heading 1"><Heading1 size={16} /> H1</button>
            <button onClick={() => formatHeading('h2')} style={buttonStyle} title="Heading 2"><Heading2 size={16} /> H2</button>
            <button onClick={formatQuote} style={buttonStyle} title="Quote"><Quote size={16} /></button>
            <div style={{ width: '1px', height: '24px', backgroundColor: '#E5E7EB', margin: '0 4px' }} />
            <button onClick={() => formatText('bold')} style={buttonStyle} title="Bold"><Bold size={16} /></button>
            <button onClick={() => formatText('italic')} style={buttonStyle} title="Italic"><Italic size={16} /></button>
            <button onClick={() => formatText('underline')} style={buttonStyle} title="Underline"><Underline size={16} /></button>
            <button onClick={() => formatText('strikethrough')} style={buttonStyle} title="Strikethrough"><Strikethrough size={16} /></button>
            <button onClick={() => formatText('code')} style={buttonStyle} title="Inline Code"><Code size={16} /></button>
            <div style={{ width: '1px', height: '24px', backgroundColor: '#E5E7EB', margin: '0 4px' }} />
            <button onClick={() => formatAlign('left')} style={buttonStyle} title="Rata Kiri"><AlignLeft size={16} /></button>
            <button onClick={() => formatAlign('center')} style={buttonStyle} title="Rata Tengah"><AlignCenter size={16} /></button>
            <button onClick={() => formatAlign('right')} style={buttonStyle} title="Rata Kanan"><AlignRight size={16} /></button>
            <div style={{ width: '1px', height: '24px', backgroundColor: '#E5E7EB', margin: '0 4px' }} />
            <select onChange={(e) => applyFontSize(e.target.value)} defaultValue="" style={selectStyle} title="Ukuran Font">
                <option value="" disabled>Ukuran</option>
                <option value="">Normal</option>
                <option value="12px">12px</option>
                <option value="14px">14px</option>
                <option value="16px">16px</option>
                <option value="18px">18px</option>
                <option value="20px">20px</option>
                <option value="24px">24px</option>
                <option value="28px">28px</option>
                <option value="32px">32px</option>
                <option value="36px">36px</option>
                <option value="48px">48px</option>
            </select>
            <div style={{ width: '1px', height: '24px', backgroundColor: '#E5E7EB', margin: '0 4px' }} />
            <button onClick={insertLink} style={buttonStyle} title="Insert Link"><Link2 size={16} /> Link</button>
            <button onClick={() => insertList('bullet')} style={buttonStyle} title="Bullet List"><List size={16} /></button>
            <button onClick={() => insertList('numbered')} style={buttonStyle} title="Numbered List"><ListOrdered size={16} /></button>
        </div>
    );
}

function OnChangePlugin({ onChange }) {
    const [editor] = useLexicalComposerContext();
    useEffect(() => {
        return editor.registerUpdateListener(({ editorState }) => {
            editorState.read(() => {
                const htmlString = $generateHtmlFromNodes(editor, null);
                onChange(htmlString);
            });
        });
    }, [editor, onChange]);
    return null;
}

function LoadContentPlugin({ content }) {
    const [editor] = useLexicalComposerContext();
    const [isLoaded, setIsLoaded] = useState(false);
    useEffect(() => {
        if (content && !isLoaded) {
            editor.update(() => {
                const parser = new DOMParser();
                const dom = parser.parseFromString(content, 'text/html');
                const nodes = $generateNodesFromDOM(editor, dom);
                $getRoot().clear();
                $getRoot().select();
                $insertNodes(nodes);
            });
            setIsLoaded(true);
        }
    }, [editor, content, isLoaded]);
    return null;
}

const parseCSVLine = (line) => {
    const values = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            values.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }
    values.push(current.trim());
    return values;
};

const parseCSVText = (text) => {
    const lines = text.trim().split('\n');
    if (lines.length < 2) return null;
    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    const rows = [];
    for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]);
        if (values.length === headers.length) {
            const row = {};
            headers.forEach((header, index) => {
                row[header] = values[index];
            });
            rows.push(row);
        }
    }
    return { headers, rows };
};

export default function EditAnnouncementPage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id;
    const pdfInputRef = useRef(null);
    const csvInputRef = useRef(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        status: 'draft',
        countdown_date: ''
    });
    const [pdfFile, setPdfFile] = useState(null);
    const [csvFile, setCsvFile] = useState(null);
    const [csvPreview, setCsvPreview] = useState(null);
    const [existingPdfUrl, setExistingPdfUrl] = useState(null);
    const [existingCsvData, setExistingCsvData] = useState(null);
    const [removePdf, setRemovePdf] = useState(false);
    const [removeCsv, setRemoveCsv] = useState(false);

    const initialConfig = {
        namespace: 'AnnouncementEditor',
        theme,
        onError,
        nodes: [
            HeadingNode, ListNode, ListItemNode, QuoteNode,
            CodeNode, CodeHighlightNode, TableNode, TableCellNode,
            TableRowNode, AutoLinkNode, LinkNode
        ]
    };

    useEffect(() => {
        if (id) fetchAnnouncement();
    }, [id]);

    const fetchAnnouncement = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/announcements/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.announcement) {
                const ann = data.announcement;
                setFormData({
                    title: ann.title || '',
                    content: ann.content || '',
                    status: ann.status || 'draft',
                    countdown_date: ann.countdown_date ? ann.countdown_date.slice(0, 16) : ''
                });
                if (ann.pdf_url) {
                    setExistingPdfUrl(ann.pdf_url);
                }
                if (ann.csv_data) {
                    try {
                        const parsed = typeof ann.csv_data === 'string' ? JSON.parse(ann.csv_data) : ann.csv_data;
                        setExistingCsvData(parsed);
                    } catch (e) {
                        console.error('Failed to parse CSV data:', e);
                    }
                }
            }
        } catch (error) {
            console.error('Failed to fetch announcement:', error);
            alert('Gagal memuat pengumuman');
        } finally {
            setLoading(false);
        }
    };

    const handleContentChange = useCallback((html) => {
        setFormData(prev => ({ ...prev, content: html }));
    }, []);

    const handlePdfSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.type !== 'application/pdf') {
            alert('Hanya file PDF yang diizinkan');
            e.target.value = '';
            return;
        }
        setPdfFile(file);
        setRemovePdf(false);
        e.target.value = '';
    };

    const handleCsvSelect = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (!file.name.endsWith('.csv') && file.type !== 'text/csv') {
            alert('Hanya file CSV yang diizinkan');
            e.target.value = '';
            return;
        }
        setCsvFile(file);
        setRemoveCsv(false);
        try {
            const text = await file.text();
            const parsed = parseCSVText(text);
            if (parsed) {
                setCsvPreview(parsed);
            } else {
                alert('File CSV tidak valid atau kosong');
                setCsvFile(null);
            }
        } catch (error) {
            console.error('CSV parse error:', error);
            alert('Gagal membaca file CSV');
            setCsvFile(null);
        }
        e.target.value = '';
    };

    const handleSave = async () => {
        if (!formData.title) {
            alert('Judul pengumuman wajib diisi');
            return;
        }
        setSaving(true);
        try {
            const token = localStorage.getItem('token');
            const data = new FormData();
            data.append('title', formData.title);
            data.append('content', formData.content);
            data.append('status', formData.status);
            if (formData.countdown_date) {
                data.append('countdown_date', formData.countdown_date);
            } else {
                data.append('countdown_date', '');
            }
            if (pdfFile) {
                data.append('pdf', pdfFile);
            }
            if (removePdf) {
                data.append('remove_pdf', 'true');
            }
            if (csvFile) {
                data.append('csv', csvFile);
            }
            if (removeCsv) {
                data.append('remove_csv', 'true');
            }
            const response = await fetch(`/api/announcements/${id}`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` },
                body: data
            });
            const result = await response.json();
            if (result.error) {
                alert('Gagal: ' + result.error);
                return;
            }
            alert('Pengumuman berhasil diupdate');
            router.push('/dashboard/announcements');
        } catch (error) {
            console.error('Failed to update announcement:', error);
            alert('Gagal mengupdate pengumuman');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
                <Loader2 size={40} style={{ animation: 'spin 1s linear infinite', color: '#16A34A' }} />
            </div>
        );
    }

    const renderCsvTable = (csvData) => {
        if (!csvData || !csvData.headers) return null;
        return (
            <div style={{ overflowX: 'auto', borderRadius: '6px', border: '1px solid #E5E7EB' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#F9FAFB' }}>
                            {csvData.headers.map((h, i) => (
                                <th key={i} style={{ padding: '6px 8px', borderBottom: '1px solid #E5E7EB', textAlign: 'left', fontWeight: '600', color: '#374151' }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {csvData.rows.slice(0, 5).map((row, ri) => (
                            <tr key={ri}>
                                {csvData.headers.map((h, ci) => (
                                    <td key={ci} style={{ padding: '6px 8px', borderBottom: '1px solid #F3F4F6', color: '#6B7280' }}>{row[h]}</td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#F9FAFB' }}>
            <input type="file" ref={pdfInputRef} onChange={handlePdfSelect} accept=".pdf" style={{ display: 'none' }} />
            <input type="file" ref={csvInputRef} onChange={handleCsvSelect} accept=".csv" style={{ display: 'none' }} />

            <header style={{ backgroundColor: '#fff', borderBottom: '1px solid #E5E7EB', padding: '16px 24px', position: 'sticky', top: 0, zIndex: 20 }}>
                <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <Link href="/dashboard/announcements" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#374151', textDecoration: 'none', fontWeight: '500' }}>
                            <ArrowLeft size={20} /> Kembali
                        </Link>
                        <h1 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#111827', margin: 0 }}>Edit Pengumuman</h1>
                    </div>
                    <button onClick={handleSave} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#16A34A', color: '#fff', padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: saving ? 'not-allowed' : 'pointer', fontWeight: '500', opacity: saving ? 0.6 : 1 }}>
                        {saving ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={18} />}
                        {saving ? 'Menyimpan...' : 'Simpan'}
                    </button>
                </div>
            </header>

            <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '24px' }}>
                    <div style={{ backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                        <div style={{ padding: '24px', borderBottom: '1px solid #E5E7EB' }}>
                            <input
                                type="text"
                                placeholder="Masukkan judul pengumuman..."
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                style={{ width: '100%', fontSize: '2rem', fontWeight: '600', border: 'none', outline: 'none', color: '#111827', boxSizing: 'border-box' }}
                            />
                        </div>
                        <LexicalComposer initialConfig={initialConfig}>
                            <ToolbarPlugin />
                            <div style={{ position: 'relative', minHeight: '500px' }}>
                                <RichTextPlugin
                                    contentEditable={<ContentEditable style={{ minHeight: '500px', padding: '24px', outline: 'none', fontSize: '1rem', lineHeight: '1.75', color: '#374151' }} />}
                                    placeholder={<div style={{ position: 'absolute', top: '24px', left: '24px', color: '#9CA3AF', pointerEvents: 'none' }}>Tulis isi pengumuman...</div>}
                                    ErrorBoundary={LexicalErrorBoundary}
                                />
                                <OnChangePlugin onChange={handleContentChange} />
                                {formData.content && <LoadContentPlugin content={formData.content} />}
                                <CatchCancelPlugin />
                                <HistoryPlugin />
                                <LinkPlugin />
                                <ListPlugin />
                                <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
                            </div>
                        </LexicalComposer>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div style={{ backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '20px' }}>
                            <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>Status</h3>
                            <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '0.95rem', boxSizing: 'border-box' }}>
                                <option value="draft">Draft</option>
                                <option value="published">Published</option>
                            </select>
                        </div>

                        <div style={{ backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '20px' }}>
                            <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#111827', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}><FileText size={18} /> File PDF</h3>
                            {existingPdfUrl && !pdfFile && !removePdf ? (
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', backgroundColor: '#F0FDF4', borderRadius: '8px', border: '1px solid #BBF7D0' }}>
                                        <FileText size={20} style={{ color: '#16A34A', flexShrink: 0 }} />
                                        <span style={{ flex: 1, fontSize: '0.9rem', color: '#374151', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {existingPdfUrl.split('/').pop()}
                                        </span>
                                        <button onClick={() => { setRemovePdf(true); }} style={{ backgroundColor: 'transparent', border: 'none', cursor: 'pointer', color: '#9CA3AF', padding: '4px', display: 'flex' }}><X size={16} /></button>
                                    </div>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px', fontSize: '0.85rem', color: '#6B7280', cursor: 'pointer' }}>
                                        <input type="checkbox" checked={removePdf} onChange={(e) => setRemovePdf(e.target.checked)} style={{ cursor: 'pointer' }} />
                                        Hapus file PDF saat ini
                                    </label>
                                </div>
                            ) : pdfFile ? (
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', backgroundColor: '#F0FDF4', borderRadius: '8px', border: '1px solid #BBF7D0' }}>
                                        <FileText size={20} style={{ color: '#16A34A', flexShrink: 0 }} />
                                        <span style={{ flex: 1, fontSize: '0.9rem', color: '#374151', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{pdfFile.name}</span>
                                        <button onClick={() => { setPdfFile(null); if (existingPdfUrl) setRemovePdf(false); }} style={{ backgroundColor: 'transparent', border: 'none', cursor: 'pointer', color: '#9CA3AF', padding: '4px', display: 'flex' }}><X size={16} /></button>
                                    </div>
                                    {existingPdfUrl && (
                                        <p style={{ fontSize: '0.75rem', color: '#9CA3AF', marginTop: '4px' }}>File baru akan menggantikan file lama</p>
                                    )}
                                </div>
                            ) : removePdf ? (
                                <div>
                                    <div style={{ padding: '12px', backgroundColor: '#FEF2F2', borderRadius: '8px', border: '1px solid #FECACA', color: '#991B1B', fontSize: '0.9rem' }}>
                                        File PDF akan dihapus saat disimpan
                                    </div>
                                    <button onClick={() => { setRemovePdf(false); pdfInputRef.current?.click(); }} style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', backgroundColor: '#EFF6FF', color: '#2563EB', border: '1px solid #BFDBFE', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}>
                                        <Upload size={14} /> Upload PDF baru
                                    </button>
                                </div>
                            ) : (
                                <div onClick={() => pdfInputRef.current?.click()} style={{ border: '2px dashed #D1D5DB', borderRadius: '8px', padding: '30px 20px', textAlign: 'center', cursor: 'pointer', backgroundColor: '#F9FAFB', transition: 'all 0.2s' }}>
                                    <Upload size={32} style={{ color: '#9CA3AF', marginBottom: '8px' }} />
                                    <p style={{ color: '#6B7280', fontSize: '0.9rem', margin: 0 }}>Klik untuk upload PDF</p>
                                    <p style={{ color: '#9CA3AF', fontSize: '0.8rem', margin: '4px 0 0' }}>Format PDF saja</p>
                                </div>
                            )}
                        </div>

                        <div style={{ backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '20px' }}>
                            <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#111827', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}><Table size={18} /> File CSV</h3>
                            {existingCsvData && !csvFile && !removeCsv ? (
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', backgroundColor: '#FFF7ED', borderRadius: '8px', border: '1px solid #FED7AA', marginBottom: '12px' }}>
                                        <Table size={20} style={{ color: '#D97706', flexShrink: 0 }} />
                                        <span style={{ flex: 1, fontSize: '0.9rem', color: '#374151' }}>Data CSV</span>
                                        <span style={{ fontSize: '0.8rem', color: '#6B7280', flexShrink: 0 }}>{existingCsvData.rows ? existingCsvData.rows.length : 0} baris</span>
                                        <button onClick={() => { setRemoveCsv(true); }} style={{ backgroundColor: 'transparent', border: 'none', cursor: 'pointer', color: '#9CA3AF', padding: '4px', display: 'flex' }}><X size={16} /></button>
                                    </div>
                                    {renderCsvTable(existingCsvData)}
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px', fontSize: '0.85rem', color: '#6B7280', cursor: 'pointer' }}>
                                        <input type="checkbox" checked={removeCsv} onChange={(e) => setRemoveCsv(e.target.checked)} style={{ cursor: 'pointer' }} />
                                        Hapus data CSV saat ini
                                    </label>
                                </div>
                            ) : csvFile && csvPreview ? (
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', backgroundColor: '#FFF7ED', borderRadius: '8px', border: '1px solid #FED7AA', marginBottom: '12px' }}>
                                        <Table size={20} style={{ color: '#D97706', flexShrink: 0 }} />
                                        <span style={{ flex: 1, fontSize: '0.9rem', color: '#374151', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{csvFile.name}</span>
                                        <span style={{ fontSize: '0.8rem', color: '#6B7280', flexShrink: 0 }}>{csvPreview.rows.length} baris</span>
                                        <button onClick={() => { setCsvFile(null); setCsvPreview(null); if (existingCsvData) setRemoveCsv(false); }} style={{ backgroundColor: 'transparent', border: 'none', cursor: 'pointer', color: '#9CA3AF', padding: '4px', display: 'flex' }}><X size={16} /></button>
                                    </div>
                                    {renderCsvTable(csvPreview)}
                                    {existingCsvData && (
                                        <p style={{ fontSize: '0.75rem', color: '#9CA3AF', marginTop: '4px' }}>File baru akan menggantikan data lama</p>
                                    )}
                                </div>
                            ) : removeCsv ? (
                                <div>
                                    <div style={{ padding: '12px', backgroundColor: '#FEF2F2', borderRadius: '8px', border: '1px solid #FECACA', color: '#991B1B', fontSize: '0.9rem' }}>
                                        Data CSV akan dihapus saat disimpan
                                    </div>
                                    <button onClick={() => { setRemoveCsv(false); csvInputRef.current?.click(); }} style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', backgroundColor: '#EFF6FF', color: '#2563EB', border: '1px solid #BFDBFE', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}>
                                        <Upload size={14} /> Upload CSV baru
                                    </button>
                                </div>
                            ) : (
                                <div onClick={() => csvInputRef.current?.click()} style={{ border: '2px dashed #D1D5DB', borderRadius: '8px', padding: '30px 20px', textAlign: 'center', cursor: 'pointer', backgroundColor: '#F9FAFB', transition: 'all 0.2s' }}>
                                    <Upload size={32} style={{ color: '#9CA3AF', marginBottom: '8px' }} />
                                    <p style={{ color: '#6B7280', fontSize: '0.9rem', margin: 0 }}>Klik untuk upload CSV</p>
                                    <p style={{ color: '#9CA3AF', fontSize: '0.8rem', margin: '4px 0 0' }}>Format CSV saja</p>
                                </div>
                            )}
                        </div>

                        <div style={{ backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '20px' }}>
                            <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#111827', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}><Clock size={18} /> Tanggal & Waktu Countdown</h3>
                            <p style={{ fontSize: '0.8rem', color: '#6B7280', marginBottom: '12px' }}>Jika diisi, halaman pengumuman akan menampilkan hitung mundur sampai waktu ini. Kosongkan jika tidak perlu countdown.</p>
                            <input
                                type="datetime-local"
                                value={formData.countdown_date}
                                onChange={(e) => setFormData({ ...formData, countdown_date: e.target.value })}
                                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '0.95rem', boxSizing: 'border-box' }}
                            />
                        </div>
                    </div>
                </div>
            </main>

            <style>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .editor-paragraph { margin: 0 0 12px 0; }
                .editor-heading-h1 { font-size: 2em; font-weight: 700; margin: 16px 0; color: #111827; }
                .editor-heading-h2 { font-size: 1.5em; font-weight: 700; margin: 14px 0; color: #111827; }
                .editor-heading-h3 { font-size: 1.25em; font-weight: 600; margin: 12px 0; color: #111827; }
                .editor-quote { border-left: 4px solid #D1D5DB; padding-left: 16px; margin: 16px 0; color: #6B7280; font-style: italic; }
                .editor-list-ol, .editor-list-ul { margin: 12px 0; padding-left: 24px; }
                .editor-listitem { margin: 4px 0; }
                .editor-text-bold { font-weight: 700; }
                .editor-text-italic { font-style: italic; }
                .editor-text-underline { text-decoration: underline; }
                .editor-text-strikethrough { text-decoration: line-through; }
                .editor-text-code { background-color: #F3F4F6; padding: 2px 6px; border-radius: 4px; font-family: 'Courier New', monospace; font-size: 0.9em; }
                .editor-code { background-color: #1F2937; color: #F9FAFB; padding: 16px; border-radius: 8px; font-family: 'Courier New', monospace; overflow-x: auto; margin: 16px 0; }
                .editor-link { color: #2563EB; text-decoration: underline; cursor: pointer; }
                .editor-link:hover { color: #1D4ED8; }
            `}</style>
        </div>
    );
}