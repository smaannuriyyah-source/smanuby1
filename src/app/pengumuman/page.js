'use client';

import { useEffect, useState, useCallback } from 'react';
import { Clock, FileText, Search, Megaphone } from 'lucide-react';

function Download(props) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
    );
}
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function PengumumanPage() {
    const [announcement, setAnnouncement] = useState(null);
    const [loading, setLoading] = useState(true);
    const [countdown, setCountdown] = useState(null);
    const [showContent, setShowContent] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [tableData, setTableData] = useState(null);

    useEffect(() => {
        fetchAnnouncement();
    }, []);

    const fetchAnnouncement = async () => {
        try {
            const response = await fetch('/api/public/announcements');
            const data = await response.json();
            if (data.announcement) {
                setAnnouncement(data.announcement);

                if (data.announcement.csv_data) {
                    try {
                        const parsed = JSON.parse(data.announcement.csv_data);
                        setTableData(parsed);
                    } catch (e) {
                        console.error('Failed to parse CSV data:', e);
                    }
                }

                if (data.announcement.countdown_date) {
                    const targetDate = new Date(data.announcement.countdown_date);
                    const now = new Date();
                    if (targetDate > now) {
                        setShowContent(false);
                        startCountdown(targetDate);
                    } else {
                        setShowContent(true);
                    }
                } else {
                    setShowContent(true);
                }
            }
        } catch (error) {
            console.error('Failed to fetch announcement:', error);
        } finally {
            setLoading(false);
        }
    };

    const startCountdown = (targetDate) => {
        const updateCountdown = () => {
            const now = new Date();
            const diff = targetDate - now;

            if (diff <= 0) {
                setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
                setShowContent(true);
                return;
            }

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            setCountdown({ days, hours, minutes, seconds });
        };

        updateCountdown();
        const interval = setInterval(updateCountdown, 1000);
        return () => clearInterval(interval);
    };

    const filteredRows = useCallback(() => {
        if (!tableData || !tableData.rows) return [];
        if (!searchTerm) return tableData.rows;
        const term = searchTerm.toLowerCase();
        return tableData.rows.filter(row =>
            Object.values(row).some(val => String(val).toLowerCase().includes(term))
        );
    }, [tableData, searchTerm]);

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    };

    if (loading) {
        return (
            <>
                <Navbar />
                <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F9FAFB' }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ width: '40px', height: '40px', border: '3px solid #E5E7EB', borderTopColor: '#16A34A', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }}></div>
                        <p style={{ color: '#6B7280' }}>Memuat pengumuman...</p>
                    </div>
                </div>
                <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
            </>
        );
    }

    if (!announcement) {
        return (
            <>
                <Navbar />
                <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F9FAFB', padding: '20px' }}>
                    <Megaphone size={64} style={{ color: '#D1D5DB', marginBottom: '20px' }} />
                    <h2 style={{ fontSize: '1.5rem', color: '#374151', marginBottom: '10px' }}>Belum Ada Pengumuman</h2>
                    <p style={{ color: '#6B7280', textAlign: 'center' }}>Saat ini tidak ada pengumuman yang dipublikasikan.</p>
                </div>
                <Footer />
            </>
        );
    }

    if (!showContent && countdown) {
        return (
            <>
                <Navbar />
                <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#111827', color: '#ffffff', padding: '20px' }}>
                    <div style={{ textAlign: 'center', maxWidth: '600px' }}>
                        <Clock size={48} style={{ color: '#F59E0B', marginBottom: '24px' }} />
                        <h1 style={{ fontSize: '2rem', fontFamily: 'var(--font-heading)', marginBottom: '12px' }}>{announcement.title}</h1>
                        <p style={{ fontSize: '1.1rem', color: '#9CA3AF', marginBottom: '48px' }}>Pengumuman akan tersedia dalam:</p>

                        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
                            {[
                                { value: countdown.days, label: 'Hari' },
                                { value: countdown.hours, label: 'Jam' },
                                { value: countdown.minutes, label: 'Menit' },
                                { value: countdown.seconds, label: 'Detik' }
                            ].map(item => (
                                <div key={item.label} style={{ backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', padding: '20px 24px', minWidth: '100px', backdropFilter: 'blur(10px)' }}>
                                    <div style={{ fontSize: '3rem', fontWeight: 700, lineHeight: 1, marginBottom: '8px' }}>{String(item.value).padStart(2, '0')}</div>
                                    <div style={{ fontSize: '0.85rem', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '1px' }}>{item.label}</div>
                                </div>
                            ))}
                        </div>

                        <p style={{ marginTop: '40px', color: '#6B7280', fontSize: '0.9rem' }}>Mohon tunggu hingga waktu yang ditentukan</p>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Navbar />
            <div style={{ minHeight: '80vh', backgroundColor: '#F9FAFB' }}>
                <div style={{ maxWidth: '900px', margin: '0 auto', padding: '120px 24px 60px' }}>
                    <div style={{
                        background: 'linear-gradient(135deg, #1e3a8a 0%, #111827 100%)',
                        borderRadius: '16px',
                        padding: '40px',
                        color: '#ffffff',
                        marginBottom: '40px',
                        position: 'relative',
                        overflow: 'hidden'
                    }}>
                        <div style={{ position: 'relative', zIndex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                                <Megaphone size={24} style={{ color: '#F59E0B' }} />
                                <span style={{ backgroundColor: '#F59E0B', color: '#111827', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>Pengumuman Resmi</span>
                            </div>
                            <h1 style={{ fontSize: '2rem', fontWeight: 700, fontFamily: 'var(--font-heading)', marginBottom: '12px', lineHeight: 1.3 }}>{announcement.title}</h1>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', color: '#9CA3AF', fontSize: '0.9rem' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Clock size={16} /> {formatDate(announcement.created_at)}</span>
                                {announcement.author_name && <span>Oleh: {announcement.author_name}</span>}
                            </div>
                        </div>
                    </div>

                    {announcement.content && (
                        <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '32px', marginBottom: '32px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                            <div dangerouslySetInnerHTML={{ __html: announcement.content }} style={{ lineHeight: 1.8, color: '#374151', fontSize: '1rem' }} />
                        </div>
                    )}

                    {announcement.pdf_url && (
                        <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '24px', marginBottom: '32px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <div style={{ width: '48px', height: '48px', backgroundColor: '#FEF3C7', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <FileText size={24} style={{ color: '#D97706' }} />
                                </div>
                                <div>
                                    <p style={{ fontWeight: 600, color: '#111827', marginBottom: '4px' }}>Dokumen Lampiran</p>
                                    <p style={{ fontSize: '0.85rem', color: '#6B7280' }}>Klik untuk mengunduh file PDF</p>
                                </div>
                            </div>
                            <a
                                href={announcement.pdf_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: '#2563EB', color: '#ffffff', padding: '10px 20px', borderRadius: '8px', textDecoration: 'none', fontWeight: 500, fontSize: '0.9rem' }}
                            >
                                <Download size={18} /> Download PDF
                            </a>
                        </div>
                    )}

                    {tableData && tableData.rows && tableData.rows.length > 0 && (
                        <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                                <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: '#111827' }}>Data Siswa</h3>
                                <div style={{ position: 'relative', width: '300px', maxWidth: '100%' }}>
                                    <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
                                    <input
                                        type="text"
                                        placeholder="Cari siswa..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        style={{ width: '100%', padding: '10px 12px 10px 40px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }}
                                    />
                                </div>
                            </div>

                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                                    <thead>
                                        <tr>
                                            <th style={{ padding: '12px 16px', backgroundColor: '#F9FAFB', borderBottom: '2px solid #E5E7EB', textAlign: 'left', fontWeight: 600, color: '#374151', whiteSpace: 'nowrap' }}>No</th>
                                            {tableData.headers.map((header, i) => (
                                                <th key={i} style={{ padding: '12px 16px', backgroundColor: '#F9FAFB', borderBottom: '2px solid #E5E7EB', textAlign: 'left', fontWeight: 600, color: '#374151', whiteSpace: 'nowrap' }}>{header}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredRows().map((row, i) => (
                                            <tr key={i} style={{ borderBottom: '1px solid #F3F4F6' }}>
                                                <td style={{ padding: '10px 16px', color: '#6B7280', whiteSpace: 'nowrap' }}>{i + 1}</td>
                                                {tableData.headers.map((header, j) => (
                                                    <td key={j} style={{ padding: '10px 16px', color: '#374151', whiteSpace: 'nowrap' }}>{row[header] || '-'}</td>
                                                ))}
                                            </tr>
                                        ))}
                                        {filteredRows().length === 0 && (
                                            <tr>
                                                <td colSpan={tableData.headers.length + 1} style={{ padding: '24px', textAlign: 'center', color: '#6B7280' }}>Tidak ada data yang sesuai pencarian</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            <div style={{ marginTop: '12px', fontSize: '0.85rem', color: '#6B7280', display: 'flex', justifyContent: 'space-between' }}>
                                <span>Menampilkan {filteredRows().length} dari {tableData.rows.length} data</span>
                                {searchTerm && (
                                    <button onClick={() => setSearchTerm('')} style={{ color: '#2563EB', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.85rem' }}>Reset Pencarian</button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </>
    );
}