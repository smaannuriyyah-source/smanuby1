'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Eye, Trash2 } from 'lucide-react';

const thStyle = {
    padding: '16px',
    fontSize: '0.85rem',
    fontWeight: '600',
    color: '#374151',
    textTransform: 'uppercase',
    letterSpacing: '0.05em'
};

const tdStyle = {
    padding: '16px',
    fontSize: '0.95rem',
    color: '#4B5563'
};

export default function RegistrationsPage() {
    const router = useRouter();
    const [registrations, setRegistrations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewingStudent, setViewingStudent] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) { router.push('/login'); return; }
        fetchRegistrations();
    }, [router]);

    const fetchRegistrations = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/registrations', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.registrations) setRegistrations(data.registrations);
        } catch (error) {
            console.error('Failed to fetch registrations:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Yakin ingin menghapus data pendaftar ini?')) return;
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/registrations/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                setRegistrations(registrations.filter(reg => reg.id !== id));
                alert('Data berhasil dihapus');
            } else {
                alert('Gagal menghapus data');
            }
        } catch (error) {
            console.error('Failed to delete registration:', error);
            alert('Gagal menghapus data');
        }
    };

    return (
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '1.8rem', fontWeight: '700', color: '#111827', marginBottom: '30px' }}>Data Pendaftar PPDB</h2>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                    <Loader2 size={40} style={{ animation: 'spin 1s linear infinite', color: '#16A34A' }} />
                    <p style={{ color: '#6B7280', marginTop: '10px' }}>Memuat data...</p>
                </div>
            ) : (
                <div style={{ backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                                <tr>
                                    <th style={thStyle}>No</th>
                                    <th style={thStyle}>Nama Lengkap</th>
                                    <th style={thStyle}>NISN</th>
                                    <th style={thStyle}>Asal Sekolah</th>
                                    <th style={thStyle}>No WA Ortu</th>
                                    <th style={thStyle}>Tanggal Daftar</th>
                                    <th style={thStyle}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {registrations.length === 0 ? (
                                    <tr><td colSpan="7" style={{ padding: '20px', textAlign: 'center', color: '#6B7280' }}>Belum ada pendaftar.</td></tr>
                                ) : (
                                    registrations.map((reg, index) => (
                                        <tr key={reg.id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                                            <td style={tdStyle}>{index + 1}</td>
                                            <td style={{ ...tdStyle, fontWeight: '500', color: '#111827' }}>{reg.full_name}</td>
                                            <td style={tdStyle}>{reg.nisn || '-'}</td>
                                            <td style={tdStyle}>{reg.origin_school}</td>
                                            <td style={tdStyle}>{reg.phone_number}</td>
                                            <td style={tdStyle}>{new Date(reg.created_at).toLocaleDateString('id-ID')}</td>
                                            <td style={tdStyle}>
                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                    <button onClick={() => setViewingStudent(reg)} style={{ padding: '6px', backgroundColor: '#EFF6FF', color: '#2563EB', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Lihat Detail"><Eye size={16} /></button>
                                                    <button onClick={() => handleDelete(reg.id)} style={{ padding: '6px', backgroundColor: '#FEF2F2', color: '#DC2626', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Hapus"><Trash2 size={16} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {viewingStudent && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
                    <div style={{ backgroundColor: '#fff', borderRadius: '12px', width: '90%', maxWidth: '700px', maxHeight: '90vh', overflow: 'auto' }}>
                        <div style={{ padding: '20px', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, backgroundColor: '#fff', zIndex: 10 }}>
                            <h3 style={{ fontSize: '1.2rem', fontWeight: '600', color: '#111827' }}>Detail Pendaftar</h3>
                            <button onClick={() => setViewingStudent(null)} style={{ padding: '4px', backgroundColor: '#F3F4F6', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '1.2rem', width: '30px', height: '30px' }}>x</button>
                        </div>
                        <div style={{ padding: '20px' }}>
                            <div style={{ marginBottom: '30px' }}>
                                <h4 style={{ fontSize: '1rem', fontWeight: '600', color: '#111827', marginBottom: '15px', paddingBottom: '8px', borderBottom: '2px solid #E5E7EB' }}>Data Pribadi Siswa</h4>
                                <div style={{ display: 'grid', gap: '15px' }}>
                                    <div><p style={{ fontSize: '0.85rem', color: '#6B7280', marginBottom: '4px' }}>Nama Lengkap</p><p style={{ fontSize: '1.05rem', fontWeight: '600', color: '#111827' }}>{viewingStudent.full_name}</p></div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                        <div><p style={{ fontSize: '0.85rem', color: '#6B7280', marginBottom: '4px' }}>NISN</p><p style={{ fontSize: '1rem', color: '#111827' }}>{viewingStudent.nisn || '-'}</p></div>
                                        <div><p style={{ fontSize: '0.85rem', color: '#6B7280', marginBottom: '4px' }}>NIK</p><p style={{ fontSize: '1rem', color: '#111827' }}>{viewingStudent.nik || '-'}</p></div>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                        <div><p style={{ fontSize: '0.85rem', color: '#6B7280', marginBottom: '4px' }}>Tempat Lahir</p><p style={{ fontSize: '1rem', color: '#111827' }}>{viewingStudent.birth_place}</p></div>
                                        <div><p style={{ fontSize: '0.85rem', color: '#6B7280', marginBottom: '4px' }}>Tanggal Lahir</p><p style={{ fontSize: '1rem', color: '#111827' }}>{viewingStudent.birth_date ? new Date(viewingStudent.birth_date).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }) : '-'}</p></div>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                        <div><p style={{ fontSize: '0.85rem', color: '#6B7280', marginBottom: '4px' }}>Jenis Kelamin</p><p style={{ fontSize: '1rem', color: '#111827' }}>{viewingStudent.gender}</p></div>
                                        <div><p style={{ fontSize: '0.85rem', color: '#6B7280', marginBottom: '4px' }}>Agama</p><p style={{ fontSize: '1rem', color: '#111827' }}>{viewingStudent.religion}</p></div>
                                    </div>
                                </div>
                            </div>
                            <div style={{ marginBottom: '30px' }}>
                                <h4 style={{ fontSize: '1rem', fontWeight: '600', color: '#111827', marginBottom: '15px', paddingBottom: '8px', borderBottom: '2px solid #E5E7EB' }}>Data Orang Tua / Wali</h4>
                                <div style={{ display: 'grid', gap: '15px' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                        <div><p style={{ fontSize: '0.85rem', color: '#6B7280', marginBottom: '4px' }}>Nama Ayah Kandung</p><p style={{ fontSize: '1rem', color: '#111827' }}>{viewingStudent.father_name}</p></div>
                                        <div><p style={{ fontSize: '0.85rem', color: '#6B7280', marginBottom: '4px' }}>Nama Ibu Kandung</p><p style={{ fontSize: '1rem', color: '#111827' }}>{viewingStudent.mother_name}</p></div>
                                    </div>
                                    <div><p style={{ fontSize: '0.85rem', color: '#6B7280', marginBottom: '4px' }}>No. WhatsApp Orang Tua / Wali</p><p style={{ fontSize: '1rem', color: '#111827' }}>{viewingStudent.phone_number}</p></div>
                                    <div><p style={{ fontSize: '0.85rem', color: '#6B7280', marginBottom: '4px' }}>Alamat Lengkap</p><p style={{ fontSize: '1rem', color: '#111827', lineHeight: '1.6' }}>{viewingStudent.address}</p></div>
                                </div>
                            </div>
                            <div style={{ marginBottom: '30px' }}>
                                <h4 style={{ fontSize: '1rem', fontWeight: '600', color: '#111827', marginBottom: '15px', paddingBottom: '8px', borderBottom: '2px solid #E5E7EB' }}>Data Sekolah Asal</h4>
                                <div><p style={{ fontSize: '0.85rem', color: '#6B7280', marginBottom: '4px' }}>Asal Sekolah (SMP/MTs)</p><p style={{ fontSize: '1rem', color: '#111827' }}>{viewingStudent.origin_school}</p></div>
                            </div>
                            <div style={{ backgroundColor: '#F9FAFB', padding: '15px', borderRadius: '8px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                    <div><p style={{ fontSize: '0.85rem', color: '#6B7280', marginBottom: '4px' }}>Tanggal Pendaftaran</p><p style={{ fontSize: '0.95rem', color: '#111827' }}>{new Date(viewingStudent.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p></div>
                                    <div><p style={{ fontSize: '0.85rem', color: '#6B7280', marginBottom: '4px' }}>Status</p><span style={{ backgroundColor: '#DCFCE7', color: '#16A34A', padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600' }}>{viewingStudent.status || 'Baru'}</span></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}